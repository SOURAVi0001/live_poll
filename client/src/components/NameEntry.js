import React, { useState } from 'react';

const NameEntry = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() || anonymous) {
      onNameSubmit(anonymous ? 'Anonymous User' : name.trim(), anonymous);
    }
  };

  return (
    <div className="name-entry-container">
      <div className="name-entry-card">
        <h2>Welcome to Live Polling System</h2>
        <p>Please enter your name to participate in polls</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
            maxLength={50}
            disabled={anonymous}
            required={!anonymous}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            Join anonymously
          </label>
          <button type="submit" className="submit-btn">
            Join Polling
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameEntry;
