import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Setup.css';
import UserProfile from '../components/UserProfile';
import PrinceSettings from '../components/PrinceSettings';
import Prince from '../components/Prince';

const Setup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [princeSettings, setPrinceSettings] = useState(null);
  
  const handleUserProfileSave = (data) => {
    setUserData(data);
    setStep(2);
  };
  
  const handlePrinceSettingsSave = (data) => {
    setPrinceSettings(data);
    
    // 王子様の画像があればローカルストレージに保存
    if (data.princeImage) {
      localStorage.setItem('princeImage', data.princeImage);
    }
    
    setStep(3);
  };
  
  const handleFinish = () => {
    // 実際のアプリではデータをローカルストレージやデータベースに保存
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('princeSettings', JSON.stringify(princeSettings));
    
    // ダッシュボードに遷移
    navigate('/dashboard');
  };
  
  return (
    <div className="setup-page">
      <div className="container">
        <h1 className="page-title">初期設定</h1>
        
        <div className="setup-progress">
          <div className={`setup-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">プロフィール設定</div>
          </div>
          <div className="setup-progress-line"></div>
          <div className={`setup-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">王子様の設定</div>
          </div>
          <div className="setup-progress-line"></div>
          <div className={`setup-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">完了</div>
          </div>
        </div>
        
        <div className="setup-content">
          {step === 1 && (
            <UserProfile onSave={handleUserProfileSave} />
          )}
          
          {step === 2 && (
            <PrinceSettings onSave={handlePrinceSettingsSave} />
          )}
          
          {step === 3 && (
            <div className="setup-complete card">
              <h2>設定完了！</h2>
              <p>おめでとうございます！初期設定が完了しました。</p>
              
              <div className="prince-welcome">
                <Prince 
                  mode={princeSettings?.mode || 'ふつう'} 
                  message={
                    princeSettings?.mode === 'ドS' 
                      ? `ようやく来たわね。目標体重${userData?.targetWeight}kgまで、しっかり頑張りなさい！`
                      : princeSettings?.mode === 'ドM'
                        ? `やっと...お会いできました...。目標体重${userData?.targetWeight}kgまで...一緒に頑張りましょう...。`
                        : `はじめまして！目標体重${userData?.targetWeight}kgに向けて、一緒に頑張りましょう！`
                  } 
                />
              </div>
              
              <button onClick={handleFinish} className="btn">
                ダッシュボードへ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setup;