import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ currentView, onViewChange, onUploadClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (action) => {
    if (action === 'upload') {
      onUploadClick();
    } else if (action === 'ai-tester') {
      navigate('/ai_tester');
    } else {
      onViewChange(action);
    }
    setIsMenuOpen(false); // メニューを閉じる
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo" onClick={() => onViewChange('feed')}>
          Pochagram
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
              className="nav-link upload-btn"
              onClick={() => handleMenuItemClick('upload')}
            >
              📷 投稿
            </button>
            <button
              className={`nav-link ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('calendar')}
            >
              📅 カレンダー
            </button>
            <button
              className={`nav-link ${currentView === 'product-evaluation' ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('product-evaluation')}
            >
              📦 商品評価
            </button>
            <button
              className={`nav-link ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('settings')}
            >
              ⚙️ 設定
            </button>
            <button
              className={`nav-link ${currentView === 'aws-test' ? 'active' : ''}`}
              onClick={() => handleMenuItemClick('aws-test')}
            >
              🔧 AWS接続テスト
            </button>
            <button 
              className="nav-link ai-tester-btn"
              onClick={() => handleMenuItemClick('ai-tester')}
            >
              🤖 AIテスター
            </button>
          </div>
        </div>
      </div>

      {/* オーバーレイ（メニューが開いているときの背景） */}
      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}
    </header>
  );
};

export default Header;