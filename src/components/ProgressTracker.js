import React, { useState, useEffect } from 'react';
import '../styles/ProgressTracker.css';
import Prince from './Prince';

const ProgressTracker = ({ userData, princeSettings }) => {
  const [progressData, setProgressData] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: ''
  });
  const [princeMessage, setPrinceMessage] = useState('');

  // モックデータの読み込み（実際のアプリではデータベースから取得）
  useEffect(() => {
    const mockData = [
      {
        date: '2025-07-15',
        weight: userData?.currentWeight ? parseFloat(userData.currentWeight) + 1.2 : 65.2,
        notes: '運動を始めた'
      },
      {
        date: '2025-07-18',
        weight: userData?.currentWeight ? parseFloat(userData.currentWeight) + 0.5 : 64.5,
        notes: '食事制限を開始'
      },
      {
        date: '2025-07-20',
        weight: userData?.currentWeight ? parseFloat(userData.currentWeight) + 0.2 : 64.2,
        notes: '有酸素運動を30分実施'
      }
    ];
    
    setProgressData(mockData);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 新しい進捗データを追加
    const updatedProgressData = [
      ...progressData,
      newEntry
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setProgressData(updatedProgressData);
    
    // 進捗に基づいて王子様のメッセージを生成
    generatePrinceMessage(newEntry, userData);
    
    // フォームをリセット
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      notes: ''
    });
  };

  // 進捗に基づいた王子様のメッセージを生成
  const generatePrinceMessage = (entry, userData) => {
    if (!userData || !userData.targetWeight) {
      setPrinceMessage('まずはプロフィールを設定してください！');
      return;
    }
    
    const currentWeight = parseFloat(entry.weight);
    const targetWeight = parseFloat(userData.targetWeight);
    const previousWeight = progressData.length > 0 ? parseFloat(progressData[0].weight) : currentWeight;
    
    let message = '';
    
    // 体重の変化に基づいてメッセージを生成
    if (currentWeight < previousWeight) {
      // 減量成功
      const weightDiff = previousWeight - currentWeight;
      
      switch(princeSettings?.mode) {
        case 'ドS':
          message = `${weightDiff.toFixed(1)}kg減ったわね。まだまだ甘いわ。目標まであと${(currentWeight - targetWeight).toFixed(1)}kgよ。`;
          break;
        case 'ドM':
          message = `${weightDiff.toFixed(1)}kg減量できて...すごいです...！あと${(currentWeight - targetWeight).toFixed(1)}kgで目標達成です...頑張ってください...`;
          break;
        default:
          message = `素晴らしい！${weightDiff.toFixed(1)}kg減量できました！目標まであと${(currentWeight - targetWeight).toFixed(1)}kgです。このまま頑張りましょう！`;
      }
    } else if (currentWeight > previousWeight) {
      // 体重増加
      const weightDiff = currentWeight - previousWeight;
      
      switch(princeSettings?.mode) {
        case 'ドS':
          message = `${weightDiff.toFixed(1)}kg増えたわね。このままじゃ王子様に会えないわよ？`;
          break;
        case 'ドM':
          message = `${weightDiff.toFixed(1)}kg増えてしまいました...でも、僕はあなたを信じています...`;
          break;
        default:
          message = `${weightDiff.toFixed(1)}kg増えてしまいましたが、気にしないでください。明日からまた頑張りましょう！`;
      }
    } else {
      // 変化なし
      switch(princeSettings?.mode) {
        case 'ドS':
          message = '変化なしね。もっと努力しなさい！';
          break;
        case 'ドM':
          message = '変化がないですが...もう少し頑張れば...きっと結果が出ます...';
          break;
        default:
          message = '体重に変化はありませんが、継続は力なり！このまま頑張りましょう！';
      }
    }
    
    setPrinceMessage(message);
  };

  // 目標達成までの進捗率を計算
  const calculateProgress = () => {
    if (!userData || !userData.currentWeight || !userData.targetWeight || progressData.length === 0) {
      return 0;
    }
    
    const initialWeight = parseFloat(userData.currentWeight);
    const targetWeight = parseFloat(userData.targetWeight);
    const currentWeight = parseFloat(progressData[0].weight);
    
    // 初期体重と目標体重の差
    const totalWeightToLose = initialWeight - targetWeight;
    
    // 現在までに減量した体重
    const weightLostSoFar = initialWeight - currentWeight;
    
    // 進捗率を計算（0〜100%）
    const progressPercentage = (weightLostSoFar / totalWeightToLose) * 100;
    
    return Math.min(Math.max(progressPercentage, 0), 100);
  };

  return (
    <div className="progress-tracker">
      <div className="card">
        <h2>進捗記録</h2>
        
        {userData && userData.targetWeight && (
          <div className="progress-bar-container">
            <div className="progress-info">
              <span>現在: {progressData.length > 0 ? progressData[0].weight : userData.currentWeight} kg</span>
              <span>目標: {userData.targetWeight} kg</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <div className="progress-percentage">
              {calculateProgress().toFixed(1)}% 達成
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="progress-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">日付</label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={newEntry.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="weight">体重 (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                className="form-control"
                value={newEntry.weight}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">メモ</label>
            <textarea
              id="notes"
              name="notes"
              className="form-control"
              value={newEntry.notes}
              onChange={handleChange}
              placeholder="今日の運動や食事について"
              rows="2"
            ></textarea>
          </div>
          
          <button type="submit" className="btn">記録する</button>
        </form>
      </div>
      
      {princeMessage && (
        <div className="prince-feedback">
          <Prince mode={princeSettings?.mode || 'ふつう'} message={princeMessage} />
        </div>
      )}
      
      <div className="card progress-history">
        <h3>記録履歴</h3>
        {progressData.length > 0 ? (
          <table className="progress-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>体重 (kg)</th>
                <th>メモ</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((entry, index) => (
                <tr key={`progress-${index}`}>
                  <td>{entry.date}</td>
                  <td>{entry.weight}</td>
                  <td>{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">まだ記録がありません</p>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;