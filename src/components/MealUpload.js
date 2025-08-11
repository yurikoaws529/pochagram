import React, { useState } from 'react';
import '../styles/MealUpload.css';
import rekognitionService from '../services/rekognitionService';

const MealUpload = ({ userHealthIssues, onSubmit }) => {
  const [mealData, setMealData] = useState({
    image: null,
    imagePreview: '',
    mealType: '朝食',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMealData({
      ...mealData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMealData({
          ...mealData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let analysisResult = null;
    
    // AWS Rekognitionを使用して食事画像を分析
    if (mealData.image) {
      try {
        console.log('AWS Rekognitionで食事画像を分析中...');
        const labels = await rekognitionService.detectLabels(mealData.image, {
          maxLabels: 10,
          minConfidence: 60
        });
        
        console.log('検出されたラベル:', labels);
        analysisResult = labels;
      } catch (error) {
        console.error('AWS Rekognition分析エラー:', error);
        // エラーの場合はモック分析を使用
      }
    }
    
    const feedback = generateFeedback(userHealthIssues, analysisResult);
    setFeedback(feedback);
    
    // 親コンポーネントに送信
    onSubmit({
      ...mealData,
      feedback: feedback,
      rekognitionLabels: analysisResult
    });
  };

  // AWS Rekognitionの結果に基づくフィードバック生成
  const generateFeedback = (healthIssues, rekognitionLabels) => {
    let feedback = {
      nutritionRating: 3,
      positives: [],
      improvements: [],
      detectedItems: []
    };

    if (rekognitionLabels && rekognitionLabels.length > 0) {
      // 検出されたアイテムを記録
      feedback.detectedItems = rekognitionLabels.map(label => ({
        name: label.Name,
        confidence: Math.round(label.Confidence)
      }));

      // 健康的な食材の検出
      const healthyItems = rekognitionLabels.filter(label => 
        ['Vegetable', 'Fruit', 'Salad', 'Fish', 'Broccoli', 'Lettuce', 'Tomato', 'Apple', 'Orange'].some(healthy =>
          label.Name.toLowerCase().includes(healthy.toLowerCase())
        )
      );

      // 不健康な食材の検出
      const unhealthyItems = rekognitionLabels.filter(label =>
        ['Burger', 'Pizza', 'Fries', 'Cake', 'Ice Cream', 'Dessert', 'Candy'].some(unhealthy =>
          label.Name.toLowerCase().includes(unhealthy.toLowerCase())
        )
      );

      // 評価の計算
      let rating = 3;
      if (healthyItems.length > unhealthyItems.length) {
        rating = Math.min(5, 3 + healthyItems.length);
        feedback.positives.push(`健康的な食材（${healthyItems.map(item => item.Name).join('、')}）が含まれています`);
      }
      
      if (unhealthyItems.length > 0) {
        rating = Math.max(1, rating - unhealthyItems.length);
        feedback.improvements.push(`${unhealthyItems.map(item => item.Name).join('、')}の摂取量に注意しましょう`);
      }

      feedback.nutritionRating = rating;

      // 野菜の検出
      const vegetables = rekognitionLabels.filter(label =>
        ['Vegetable', 'Salad', 'Broccoli', 'Lettuce', 'Tomato'].some(veg =>
          label.Name.toLowerCase().includes(veg.toLowerCase())
        )
      );

      if (vegetables.length === 0) {
        feedback.improvements.push('野菜を追加することをお勧めします');
      } else {
        feedback.positives.push('野菜が含まれており、バランスが良いです');
      }

    } else {
      // Rekognitionが使用できない場合のフォールバック
      feedback.nutritionRating = Math.floor(Math.random() * 5) + 1;
      feedback.positives.push('食事の記録をありがとうございます');
      feedback.improvements.push('バランスの良い食事を心がけましょう');
    }
    
    // 健康状態に基づいたアドバイス
    if (healthIssues && healthIssues.length > 0) {
      if (healthIssues.includes('貧血')) {
        feedback.improvements.push('鉄分を多く含む食品（ほうれん草、レバーなど）を追加すると良いでしょう');
      }
      
      if (healthIssues.includes('高血圧')) {
        feedback.improvements.push('塩分を控えめにすることをお勧めします');
      }
      
      if (healthIssues.includes('糖尿病')) {
        feedback.improvements.push('炭水化物の量を調整することを検討してください');
      }
    }

    // 最低限のフィードバックを保証
    if (feedback.positives.length === 0) {
      feedback.positives.push('食事の記録を継続することが大切です');
    }
    if (feedback.improvements.length === 0) {
      feedback.improvements.push('バランスの良い食事を心がけましょう');
    }
    
    return feedback;
  };

  return (
    <div className="meal-upload card">
      <h2>食事記録</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">日付</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-control"
            value={mealData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mealType">食事の種類</label>
          <select
            id="mealType"
            name="mealType"
            className="form-control"
            value={mealData.mealType}
            onChange={handleChange}
          >
            <option value="朝食">朝食</option>
            <option value="昼食">昼食</option>
            <option value="夕食">夕食</option>
            <option value="間食">間食</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">食事の内容</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={mealData.description}
            onChange={handleChange}
            placeholder="例：サラダ、鶏胸肉のグリル、玄米ご飯"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="image">食事の写真</label>
          <input
            type="file"
            id="image"
            name="image"
            className="form-control file-input"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          
          {mealData.imagePreview && (
            <div className="image-preview">
              <img src={mealData.imagePreview} alt="食事のプレビュー" />
            </div>
          )}
        </div>
        
        <button type="submit" className="btn">アップロード</button>
      </form>
      
      {feedback && (
        <div className="meal-feedback">
          <h3>食事のアドバイス</h3>
          <div className="rating">
            <p>栄養バランス: {Array(feedback.nutritionRating).fill('★').join('')}</p>
          </div>

          {feedback.detectedItems && feedback.detectedItems.length > 0 && (
            <div className="feedback-section">
              <h4>検出された食材</h4>
              <ul>
                {feedback.detectedItems.map((item, index) => (
                  <li key={`detected-${index}`}>{item.name} ({item.confidence}%)</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="feedback-section">
            <h4>良い点</h4>
            <ul>
              {feedback.positives.map((item, index) => (
                <li key={`positive-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div className="feedback-section">
            <h4>改善点</h4>
            <ul>
              {feedback.improvements.map((item, index) => (
                <li key={`improvement-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealUpload;