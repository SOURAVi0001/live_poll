import React from 'react';
import Poll from './Poll';

const PollList = ({ polls, onVote, userVotes, userName, userCount }) => {
  return (
    <div className="poll-list-container">
      <div className="header">
        <h1>Live Polling System</h1>
        <div className="user-info">
          <span className="welcome-text">Welcome, {userName}!</span>
          <span className="user-count">{userCount} users online</span>
        </div>
      </div>
      
      {polls.length === 0 ? (
        <div className="no-polls">
          <p>No active polls available at the moment.</p>
        </div>
      ) : (
        <div className="polls-grid">
          {polls.map((poll) => (
            <Poll
              key={poll.id}
              poll={poll}
              onVote={onVote}
              userVotes={userVotes}
              userName={userName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PollList;
