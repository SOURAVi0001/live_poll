import React, { useState, useEffect } from 'react';
import SocketService from '../services/socket';

const PollCreator = ({ onPollCreated }) => {
  const [pollType, setPollType] = useState('multiple_choice');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!question.trim() || (pollType !== 'text' && pollType !== 'word_cloud' && options.some(opt => !opt.trim()))) {
      alert('Please fill in all fields');
      return;
    }

    const pollData = {
      question: question.trim(),
      options: pollType === 'text' || pollType === 'word_cloud' ? [] : options.filter(opt => opt.trim()),
      type: pollType,
      settings: {
        anonymous: true,
        showResults: 'after_vote'
      }
    };

    SocketService.createPoll(pollData);
    setQuestion('');
    setOptions(['', '']);
    onPollCreated && onPollCreated();
    alert('Poll created successfully!');
  };

  const loadTemplate = (template) => {
    if (template.questions.length > 0) {
      const firstQuestion = template.questions[0];
      setQuestion(firstQuestion.question);
      setPollType(firstQuestion.type);
      setOptions(firstQuestion.options.length > 0 ? firstQuestion.options : ['', '']);
    }
  };

  return (
    <div className="poll-creator">
      <h3>Create New Poll</h3>
      
      <div className="template-section">
        <h4>Quick Start Templates</h4>
        <div className="template-grid">
          {templates.map(template => (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => loadTemplate(template)}
            >
              <h5>{template.name}</h5>
              <span className="template-category">{template.category}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="poll-form">
        <div className="form-group">
          <label>Poll Type</label>
          <select 
            value={pollType} 
            onChange={(e) => setPollType(e.target.value)}
            className="form-select"
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="rating">Rating Scale</option>
            <option value="word_cloud">Word Cloud</option>
            <option value="text">Open Text</option>
          </select>
        </div>

        <div className="form-group">
          <label>Question *</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question"
            className="form-input"
            required
          />
        </div>

        {(pollType === 'multiple_choice' || pollType === 'rating') && (
          <div className="form-group">
            <label>Options *</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={pollType === 'rating' ? `Rating ${index + 1}` : `Option ${index + 1}`}
                  className="form-input"
                  required
                />
                {options.length > 2 && (
                  <button 
                    type="button" 
                    onClick={() => removeOption(index)}
                    className="btn-remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addOption}
              className="btn-secondary"
            >
              Add Option
            </button>
          </div>
        )}

        <button type="submit" className="btn-primary poll-create-btn">
          Create Poll
        </button>
      </form>
    </div>
  );
};

export default PollCreator;
