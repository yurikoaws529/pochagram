import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MealLog.css';
import MealUpload from '../components/MealUpload';
import Prince from '../components/Prince';

const MealLog = () => {
  const [userData, setUserData] = useState(null);
  const [princeSettings, setPrinceSettings] = useState(null);
  const [mealHistory, setMealHistory] = useState([]);
  const [princeMessage, setPrinceMessage] = useState('');
  
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
    
    // モックの食事履歴データ（実際のアプリではデータベースから取得）
    const mockMealHistory = [
      {
        id: 1,
        date: '2025-07-21',
        mealType: '朝食',
        description: 'サラダと全粒粉トースト',
        imageUrl: '/meal-placeholder-1.jpg',
        feedback: {
          nutritionRating: 4,
          positives: ['バランスの良い朝食です', '食物繊維が豊富です'],
          improvements: ['タンパク質をもう少し追加すると良いでしょう']
        }
      },
      {
        id: 2,
        date: '2025-07-21',
        mealType: '昼食',
        description: '鶏胸肉のグリルと野菜炒め',
        imageUrl: '/meal-placeholder-2.jpg',
        feedback: {
          nutritionRating: 5,
          positives: ['タンパク質と野菜のバランスが良いです', '脂質が控えめです'],
          improvements: []
        }
      }
    ];
    
    setMealHistory(mockMealHistory);
  }, []);
  
  const handleMealSubmit = (mealData) => {
    // 新しい食事データを追加
    const newMeal = {
      id: mealHistory.length + 1,
      ...mealData,
      imageUrl: mealData.imagePreview // 実際のアプリではアップロードした画像のURLを使用
    };
    
    setMealHistory([newMeal, ...mealHistory]);
    
    // 王子様のメッセージを生成
    generatePrinceMessage(mealData.feedback);
  };
  
  // 食事のフィードバックに基づいた王子様のメッセージを生成
  const generatePrinceMessage = (feedback) => {
    if (!feedback) return;
    
    const { nutritionRating, positives, improvements } = feedback;
    let message = '';
    
    switch(princeSettings?.mode) {
      case 'ドS':
        if (nutritionRating >= 4) {
          message = 'まあまあね。でも油断しないことね。';
        } else {
          message = `これでは目標達成できないわよ。${improvements[0] || '改善が必要よ。'}`;
        }
        break;
      case 'ドM':
        if (nutritionRating >= 4) {
          message = 'すごいです...とても良い食事です...このまま頑張ってください...';
        } else {
          message = `申し訳ありませんが...${improvements[0] || '少し改善が必要です...'}`;
        }
        break;
      default:
        if (nutritionRating >= 4) {
          message = `素晴らしい食事です！${positives[0] || '栄養バランスが良いですね。'}`;
        } else {
          message = `良い食事ですが、${improvements[0] || '少し改善するともっと良くなりますよ。'}`;
        }
    }
    
    setPrinceMessage(message);
  };
  
  return (
    <div className="meal-log-page">
      <div className="container">
        <h1 className="page-title">食事記録</h1>
        
        {userData ? (
          <>
            <MealUpload 
              userHealthIssues={userData.healthIssues} 
              onSubmit={handleMealSubmit} 
            />
            
            {princeMessage && (
              <div className="prince-feedback">
                <Prince 
                  mode={princeSettings?.mode || 'ふつう'} 
                  message={princeMessage} 
                />
              </div>
            )}
            
            <div className="meal-history card">
              <h2>食事履歴</h2>
              
              {mealHistory.length > 0 ? (
                <div className="meal-history-list">
                  {mealHistory.map((meal) => (
                    <div key={meal.id} className="meal-history-item">
                      <div className="meal-image">
                        {meal.imageUrl ? (
                          <img src={meal.imageUrl} alt={`${meal.mealType}の写真`} />
                        ) : (
                          <div className="meal-image-placeholder">画像なし</div>
                        )}
                      </div>
                      
                      <div className="meal-details">
                        <div className="meal-header">
                          <h3>{meal.mealType}</h3>
                          <span className="meal-date">{meal.date}</span>
                        </div>
                        
                        <p className="meal-description">{meal.description}</p>
                        
                        {meal.feedback && (
                          <div className="meal-rating">
                            <span>評価: {Array(meal.feedback.nutritionRating).fill('★').join('')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">まだ食事記録がありません</p>
              )}
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

export default MealLog;