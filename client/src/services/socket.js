import io from 'socket.io-client';

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(ENDPOINT);
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  registerUser(userData) {
    if (this.socket) {
      this.socket.emit('registerUser', userData);
    }
  }

  vote(voteData) {
    if (this.socket) {
      this.socket.emit('vote', voteData);
    }
  }

  wordCloudVote(voteData) {
    if (this.socket) {
      this.socket.emit('wordCloudVote', voteData);
    }
  }

  createPoll(pollData) {
    if (this.socket) {
      this.socket.emit('createPoll', pollData);
    }
  }

  sendChatMessage(messageData) {
    if (this.socket) {
      this.socket.emit('chatMessage', messageData);
    }
  }

  submitQuestion(questionData) {
    if (this.socket) {
      this.socket.emit('submitQuestion', questionData);
    }
  }

  onPollsData(callback) {
    if (this.socket) {
      this.socket.on('pollsData', callback);
    }
  }

  onPollUpdate(callback) {
    if (this.socket) {
      this.socket.on('pollUpdate', callback);
    }
  }

  onPollCreated(callback) {
    if (this.socket) {
      this.socket.on('pollCreated', callback);
    }
  }

  onUserCount(callback) {
    if (this.socket) {
      this.socket.on('userCount', callback);
    }
  }

  onVoteError(callback) {
    if (this.socket) {
      this.socket.on('voteError', callback);
    }
  }

  onChatHistory(callback) {
    if (this.socket) {
      this.socket.on('chatHistory', callback);
    }
  }

  onNewChatMessage(callback) {
    if (this.socket) {
      this.socket.on('newChatMessage', callback);
    }
  }

  onNewQuestion(callback) {
    if (this.socket) {
      this.socket.on('newQuestion', callback);
    }
  }

  onWordCloudUpdate(callback) {
    if (this.socket) {
      this.socket.on('wordCloudUpdate', callback);
    }
  }
}

export default new SocketService();
