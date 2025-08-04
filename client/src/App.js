import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SocketService from './services/socket';
import NameEntry from './components/NameEntry';
import PollList from './components/PollList';
import AdminPanel from './components/AdminPanel';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [userName, setUserName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [polls, setPolls] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [userCount, setUserCount] = useState(0);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const existingSessionId = sessionStorage.getItem('pollSessionId');
    const newSessionId = existingSessionId || uuidv4();
    
    if (!existingSessionId) {
      sessionStorage.setItem('pollSessionId', newSessionId);
    }
    
    setSessionId(newSessionId);

    const existingUserName = sessionStorage.getItem('pollUserName');
    if (existingUserName) {
      setUserName(existingUserName);
      connectSocket(existingUserName, newSessionId);
    }

    return () => {
      SocketService.disconnect();
    };
  }, []);

  const connectSocket = (name, sessId, anonymous = false) => {
    SocketService.connect();

    SocketService.registerUser({
      name: name,
      sessionId: sessId,
      anonymous: anonymous
    });

    SocketService.onPollsData((pollsData) => {
      setPolls(pollsData);
    });

    SocketService.onPollUpdate((updatedPoll) => {
      setPolls(prevPolls => 
        prevPolls.map(poll => 
          poll.id === updatedPoll.id ? updatedPoll : poll
        )
      );
    });

    SocketService.onPollCreated((newPoll) => {
      setPolls(prevPolls => [...prevPolls, newPoll]);
    });

    SocketService.onUserCount((count) => {
      setUserCount(count);
    });

    SocketService.onVoteError((errorMessage) => {
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    });
  };

  const handleNameSubmit = (name, anonymous = false) => {
    setUserName(name);
    sessionStorage.setItem('pollUserName', name);
    connectSocket(name, sessionId, anonymous);
  };

  const handleVote = (pollId, optionId, textResponse = '') => {
    SocketService.vote({
      pollId,
      optionId,
      userId: sessionId,
      sessionId: sessionId,
      textResponse
    });

    setUserVotes(prev => ({
      ...prev,
      [pollId]: true
    }));
  };

  if (!userName) {
    return <NameEntry onNameSubmit={handleNameSubmit} />;
  }

  return (
    <div className="App">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Admin Toggle Button */}
      <button 
        className="admin-toggle"
        onClick={() => setShowAdminPanel(!showAdminPanel)}
      >
        {showAdminPanel ? 'Hide Admin' : 'Show Admin'}
      </button>

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel 
          isAdmin={isAdmin}
          sessionId={sessionId}
          onToggleAdmin={setIsAdmin}
        />
      )}
      
      {/* Main Poll List */}
      <PollList
        polls={polls}
        onVote={handleVote}
        userVotes={userVotes}
        userName={userName}
        userCount=  {userCount}
      />

      {/* Chat Component */}
      <Chat 
        userName={userName}
        isVisible={showChat}
        onToggleVisible={() => setShowChat(!showChat)}
      />
    </div>
  );
}

export default App;
