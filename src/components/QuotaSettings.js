import React, { useState, useEffect } from 'react';
import '../styles/QuotaSettings.css';

const QuotaSettings = ({ onSave }) => {
  const [quotas, setQuotas] = useState({
    dailyPosts: 3,
    dailyLikes: 10,
    dailyFollowers: 2
  });

  const [audienceCount, setAudienceCount] = useState(50);
  const [llmProvider, setLlmProvider] = useState('amazon-q');

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    const savedQuotas = localStorage.getItem('quotaSettings');
    const savedAudienceCount = localStorage.getItem('audienceCount');
    const savedLlmProvider = localStorage.getItem('llmProvider');

    if (savedQuotas) {
      setQuotas(JSON.parse(savedQuotas));
    }
    if (savedAudienceCount) {
      setAudienceCount(parseInt(savedAudienceCount));
    }
    if (savedLlmProvider) {
      setLlmProvider(savedLlmProvider);
    }
  }, []);

  const handleQuotaChange = (field, value) => {
    setQuotas(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const handleSave = () => {
    // ローカルストレージに保存
    localStorage.setItem('quotaSettings', JSON.stringify(quotas));
    localStorage.setItem('audienceCount', audienceCount.toString());
    localStorage.setItem('llmProvider', llmProvider);

    // オーディエンス構成を計算
    const audienceComposition = {
      easy: Math.floor(audienceCount * 0.6),    // 60%
      medium: Math.floor(audienceCount * 0.3),  // 30%
      hard: Math.floor(audienceCount * 0.1)     // 10%
    };

    const settings = {
      quotas,
      audienceCount,
      audienceComposition,
      llmProvider
    };

    localStorage.setItem('appSettings', JSON.stringify(settings));

    if (onSave) {
      onSave(settings);
    }

    alert('設定を保存しました！');
  };

  return (
    <div className="quota-settings card">
      <h2>ノルマ・オーディエンス設定</h2>
      
      <div className="settings-section">
        <h3>📊 1日のノルマ設定</h3>
        
        <div className="form-group">
          <label htmlFor="dailyPosts">投稿数ノルマ</label>
          <input
            type="number"
            id="dailyPosts"
            min="1"
            max="20"
            value={quotas.dailyPosts}
            onChange={(e) => handleQuotaChange('dailyPosts', e.target.value)}
            className="form-control"
          />
          <small>1日に投稿する画像の目標数</small>
        </div>

        <div className="form-group">
          <label htmlFor="dailyLikes">いいね数ノルマ</label>
          <input
            type="number"
            id="dailyLikes"
            min="1"
            max="1000"
            value={quotas.dailyLikes}
            onChange={(e) => handleQuotaChange('dailyLikes', e.target.value)}
            className="form-control"
          />
          <small>1日に獲得するいいねの目標数</small>
        </div>

        <div className="form-group">
          <label htmlFor="dailyFollowers">新規フォロワー数ノルマ</label>
          <input
            type="number"
            id="dailyFollowers"
            min="1"
            max="50"
            value={quotas.dailyFollowers}
            onChange={(e) => handleQuotaChange('dailyFollowers', e.target.value)}
            className="form-control"
          />
          <small>1日に獲得する新規フォロワーの目標数</small>
        </div>
      </div>

      <div className="settings-section">
        <h3>👥 オーディエンス設定</h3>
        
        <div className="form-group">
          <label htmlFor="audienceCount">オーディエンス数</label>
          <input
            type="number"
            id="audienceCount"
            min="1"
            max="100"
            value={audienceCount}
            onChange={(e) => setAudienceCount(parseInt(e.target.value) || 1)}
            className="form-control"
          />
          <small>AIオーディエンスの総数（1-100人）</small>
        </div>

        <div className="audience-composition">
          <h4>オーディエンス構成</h4>
          <div className="composition-item">
            <span className="difficulty easy">難易度小</span>
            <span>{Math.floor(audienceCount * 0.6)}人 (60%)</span>
            <small>50点以上でいいね</small>
          </div>
          <div className="composition-item">
            <span className="difficulty medium">難易度中</span>
            <span>{Math.floor(audienceCount * 0.3)}人 (30%)</span>
            <small>70点以上でいいね</small>
          </div>
          <div className="composition-item">
            <span className="difficulty hard">難易度高</span>
            <span>{Math.floor(audienceCount * 0.1)}人 (10%)</span>
            <small>90点以上でいいね</small>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>🤖 LLM設定</h3>
        
        <div className="form-group">
          <label htmlFor="llmProvider">LLMプロバイダー</label>
          <select
            id="llmProvider"
            value={llmProvider}
            onChange={(e) => setLlmProvider(e.target.value)}
            className="form-control"
          >
            <option value="amazon-q">Amazon Q</option>
            <option value="chatgpt">ChatGPT API</option>
          </select>
          <small>画像分析とコメント生成に使用するLLM</small>
        </div>
      </div>

      <button onClick={handleSave} className="btn btn-primary">
        設定を保存
      </button>
    </div>
  );
};

export default QuotaSettings;