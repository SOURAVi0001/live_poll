import React, { useState, useEffect, useRef } from 'react';
import SocketService from '../services/socket';

const Chat = ({ userName, isVisible, onToggleVisible }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    SocketService.onChatHistory((history) => {
      setMessages(history);
    });

    SocketService.onNewChatMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    SocketService.onNewQuestion((question) => {
      setQuestions(prev => [...prev, question]);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      SocketService.sendChatMessage({ text: newMessage.trim() });
      setNewMessage('');
    }
  };

  const submitQuestion = (e) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      SocketService.submitQuestion({ text: newQuestion.trim() });
      setNewQuestion('');
    }
  };

  if (!isVisible) {
    return (
      <button className="chat-toggle" onClick={onToggleVisible}>
        💬
      </button>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-tabs">
          <button 
            className={activeTab === 'chat' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('chat')}
          >
            Chat ({messages.length})
          </button>
          <button 
            className={activeTab === 'qa' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('qa')}
          >
            Q&A ({questions.length})
          </button>
        </div>
        <button className="chat-close" onClick={onToggleVisible}>×</button>
      </div>

      {activeTab === 'chat' ? (
        <div className="chat-content">
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className="message">
                <div className="message-header">
                  <span className="message-user">{message.user}</span>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
              maxLength={500}
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
        </div>
      ) : (
        <div className="qa-content">
          <div className="questions-container">
            {questions.map((question) => (
              <div key={question.id} className="question">
                <div className="question-header">
                  <span className="question-user">{question.user}</span>
                  <span className="question-time">
                    {new Date(question.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="question-text">{question.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={submitQuestion} className="question-form">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="question-input"
              rows="3"
              maxLength={1000}
            />
            <button type="submit" className="submit-question-btn">
              Submit Question
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
