import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AITesterHeader.css';

const AITesterHeader = ({ currentView, onViewChange, onNewDiscussion }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (action) => {
    if (action === 'back-to-main') {
      navigate('/');
    } else if (action === 'new-discussion') {
      onNewDiscussion();
    } else {
      onViewChange(action);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="ai-tester-header">
      <div className="container header-container">
        <div className="logo" onClick={() => onViewChange('main')}>
          AIテスター ～井戸端会議～
        </div>
        
        <div className="nav">
          <button className="hamburger-btn" onClick={toggleMenu}>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
          
          <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            <button 
              className={`nav-link ${currentView === 'feed' ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('feed')}
            >
              🏠 フィード
            </button>
            <button 
              className="nav-link new-discussion-btn"
              onClick={() => handleMenuItemClick('new-discussion')}
            >
              💬 新しい井戸端会議
            </button>
            <button 
              className={`nav-link ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('settings')}
            >
              ⚙️ 参加者設定
            </button>
            <button 
              className="nav-link back-to-main-btn"
              onClick={() => handleMenuItemClick('back-to-main')}
            >
              ← Pchagramに戻る
            </button>
          </div>
        </div>
      </div>
      
      {/* オーバーレイ（メニューが開いているときの背景） */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </header>
  );
};

export default AITesterHeader;