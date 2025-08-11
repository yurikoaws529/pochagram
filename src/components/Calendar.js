import React, { useState, useEffect } from 'react';
import '../styles/Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [achievements, setAchievements] = useState({});
  const [quotas, setQuotas] = useState({
    dailyPosts: 3,
    dailyLikes: 10,
    dailyFollowers: 2
  });

  useEffect(() => {
    // 設定とデータを読み込み
    const savedQuotas = JSON.parse(localStorage.getItem('quotaSettings') || '{}');
    const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    
    setQuotas({ ...quotas, ...savedQuotas });
    
    // 日別の達成状況を計算
    const dailyAchievements = {};
    
    userPosts.forEach(post => {
      const postDate = new Date(post.timestamp).toDateString();
      
      if (!dailyAchievements[postDate]) {
        dailyAchievements[postDate] = {
          posts: 0,
          likes: 0,
          followers: 0
        };
      }
      
      dailyAchievements[postDate].posts += 1;
      dailyAchievements[postDate].likes += post.likes || 0;
      dailyAchievements[postDate].followers += post.newFollowers || 0;
    });
    
    setAchievements(dailyAchievements);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 前月の日付を追加
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false
      });
    }
    
    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date,
        isCurrentMonth: true
      });
    }
    
    // 次月の日付を追加（42日になるまで）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const checkAchievement = (date) => {
    const dateString = date.toDateString();
    const dayData = achievements[dateString];
    
    if (!dayData) return { achieved: false, details: null };
    
    const postsAchieved = dayData.posts >= quotas.dailyPosts;
    const likesAchieved = dayData.likes >= quotas.dailyLikes;
    const followersAchieved = dayData.followers >= quotas.dailyFollowers;
    
    const achieved = postsAchieved || likesAchieved || followersAchieved;
    
    return {
      achieved,
      details: {
        posts: { current: dayData.posts, target: quotas.dailyPosts, achieved: postsAchieved },
        likes: { current: dayData.likes, target: quotas.dailyLikes, achieved: likesAchieved },
        followers: { current: dayData.followers, target: quotas.dailyFollowers, achieved: followersAchieved }
      }
    };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date().toDateString();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)} className="nav-btn">‹</button>
        <h2>{formatMonth(currentDate)}</h2>
        <button onClick={() => navigateMonth(1)} className="nav-btn">›</button>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot achieved"></span>
          <span>ノルマ達成</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot partial"></span>
          <span>一部達成</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot not-achieved"></span>
          <span>未達成</span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="days-grid">
          {days.map((dayInfo, index) => {
            const { date, isCurrentMonth } = dayInfo;
            const dateString = date.toDateString();
            const isToday = dateString === today;
            const achievement = checkAchievement(date);

            return (
              <div
                key={index}
                className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
              >
                <div className="day-number">{date.getDate()}</div>
                {isCurrentMonth && achievement.details && (
                  <div className="achievement-indicators">
                    <div 
                      className={`achievement-dot ${achievement.achieved ? 'achieved' : 'not-achieved'}`}
                      title={`投稿: ${achievement.details.posts.current}/${achievement.details.posts.target}, いいね: ${achievement.details.likes.current}/${achievement.details.likes.target}, フォロワー: ${achievement.details.followers.current}/${achievement.details.followers.target}`}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="quota-summary">
        <h3>現在のノルマ設定</h3>
        <div className="quota-items">
          <div className="quota-item">
            <span className="quota-icon">📝</span>
            <span>投稿数: {quotas.dailyPosts}回/日</span>
          </div>
          <div className="quota-item">
            <span className="quota-icon">❤️</span>
            <span>いいね: {quotas.dailyLikes}個/日</span>
          </div>
          <div className="quota-item">
            <span className="quota-icon">👥</span>
            <span>フォロワー: {quotas.dailyFollowers}人/日</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;