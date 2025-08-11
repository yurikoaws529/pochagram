import React, { useState, useEffect } from 'react';
import { characters } from '../utils/aiTesterData';
import { getDiscussionSummary } from '../utils/conversationGenerator';
import '../styles/AITesterFeed.css';

const AITesterFeed = ({ refreshTrigger, onDiscussionClick }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscussions();
  }, [refreshTrigger]);

  const loadDiscussions = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('aiTesterDiscussions');
      if (saved) {
        const parsedDiscussions = JSON.parse(saved);
        setDiscussions(parsedDiscussions);
      } else {
        setDiscussions([]);
      }
    } catch (error) {
      console.error('井戸端会議の読み込みエラー:', error);
      setDiscussions([]);
    }
    setLoading(false);
  };

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
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return '不明';
    }
  };



  if (loading) {
    return (
      <div className="feed-loading">
        <div className="loading-spinner"></div>
        <p>井戸端会議を読み込み中...</p>
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="feed-empty">
        <div className="empty-content">
          <div className="empty-icon">💬</div>
          <h3>まだ井戸端会議がありません</h3>
          <p>「新しい井戸端会議」から最初の会話を始めてみましょう！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-tester-feed">
      <div className="feed-header">
        <p>{discussions.length}件の会話</p>
      </div>

      <div className="discussions-list">
        {discussions.map((discussion) => (
          <div 
            key={discussion.id}
            className="discussion-card"
            onClick={() => onDiscussionClick(discussion)}
          >
            <div className="discussion-header">
              <div className="discussion-topic">
                <h3>{discussion.topic}</h3>
              </div>
              <div className="discussion-moderator">
                <div className="moderator-info">
                  <span className="moderator-avatar">{characters[discussion.moderator || discussion.participants?.[0]]?.avatar}</span>
                  <span className="moderator-label">司会: {characters[discussion.moderator || discussion.participants?.[0]]?.name}</span>
                </div>
              </div>
            </div>

            <div className="discussion-participants">
              <div className="participants-label">参加者:</div>
              <div className="participants-avatars">
                {discussion.participants.map(participantId => (
                  <div 
                    key={participantId}
                    className="participant-avatar"
                    title={characters[participantId]?.name}
                  >
                    {characters[participantId]?.avatar}
                  </div>
                ))}
              </div>
            </div>

            {(() => {
              const summary = getDiscussionSummary(discussion.conversation);
              return summary ? (
                <div className="discussion-preview">
                  <p>{summary}</p>
                </div>
              ) : null;
            })()}

            <div className="discussion-stats">
              <div className="stat-item">
                <span className="stat-icon">💬</span>
                <span className="stat-text">{discussion.conversation.length}発言</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <span className="stat-text">{discussion.participants.length}人参加</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🕒</span>
                <span className="stat-text">{formatTimestamp(discussion.timestamp)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AITesterFeed;