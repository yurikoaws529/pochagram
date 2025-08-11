import React, { useState, useEffect } from 'react';
import { characters, defaultSettings, roundOptions } from '../utils/aiTesterData';
import { generateDiscussion } from '../utils/conversationGenerator';
import '../styles/NewDiscussion.css';

const NewDiscussion = ({ onClose, onComplete }) => {
  const [topic, setTopic] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectedModerator, setSelectedModerator] = useState('');
  const [selectedRounds, setSelectedRounds] = useState(defaultSettings.discussionRounds);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  useEffect(() => {
    // 保存された参加者設定を読み込み
    const savedParticipants = localStorage.getItem('aiTesterParticipants');
    if (savedParticipants) {
      setSelectedParticipants(JSON.parse(savedParticipants));
    } else {
      setSelectedParticipants(Object.keys(characters));
    }

    // 保存されたラウンド数設定を読み込み
    const savedRounds = localStorage.getItem('aiTesterRounds');
    if (savedRounds) {
      setSelectedRounds(parseInt(savedRounds));
    }

    // モデレーターを最初の参加者に設定
    if (savedParticipants) {
      const participants = JSON.parse(savedParticipants);
      setSelectedModerator(participants.length > 0 ? participants[0] : '');
    } else {
      const allParticipants = Object.keys(characters);
      setSelectedModerator(allParticipants[0]);
    }
  }, []);

  const handleParticipantToggle = (characterId) => {
    const newSelection = selectedParticipants.includes(characterId)
      ? selectedParticipants.filter(id => id !== characterId)
      : [...selectedParticipants, characterId];
    
    setSelectedParticipants(newSelection);
    
    // モデレーターが参加者から外れた場合、モデレーターをリセット
    if (!newSelection.includes(selectedModerator)) {
      setSelectedModerator(newSelection.length > 0 ? newSelection[0] : '');
    }
    
    // 参加者設定を保存
    localStorage.setItem('aiTesterParticipants', JSON.stringify(newSelection));
  };

  const handleRoundsChange = (rounds) => {
    setSelectedRounds(rounds);
    // ラウンド数設定を保存
    localStorage.setItem('aiTesterRounds', rounds.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      alert('お題を入力してください');
      return;
    }
    
    if (selectedParticipants.length === 0) {
      alert('少なくとも1人の参加者を選択してください');
      return;
    }

    setIsGenerating(true);
    
    try {
      // ステップ1: 会話生成
      setGenerationStep('参加者たちが議論を始めています...');
      const conversation = await generateDiscussion(topic, selectedParticipants, selectedRounds, selectedModerator);
      
      // ステップ1.5: 司会者による意見集約
      setGenerationStep('司会者が意見を集約しています...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // UI効果のための待機
      
      // ステップ2: 完了
      setGenerationStep('井戸端会議が完了しました！');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 結果を保存
      const discussion = {
        id: Date.now(),
        topic: topic,
        participants: selectedParticipants,
        moderator: selectedModerator,
        conversation: conversation,
        timestamp: new Date(),
        isComplete: true
      };
      
      // ローカルストレージに保存
      const existingDiscussions = JSON.parse(localStorage.getItem('aiTesterDiscussions') || '[]');
      const updatedDiscussions = [discussion, ...existingDiscussions];
      localStorage.setItem('aiTesterDiscussions', JSON.stringify(updatedDiscussions));
      
      // 完了コールバック
      if (onComplete) {
        onComplete(discussion);
      }
      
      onClose();
      
    } catch (error) {
      console.error('井戸端会議の生成中にエラーが発生しました:', error);
      alert('井戸端会議の生成中にエラーが発生しました');
      setIsGenerating(false);
    }
  };

  return (
    <div className="new-discussion-overlay">
      <div className="new-discussion-modal">
        <div className="modal-header">
          <h2>新しい井戸端会議</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!isGenerating ? (
          <form onSubmit={handleSubmit} className="discussion-form">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="topic">お題</label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例：新しいファンデーションを買おうと思うのですが、どのブランドがおすすめですか？"
                  className="form-control topic-input"
                  rows="3"
                  maxLength="200"
                />
                <div className="character-count">
                  {topic.length}/200文字
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="rounds">ラウンド数設定</label>
                <select
                  id="rounds"
                  value={selectedRounds}
                  onChange={(e) => handleRoundsChange(parseInt(e.target.value))}
                  className="form-control rounds-select"
                >
                  {roundOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                <div className="rounds-info">
                  <small>💡 野比さん・とみさんを含む場合、ラウンド数を少なくすると課金を抑えられます</small>
                </div>
              </div>

              <div className="form-group">
                <label>参加者選択</label>
                <div className="participants-grid">
                  {Object.entries(characters).map(([id, character]) => (
                    <div 
                      key={id}
                      className={`participant-card ${selectedParticipants.includes(id) ? 'selected' : ''} ${selectedModerator === id ? 'moderator' : ''}`}
                      onClick={() => handleParticipantToggle(id)}
                    >
                      <div className="participant-avatar">{character.avatar}</div>
                      <div className="participant-info">
                        <div className="participant-name">
                          {character.name}
                          {selectedModerator === id && selectedParticipants.includes(id) && (
                            <span className="moderator-badge">司会</span>
                          )}
                        </div>
                        <div className="participant-age">{character.age}</div>
                      </div>
                      <div className="selection-indicator">
                        {selectedParticipants.includes(id) ? '✓' : '○'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="selection-summary">
                  選択中: {selectedParticipants.length}人
                </div>
              </div>

              {selectedParticipants.length > 0 && (
                <div className="form-group">
                  <label htmlFor="moderator">司会者選択</label>
                  <select
                    id="moderator"
                    value={selectedModerator}
                    onChange={(e) => setSelectedModerator(e.target.value)}
                    className="form-control moderator-select"
                  >
                    {selectedParticipants.map(id => (
                      <option key={id} value={id}>
                        {characters[id].name} - {characters[id].personality}
                      </option>
                    ))}
                  </select>
                  <div className="moderator-info">
                    <small>💡 司会者は議論終了後に意見をまとめて総評を行います</small>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                キャンセル
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!topic.trim() || selectedParticipants.length === 0}
              >
                井戸端会議を開始
              </button>
            </div>
          </form>
        ) : (
          <div className="generation-progress">
            <div className="progress-content">
              <div className="loading-spinner"></div>
              <h3>井戸端会議を生成中...</h3>
              <p>{generationStep}</p>
              
              <div className="participants-preview">
                <h4>参加者</h4>
                <div className="participants-list">
                  {selectedParticipants.map(id => (
                    <div key={id} className="participant-preview">
                      <span className="participant-avatar">{characters[id].avatar}</span>
                      <span className="participant-name">{characters[id].name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="topic-preview">
                <h4>お題</h4>
                <p>「{topic}」</p>
              </div>
              
              <div className="rounds-preview">
                <h4>設定</h4>
                <p>ラウンド数: {selectedRounds}ラウンド</p>
                <p>予想発言数: {selectedParticipants.length * selectedRounds}発言</p>
                <p>司会者: {characters[selectedModerator]?.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewDiscussion;