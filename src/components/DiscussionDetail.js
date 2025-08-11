import React from 'react';
import { characters } from '../utils/aiTesterData';
import { getDiscussionSummary } from '../utils/conversationGenerator';
import '../styles/DiscussionDetail.css';

const DiscussionDetail = ({ discussion, onClose }) => {
  if (!discussion) return null;

  const formatTimestamp = (timestamp) => {
    try {
      const now = new Date();
      const discussionDate = new Date(timestamp);
      const diffInSeconds = Math.floor((now - discussionDate) / 1000);
      
      if (diffInSeconds < 60) {
        return '今';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}分前`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}時間前`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}日前`;
      } else {
        return discussionDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return '不明';
    }
  };



  const groupMessagesByRound = (conversation) => {
    const rounds = {};
    conversation.forEach(message => {
      if (!rounds[message.round]) {
        rounds[message.round] = [];
      }
      rounds[message.round].push(message);
    });
    return rounds;
  };

  const rounds = groupMessagesByRound(discussion.conversation);

  return (
    <div className="discussion-detail-overlay" onClick={onClose}>
      <div className="discussion-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="discussion-detail-content">
          <div className="discussion-detail-conversation">
            <div className="conversation-header">
              <h2>井戸端会議の詳細</h2>
              <div className="conversation-meta">
                <div className="topic-display">
                  <h3>お題: 「{discussion.topic}」</h3>
                </div>
                <div className="meta-info">
                  <span className="timestamp">{formatTimestamp(discussion.timestamp)}</span>
                  <span className="participants-count">{discussion.participants.length}人参加</span>
                </div>
              </div>
            </div>

            <div className="conversation-content">
              {Object.entries(rounds).map(([roundNumber, messages]) => (
                <div key={roundNumber} className="conversation-round">
                  <div className="round-header">
                    <span className="round-number">
                      {messages.some(msg => msg.isSummary) ? '司会者による意見集約' : `ラウンド ${roundNumber}`}
                    </span>
                  </div>
                  <div className="round-messages">
                    {messages.map((message) => (
                      <div key={message.id} className={`message-item ${message.isSummary ? 'summary-message' : ''}`}>
                        <div className="message-avatar">
                          {message.character.avatar}
                        </div>
                        <div className="message-content">
                          <div className="message-header">
                            <span className="character-name">
                              {message.character.name}
                              {message.isSummary && <span className="moderator-badge">司会</span>}
                            </span>
                            <span className="character-age">({message.character.age})</span>
                          </div>
                          <div className="message-text">
                            {message.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="discussion-detail-summary">
            {(() => {
              const summary = getDiscussionSummary(discussion.conversation);
              const moderator = characters[discussion.moderator || discussion.participants?.[0]];
              
              return summary ? (
                <div className="moderator-summary">
                  <div className="summary-header">
                    <div className="moderator-info">
                      <span className="moderator-avatar">{moderator.avatar}</span>
                      <div className="moderator-details">
                        <span className="moderator-name">{moderator.name}</span>
                        <span className="moderator-role">司会による総括</span>
                      </div>
                    </div>
                  </div>
                  <div className="summary-content">
                    <p>{summary}</p>
                  </div>
                </div>
              ) : (
                <div className="no-summary">
                  <p>司会者による総括はありません</p>
                </div>
              );
            })()}

            <div className="participants-info">
              <h4>参加者情報</h4>
              <div className="participants-grid">
                {discussion.participants.map(participantId => {
                  const character = characters[participantId];
                  const messageCount = discussion.conversation.filter(msg => msg.characterId === participantId && !msg.isSummary).length;
                  const isModerator = (discussion.moderator || discussion.participants?.[0]) === participantId;
                  return (
                    <div key={participantId} className={`participant-info-card ${isModerator ? 'moderator-card' : ''}`}>
                      <div className="participant-header">
                        <div className="participant-avatar">{character.avatar}</div>
                        <div className="participant-details">
                          <div className="participant-name">
                            {character.name}
                            {isModerator && <span className="moderator-badge">司会</span>}
                          </div>
                          <div className="participant-age">{character.age}</div>
                        </div>
                      </div>
                      <div className="participant-stats">
                        <div className="stat-item">
                          <span className="stat-label">発言数:</span>
                          <span className="stat-value">{messageCount}回</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">価格帯:</span>
                          <span className="stat-value">{character.priceRange}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetail;