import React, { useState, useEffect } from 'react';
import SocketService from '../services/socket';

const WordCloud = ({ poll, onVote, userVotes, userName }) => {
  const [word, setWord] = useState('');
  const [words, setWords] = useState([]);
  const [hasVoted, setHasVoted] = useState(userVotes[poll.id] || false);

  useEffect(() => {
    SocketService.onWordCloudUpdate((data) => {
      if (data.pollId === poll.id) {
        setWords(data.words);
      }
    });
  }, [poll.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (word.trim() && !hasVoted) {
      SocketService.wordCloudVote({
        pollId: poll.id,
        word: word.trim().toLowerCase(),
        sessionId: sessionStorage.getItem('pollSessionId')
      });
      setHasVoted(true);
      setWord('');
    }
  };

  const getFontSize = (count) => {
    const maxCount = Math.max(...words.map(w => w[1]));
    const minSize = 14;
    const maxSize = 36;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  return (
    <div className="poll-container">
      <h3 className="poll-question">{poll.question}</h3>
      
      {!hasVoted ? (
        <form onSubmit={handleSubmit} className="word-cloud-input">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word..."
            className="word-input"
            maxLength={50}
            required
          />
          <button type="submit" className="vote-btn">
            Submit Word
          </button>
        </form>
      ) : (
        <p className="voted-message">✓ Thank you for your contribution, {userName}!</p>
      )}

      <div className="word-cloud-display">
        {words.map(([wordText, count]) => (
          <span
            key={wordText}
            className="word-cloud-item"
            style={{ fontSize: `${getFontSize(count)}px` }}
            title={`${wordText}: ${count} votes`}
          >
            {wordText}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordCloud;
