import React, { useState } from 'react';
import '../styles/AITester.css';
import AITesterHeader from './AITesterHeader';
import ParticipantSettings from './ParticipantSettings';
import NewDiscussion from './NewDiscussion';
import AITesterFeed from './AITesterFeed';
import DiscussionDetail from './DiscussionDetail';

const AITester = () => {
  const [currentView, setCurrentView] = useState('feed');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [refreshFeed, setRefreshFeed] = useState(0);

  const handleNewDiscussion = () => {
    setShowNewDiscussion(true);
  };

  const handleDiscussionComplete = (discussion) => {
    console.log('新しい井戸端会議が完了:', discussion);
    // フィードを更新するために再レンダリングをトリガー
    setRefreshFeed(prev => prev + 1);
    // フィード画面に切り替え
    setCurrentView('feed');
  };

  const handleDiscussionClick = (discussion) => {
    setSelectedDiscussion(discussion);
  };

  const handleDiscussionDetailClose = () => {
    setSelectedDiscussion(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'feed':
        return (
          <AITesterFeed 
            refreshTrigger={refreshFeed}
            onDiscussionClick={handleDiscussionClick}
          />
        );
      case 'settings':
        return <ParticipantSettings />;
      default:
        return (
          <div className="ai-tester-main">
            <div className="welcome-section">
              <h2>AIテスター ～井戸端会議～</h2>
              <p>機能準備中...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="ai-tester">
      <AITesterHeader 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onNewDiscussion={handleNewDiscussion}
      />
      
      <main className="ai-tester-content">
        {renderCurrentView()}
      </main>

      {showNewDiscussion && (
        <NewDiscussion
          onClose={() => setShowNewDiscussion(false)}
          onComplete={handleDiscussionComplete}
        />
      )}

      {selectedDiscussion && (
        <DiscussionDetail
          discussion={selectedDiscussion}
          onClose={handleDiscussionDetailClose}
        />
      )}
    </div>
  );
};

export default AITester;