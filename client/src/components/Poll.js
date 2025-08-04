import React, { useState } from 'react';
import Results from './Results';
import WordCloud from './WordCloud';

const Poll = ({ poll, onVote, userVotes, userName }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [textResponse, setTextResponse] = useState('');
  const [hasVoted, setHasVoted] = useState(userVotes[poll.id] || false);

  const handleVote = () => {
    if ((selectedOption || textResponse) && !hasVoted) {
      if (poll.type === 'text') {
        // Handle text response
        onVote(poll.id, 'text', textResponse);
      } else {
        onVote(poll.id, selectedOption);
      }
      setHasVoted(true);
    }
  };

  const totalVotes = poll.options?.reduce((sum, option) => sum + option.votes, 0) || 0;

  if (poll.type === 'word_cloud') {
    return <WordCloud poll={poll} onVote={onVote} userVotes={userVotes} userName={userName} />;
  }

  return (
    <div className="poll-container">
      <h3 className="poll-question">{poll.question}</h3>
      
      {!hasVoted ? (
        <div className="poll-options">
          {poll.type === 'text' ? (
            <div className="text-response">
              <textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Type your response here..."
                className="text-input"
                rows="4"
                maxLength={500}
              />
              <button 
                onClick={handleVote}
                disabled={!textResponse.trim()}
                className="vote-btn"
              >
                Submit Response
              </button>
            </div>
          ) : poll.type === 'rating' ? (
            <div className="rating-options">
              {poll.options.map((option) => (
                <label key={option.id} className="rating-option">
                  <input
                    type="radio"
                    name={`poll-${poll.id}`}
                    value={option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="rating-radio"
                  />
                  <span className="rating-star">★</span>
                  <span className="rating-text">{option.text}</span>
                </label>
              ))}
              <button 
                onClick={handleVote}
                disabled={!selectedOption}
                className="vote-btn"
              >
                Submit Rating
              </button>
            </div>
          ) : (
            <>
              {poll.options.map((option) => (
                <div key={option.id} className="option-item">
                  <label className="option-label">
                    <input
                      type="radio"
                      name={`poll-${poll.id}`}
                      value={option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="option-radio"
                    />
                    <span className="option-text">{option.text}</span>
                  </label>
                </div>
              ))}
              <button 
                onClick={handleVote}
                disabled={!selectedOption}
                className="vote-btn"
              >
                Submit Vote
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="poll-results">
          <p className="voted-message">✓ Thank you for voting, {userName}!</p>
          {poll.settings?.showResults !== 'never' && (
            <Results poll={poll} totalVotes={totalVotes} />
          )}
        </div>
      )}
    </div>
  );
};

export default Poll;
