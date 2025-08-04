import React from 'react';

const Results = ({ poll, totalVotes }) => {
  return (
    <div className="results-container">
      <h4 className="results-title">Live Results ({totalVotes} votes)</h4>
      
      {poll.options.map((option) => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        
        return (
          <div key={option.id} className="result-item">
            <div className="result-header">
              <span className="option-name">{option.text}</span>
              <span className="vote-count">{option.votes} votes ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Results;
