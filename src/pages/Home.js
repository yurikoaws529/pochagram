import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <div className="container">
        <div className="hero">
          <h1 className="hero-title">Pochagram</h1>
          <p className="hero-subtitle">Instagram風健康SNSアプリ</p>
          <div className="hero-cta">
            <Link to="/setup" className="btn btn-lg">始める</Link>
          </div>
        </div>
        
        <div className="features">
          <h2 className="section-title">Pchagramの特徴</h2>
          
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">👑</div>
              <h3>あなただけの王子様</h3>
              <p>あなたを励ましてくれる王子様を設定できます。ドS、ふつう、ドMから選べます。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📷</div>
              <h3>食事分析</h3>
              <p>食事の写真をアップロードすると、あなたの健康状態に合わせたアドバイスがもらえます。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>進捗管理</h3>
              <p>体重の変化を記録して、目標達成までの進捗を確認できます。</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>リマインド機能</h3>
              <p>王子様があなたの進捗に応じてリマインドしてくれます。</p>
            </div>
          </div>
        </div>
        
        <div className="how-it-works">
          <h2 className="section-title">使い方</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>プロフィール設定</h3>
              <p>あなたの身長、体重、目標体重、健康状態の悩みを入力します。</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>王子様の設定</h3>
              <p>あなたを励ましてくれる王子様のモードを選びます。</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>食事記録</h3>
              <p>毎日の食事を記録して、アドバイスをもらいましょう。</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>進捗確認</h3>
              <p>定期的に体重を記録して、進捗を確認しましょう。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;