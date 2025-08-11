import React, { useState, useEffect } from 'react';
import { characters, openaiCharacters, langchainCharacters } from '../utils/aiTesterData';
import '../styles/ParticipantSettings.css';

const ParticipantSettings = () => {
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  // キャラクターの利用LLMを取得する関数
  const getLLMInfo = (characterId) => {
    if (openaiCharacters.includes(characterId)) {
      return {
        provider: 'OpenAI',
        model: 'GPT-3.5-turbo',
        color: '#343541'  // OpenAIの暗いグレー
      };
    } else if (langchainCharacters.includes(characterId)) {
      return {
        provider: 'AWS Bedrock',
        model: 'Claude 3.5 Sonnet',
        color: '#16a085'  // AWS Bedrockの緑
      };
    } else {
      return {
        provider: 'Mock',
        model: 'シミュレーション',
        color: '#6c757d'
      };
    }
  };

  useEffect(() => {
    // 保存された設定を読み込み
    const saved = localStorage.getItem('aiTesterParticipants');
    if (saved) {
      setSelectedParticipants(JSON.parse(saved));
    } else {
      // デフォルトは全員選択
      setSelectedParticipants(Object.keys(characters));
    }
  }, []);

  const handleParticipantToggle = (characterId) => {
    const newSelection = selectedParticipants.includes(characterId)
      ? selectedParticipants.filter(id => id !== characterId)
      : [...selectedParticipants, characterId];
    
    setSelectedParticipants(newSelection);
    localStorage.setItem('aiTesterParticipants', JSON.stringify(newSelection));
  };

  const handleSelectAll = () => {
    const allIds = Object.keys(characters);
    setSelectedParticipants(allIds);
    localStorage.setItem('aiTesterParticipants', JSON.stringify(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedParticipants([]);
    localStorage.setItem('aiTesterParticipants', JSON.stringify([]));
  };

  return (
    <div className="participant-settings">
      <div className="settings-header">
        <p>井戸端会議に参加するキャラクターを選択してください</p>
      </div>

      <div className="selection-controls">
        <button 
          className="btn btn-secondary"
          onClick={handleSelectAll}
        >
          全員選択
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleDeselectAll}
        >
          全員解除
        </button>
        <div className="selection-count">
          選択中: {selectedParticipants.length}/4人
        </div>
      </div>

      <div className="character-grid">
        {Object.entries(characters).map(([id, character]) => {
          const llmInfo = getLLMInfo(id);
          return (
            <div 
              key={id}
              className={`character-card ${selectedParticipants.includes(id) ? 'selected' : ''}`}
              onClick={() => handleParticipantToggle(id)}
            >
              <div className="character-header">
                <div className="character-avatar">{character.avatar}</div>
                <div className="character-info">
                  <h3 className="character-name">{character.name}</h3>
                  <p className="character-age">年齢: {character.age}</p>
                </div>
                <div className="selection-indicator">
                  {selectedParticipants.includes(id) ? '✓' : '○'}
                </div>
              </div>
              
              <div className="llm-info">
                <div className="llm-badge" style={{ backgroundColor: llmInfo.color }}>
                  <span className="llm-provider">{llmInfo.provider}</span>
                </div>
              </div>
              
              <div className="character-details">
                <p className="character-description">{character.description}</p>
                
                <div className="character-attributes">
                  <div className="attribute">
                    <strong>よく見るメディア:</strong>
                    <span>{character.channels.join(', ')}</span>
                  </div>
                  <div className="attribute">
                    <strong>化粧品価格帯:</strong>
                    <span>{character.priceRange}</span>
                  </div>
                  <div className="attribute">
                    <strong>口調:</strong>
                    <span>{character.personality}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedParticipants.length === 0 && (
        <div className="warning-message">
          ⚠️ 少なくとも1人の参加者を選択してください
        </div>
      )}

      <div className="settings-footer">
        <p>設定は自動的に保存されます</p>
      </div>
    </div>
  );
};

export default ParticipantSettings;