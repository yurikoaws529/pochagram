import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Progress.css';
import ProgressTracker from '../components/ProgressTracker';

const Progress = () => {
  const [userData, setUserData] = useState(null);
  const [princeSettings, setPrinceSettings] = useState(null);
  
  useEffect(() => {
    // ローカルストレージからデータを取得
    const storedUserData = localStorage.getItem('userData');
    const storedPrinceSettings = localStorage.getItem('princeSettings');
    
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    
    if (storedPrinceSettings) {
      setPrinceSettings(JSON.parse(storedPrinceSettings));
    }
  }, []);
  
  return (
    <div className="progress-page">
      <div className="container">
        <h1 className="page-title">進捗状況</h1>
        
        {userData ? (
          <ProgressTracker 
            userData={userData} 
            princeSettings={princeSettings} 
          />
        ) : (
          <div className="no-data-message card">
            <p>プロフィールが設定されていません。</p>
            <Link to="/setup" className="btn">
              初期設定を行う
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;