import React, { useState } from 'react';
import '../styles/UserProfile.css';

const UserProfile = ({ initialData, onSave }) => {
  const [userData, setUserData] = useState(initialData || {
    height: '',
    currentWeight: '',
    targetWeight: '',
    healthIssues: [],
    targetDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleHealthIssueChange = (e) => {
    const { value, checked } = e.target;
    let updatedHealthIssues = [...userData.healthIssues];
    
    if (checked) {
      updatedHealthIssues.push(value);
    } else {
      updatedHealthIssues = updatedHealthIssues.filter(issue => issue !== value);
    }
    
    setUserData({
      ...userData,
      healthIssues: updatedHealthIssues
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userData);
  };

  return (
    <div className="user-profile card">
      <h2>あなたのプロフィール</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="height">身長 (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            className="form-control"
            value={userData.height}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="currentWeight">現在の体重 (kg)</label>
          <input
            type="number"
            id="currentWeight"
            name="currentWeight"
            className="form-control"
            value={userData.currentWeight}
            onChange={handleChange}
            required
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="targetWeight">目標体重 (kg)</label>
          <input
            type="number"
            id="targetWeight"
            name="targetWeight"
            className="form-control"
            value={userData.targetWeight}
            onChange={handleChange}
            required
            step="0.1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="targetDate">目標達成日</label>
          <input
            type="date"
            id="targetDate"
            name="targetDate"
            className="form-control"
            value={userData.targetDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>健康状態の悩み</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="healthIssues"
                value="貧血"
                checked={userData.healthIssues.includes('貧血')}
                onChange={handleHealthIssueChange}
              />
              貧血
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="healthIssues"
                value="低血圧"
                checked={userData.healthIssues.includes('低血圧')}
                onChange={handleHealthIssueChange}
              />
              低血圧
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="healthIssues"
                value="高血圧"
                checked={userData.healthIssues.includes('高血圧')}
                onChange={handleHealthIssueChange}
              />
              高血圧
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="healthIssues"
                value="糖尿病"
                checked={userData.healthIssues.includes('糖尿病')}
                onChange={handleHealthIssueChange}
              />
              糖尿病
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="healthIssues"
                value="アレルギー"
                checked={userData.healthIssues.includes('アレルギー')}
                onChange={handleHealthIssueChange}
              />
              アレルギー
            </label>
          </div>
        </div>
        
        <button type="submit" className="btn">保存する</button>
      </form>
    </div>
  );
};

export default UserProfile;