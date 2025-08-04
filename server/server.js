const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage
let polls = [
  {
    id: '1',
    question: 'What is your favorite programming language?',
    options: [
      { id: 'a', text: 'JavaScript', votes: 0 },
      { id: 'b', text: 'Python', votes: 0 },
      { id: 'c', text: 'Java', votes: 0 },
      { id: 'd', text: 'C++', votes: 0 }
    ],
    type: 'multiple_choice',
    active: true,
    settings: { anonymous: true, showResults: 'after_vote' },
    createdAt: new Date()
  },
  {
    id: '2',
    question: 'Which framework do you prefer for web development?',
    options: [
      { id: 'a', text: 'React', votes: 0 },
      { id: 'b', text: 'Angular', votes: 0 },
      { id: 'c', text: 'Vue.js', votes: 0 },
      { id: 'd', text: 'Svelte', votes: 0 }
    ],
    type: 'multiple_choice',
    active: true,
    settings: { anonymous: true, showResults: 'after_vote' },
    createdAt: new Date()
  }
];

let users = {};
let userVotes = {};
let chatMessages = [];
let questions = [];

// Templates
const pollTemplates = [
  {
    id: 'feedback',
    name: 'Event Feedback',
    category: 'feedback',
    questions: [{
      question: 'How would you rate this event?',
      type: 'rating',
      options: ['1', '2', '3', '4', '5']
    }]
  },
  {
    id: 'icebreaker',
    name: 'Team Icebreaker',
    category: 'engagement',
    questions: [{
      question: 'What\'s your favorite work-from-home snack?',
      type: 'multiple_choice',
      options: ['Coffee', 'Cookies', 'Fruit', 'Nuts', 'Other']
    }]
  }
];

// Rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000;
const MAX_VOTES_PER_WINDOW = 10;

function rateLimitMiddleware(socket, next) {
  const ip = socket.handshake.address;
  const now = Date.now();
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const limit = rateLimit.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (limit.count >= MAX_VOTES_PER_WINDOW) {
    return next(new Error('Rate limit exceeded'));
  }
  
  limit.count++;
  next();
}

// API Routes
app.get('/api/polls', (req, res) => {
  res.json(polls.filter(poll => poll.active));
});

app.post('/api/polls', (req, res) => {
  const { question, options, type, settings } = req.body;
  const newPoll = {
    id: uuidv4(),
    question,
    options: options.map((option, index) => ({
      id: String.fromCharCode(97 + index),
      text: option,
      votes: 0
    })),
    type: type || 'multiple_choice',
    active: true,
    settings: settings || { anonymous: true, showResults: 'after_vote' },
    createdAt: new Date()
  };
  polls.push(newPoll);
  io.emit('pollCreated', newPoll);
  res.json(newPoll);
});

app.get('/api/templates', (req, res) => {
  res.json(pollTemplates);
});

app.get('/api/qrcode/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const url = `${req.protocol}://${req.get('host')}?session=${sessionId}`;
    const qrCode = await QRCode.toDataURL(url);
    res.json({ qrCode, url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Socket.io
io.use(rateLimitMiddleware);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('registerUser', (userData) => {
    users[socket.id] = {
      id: socket.id,
      name: userData.name,
      sessionId: userData.sessionId,
      anonymous: userData.anonymous || false,
      joinedAt: new Date(),
      theme: userData.theme || 'default'
    };
    
    socket.emit('pollsData', polls.filter(poll => poll.active));
    socket.emit('chatHistory', chatMessages.slice(-50));
    io.emit('userCount', Object.keys(users).length);
  });

  socket.on('vote', (voteData) => {
    const { pollId, optionId, userId, sessionId } = voteData;
    
    const voteKey = `${sessionId}-${pollId}`;
    if (userVotes[voteKey]) {
      socket.emit('voteError', 'You have already voted for this poll');
      return;
    }
    
    const poll = polls.find(p => p.id === pollId);
    if (poll && poll.active) {
      const option = poll.options.find(o => o.id === optionId);
      if (option) {
        option.votes += 1;
        userVotes[voteKey] = { pollId, optionId, votedAt: new Date() };
        io.emit('pollUpdate', poll);
      }
    }
  });

  socket.on('wordCloudVote', (data) => {
    const { pollId, word, sessionId } = data;
    const voteKey = `${sessionId}-${pollId}`;
    
    if (userVotes[voteKey]) {
      socket.emit('voteError', 'You have already submitted a word');
      return;
    }
    
    const poll = polls.find(p => p.id === pollId);
    if (poll && poll.type === 'word_cloud') {
      if (!poll.words) poll.words = new Map();
      
      const currentCount = poll.words.get(word) || 0;
      poll.words.set(word, currentCount + 1);
      
      userVotes[voteKey] = { pollId, word, votedAt: new Date() };
      io.emit('wordCloudUpdate', { pollId, words: Array.from(poll.words.entries()) });
    }
  });

  socket.on('chatMessage', (messageData) => {
    const user = users[socket.id];
    if (!user) return;
    
    const message = {
      id: uuidv4(),
      user: user.anonymous ? 'Anonymous' : user.name,
      text: messageData.text,
      timestamp: new Date(),
      userId: user.anonymous ? null : socket.id
    };
    
    chatMessages.push(message);
    if (chatMessages.length > 100) {
      chatMessages = chatMessages.slice(-100);
    }
    
    io.emit('newChatMessage', message);
  });

  socket.on('submitQuestion', (questionData) => {
    const user = users[socket.id];
    if (!user) return;
    
    const question = {
      id: uuidv4(),
      user: user.anonymous ? 'Anonymous' : user.name,
      text: questionData.text,
      timestamp: new Date(),
      votes: 0,
      answered: false
    };
    
    questions.push(question);
    io.emit('newQuestion', question);
  });

  socket.on('createPoll', (pollData) => {
    const newPoll = {
      id: uuidv4(),
      question: pollData.question,
      options: pollData.options.map((option, index) => ({
        id: String.fromCharCode(97 + index),
        text: option,
        votes: 0
      })),
      type: pollData.type || 'multiple_choice',
      active: true,
      settings: pollData.settings || { anonymous: true, showResults: 'after_vote' },
      createdAt: new Date()
    };
    
    polls.push(newPoll);
    io.emit('pollCreated', newPoll);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete users[socket.id];
    io.emit('userCount', Object.keys(users).length);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

