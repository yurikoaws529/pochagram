import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';
import Prince from '../components/Prince';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [princeSettings, setPrinceSettings] = useState(null);
  const [daysLeft, setDaysLeft] = useState(0);
  const [weightLeft, setWeightLeft] = useState(0);
  
  useEffect(() => {
    // ローカルストレージからデータを取得
    const storedUserData = localStorage.getItem('userData');
    const storedPrinceSettings = localStorage.getItem('princeSettings');
    
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      
      // 目標日までの残り日数を計算
      if (parsedUserData.targetDate) {
        const today = new Date();
        const targetDate = new Date(parsedUserData.targetDate);
        const timeDiff = targetDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setDaysLeft(Math.max(0, daysDiff));
      }
      
      // 目標体重までの残り体重を計算
      if (parsedUserData.currentWeight && parsedUserData.targetWeight) {
        const weightDiff = parseFloat(parsedUserData.currentWeight) - parseFloat(parsedUserData.targetWeight);
        setWeightLeft(Math.max(0, weightDiff.toFixed(1)));
      }
    }
    
    if (storedPrinceSettings) {
      setPrinceSettings(JSON.parse(storedPrinceSettings));
    }
  }, []);
  
  // 王子様のメッセージを生成
  const getPrinceMessage = () => {
    if (!userData) return null;
    
    if (daysLeft <= 0) {
      return '目標日が過ぎています！新しい目標を設定しましょう！';
    }
    
    switch(princeSettings?.mode) {
      case 'ドS':
        return `目標まであと${daysLeft}日、${weightLeft}kg。このままじゃ間に合わないわよ？`;
      case 'ドM':
        return `目標まであと${daysLeft}日、${weightLeft}kg...頑張ってください...応援しています...`;
      default:
        return `目標まであと${daysLeft}日、${weightLeft}kgです！一緒に頑張りましょう！`;
    }
  };
  
  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 className="page-title">ダッシュボード</h1>
        
        {userData ? (
          <>
            <div className="prince-greeting">
              <Prince 
                mode={princeSettings?.mode || 'ふつう'} 
                message={getPrinceMessage()} 
              />
            </div>
            
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>目標達成まで</h3>
                <div className="stat-value">{daysLeft}日</div>
              </div>
              
              <div className="stat-card">
                <h3>目標体重まで</h3>
                <div className="stat-value">{weightLeft}kg</div>
              </div>
              
              <div className="stat-card">
                <h3>現在の体重</h3>
                <div className="stat-value">{userData.currentWeight}kg</div>
              </div>
              
              <div className="stat-card">
                <h3>目標体重</h3>
                <div className="stat-value">{userData.targetWeight}kg</div>
              </div>
            </div>
            
            <div className="dashboard-actions">
              <Link to="/meal-log" className="action-card">
                <div className="action-icon">📷</div>
                <h3>食事を記録する</h3>
                <p>食事の写真をアップロードして、アドバイスをもらいましょう</p>
              </Link>
              
              <Link to="/progress" className="action-card">
                <div className="action-icon">📊</div>
                <h3>進捗を記録する</h3>
                <p>体重を記録して、進捗を確認しましょう</p>
              </Link>
            </div>
          </>
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

export default Dashboard;