import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Components
import InstagramFeed from './components/InstagramFeed';
import QuotaSettings from './components/QuotaSettings';
import PostUpload from './components/PostUpload';
import Calendar from './components/Calendar';
import Header from './components/Header';
import ProductEvaluation from './pages/ProductEvaluation';
import AWSConnectionTest from './components/AWSConnectionTest';
import AITester from './components/AITester';

// Main Pochagram App Component
const PochagramApp = () => {
  const [currentView, setCurrentView] = useState('feed');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(0);

  const handleUpload = (newPost) => {
    console.log('新しい投稿:', newPost);
    // フィードを更新するために再レンダリングをトリガー
    setRefreshFeed(prev => prev + 1);
    setShowUploadModal(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'feed':
        return <InstagramFeed refreshTrigger={refreshFeed} />;
      case 'settings':
        return <QuotaSettings />;
      case 'calendar':
        return <Calendar />;
      case 'product-evaluation':
        return <ProductEvaluation />;
      case 'aws-test':
        return <AWSConnectionTest />;
      default:
        return <InstagramFeed refreshTrigger={refreshFeed} />;
    }
  };

  return (
    <div className="app">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onUploadClick={() => setShowUploadModal(true)}
      />
      
      <main className="main-content">
        {renderCurrentView()}
      </main>

      {showUploadModal && (
        <PostUpload
          onUpload={handleUpload}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PochagramApp />} />
        <Route path="/ai_tester" element={<AITester />} />
      </Routes>
    </Router>
  );
}

export default App;