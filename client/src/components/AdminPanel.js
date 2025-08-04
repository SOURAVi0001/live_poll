import React, { useState, useEffect } from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import PollCreator from './PollCreator';

const AdminPanel = ({ isAdmin, sessionId, onToggleAdmin }) => {
  const [activeTab, setActiveTab] = useState('create');
  const [polls, setPolls] = useState([]);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(!isAdmin);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      onToggleAdmin(true);
      setShowPasswordInput(false);
    } else {
      alert('Invalid admin password');
    }
  };

  const fetchPolls = async () => {
    try {
      const response = await fetch('/api/polls');
      const data = await response.json();
      setPolls(data);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPolls();
    }
  }, [isAdmin]);

  if (showPasswordInput) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h3>Admin Access</h3>
          <form onSubmit={handleAdminLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="admin-password-input"
              required
            />
            <button type="submit" className="admin-login-btn">
              Login
            </button>
          </form>
          <p className="admin-hint">Default password: admin123</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <div className="admin-tabs">
          <button 
            className={activeTab === 'create' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('create')}
          >
            Create Poll
          </button>
          <button 
            className={activeTab === 'manage' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('manage')}
          >
            Manage Polls ({polls.length})
          </button>
          <button 
            className={activeTab === 'qr' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('qr')}
          >
            QR Code
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'create' && (
          <PollCreator onPollCreated={fetchPolls} />
        )}

        {activeTab === 'manage' && (
          <div className="poll-management">
            <h3>Active Polls</h3>
            {polls.map(poll => (
              <div key={poll.id} className="poll-management-item">
                <div className="poll-info">
                  <h4>{poll.question}</h4>
                  <span className="poll-type">Type: {poll.type}</span>
                  <span className="poll-votes">
                    {poll.options?.reduce((sum, opt) => sum + opt.votes, 0) || 0} votes
                  </span>
                </div>
                <div className="poll-actions">
                  <button className="btn-primary">View Results</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'qr' && (
          <QRCodeDisplay sessionId={sessionId} />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
