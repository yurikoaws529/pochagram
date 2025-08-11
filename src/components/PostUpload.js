import React, { useState } from 'react';
import '../styles/PostUpload.css';
import rekognitionService from '../services/rekognitionService';

const PostUpload = ({ onUpload, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('食事');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (genre) => {
    let detectedLabels = [];
    let detectedContent = { type: '不明', keywords: [genre], healthScore: 0.5 };
    
    // AWS Rekognitionを使用して画像を分析（全ジャンル対応）
    if (selectedImage) {
      try {
        console.log('AWS Rekognitionで画像を分析中...', {
          genre: genre,
          hasImage: !!selectedImage,
          imageType: selectedImage?.type,
          imageSize: selectedImage?.size
        });
        
        detectedLabels = await rekognitionService.detectLabels(selectedImage, {
          maxLabels: 15,
          minConfidence: 50
        });
        
        console.log('AWS Rekognition分析完了:', {
          labelsCount: detectedLabels?.length || 0,
          labels: detectedLabels
        });
        
        // ジャンル別のラベル分析
        switch (genre) {
          case '食事':
            detectedContent = analyzeFoodLabels(detectedLabels);
            break;
          case '運動':
            detectedContent = analyzeExerciseLabels(detectedLabels);
            break;
          case '睡眠':
            detectedContent = analyzeSleepLabels(detectedLabels);
            break;
          default:
            detectedContent = { type: '不明', keywords: [genre], healthScore: 0.5 };
        }
        
        console.log(`分析された${genre}情報:`, detectedContent);
      } catch (error) {
        console.error('AWS Rekognition分析エラー:', error);
        console.error('エラー詳細:', {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode
        });
        // エラーの場合はデフォルト値を使用
      }
    } else {
      console.log('AWS Rekognition分析をスキップ: 画像が選択されていない');
    }
    
    // 5W1H分析（AWS Rekognitionの結果に基づいて改善）
    const fiveWAnalysis = {
      fiveW: {
        when: getTimeContext(genre),
        where: inferLocationByGenre(detectedLabels, genre),
        what: detectedContent.keywords.length > 0 ? detectedContent.keywords[0] : null,
        who: Math.random() > 0.1 ? 'ユーザー' : null,
        why: getReasonByGenre(genre)
      },
      detectedContent: detectedContent,
      rekognitionLabels: detectedLabels
    };

    // 5W分析の点数計算
    const fiveWCount = Object.values(fiveWAnalysis.fiveW).filter(v => v !== null).length;
    const fiveWScore = (fiveWCount / 5) * (genre === '食事' ? 50 : 100);

    let totalScore = fiveWScore;
    let nutritionScore = 0;

    // 食事の場合は栄養バランス分析を追加（食事内容に基づいて調整）
    if (genre === '食事') {
      const healthMultiplier = detectedContent.healthScore;
      
      // 健康度に基づいて各項目のスコアを計算
      const baseBalance = Math.floor(Math.random() * 10) + 5; // 5-15点
      const baseVariety = Math.floor(Math.random() * 10) + 5; // 5-15点  
      const basePortion = Math.floor(Math.random() * 15) + 5; // 5-20点
      
      const balance = Math.floor(baseBalance * healthMultiplier);
      const variety = Math.floor(baseVariety * healthMultiplier);
      const portion = Math.floor(basePortion * (healthMultiplier + 0.3)); // 分量は少し甘めに
      
      nutritionScore = balance + variety + portion;
      totalScore += nutritionScore;
    }

    // デバッグ用の詳細情報
    const debugInfo = {
      analysisBreakdown: {
        fiveWAnalysis: {
          score: Math.round(fiveWScore),
          maxScore: genre === '食事' ? 50 : 100,
          details: fiveWAnalysis.fiveW,
          completedItems: fiveWCount,
          totalItems: 5
        },
        nutritionAnalysis: genre === '食事' ? {
          score: nutritionScore,
          maxScore: 50,
          detectedFoodType: detectedContent.type,
          healthScore: detectedContent.healthScore,
          details: {
            balance: Math.floor((nutritionScore * 0.4)),
            variety: Math.floor((nutritionScore * 0.3)),
            portion: Math.floor((nutritionScore * 0.3))
          }
        } : null
      },
      timestamp: new Date().toISOString(),
      genre: genre
    };

    return {
      fiveW: fiveWAnalysis.fiveW,
      fiveWScore: Math.round(fiveWScore),
      nutritionScore: genre === '食事' ? nutritionScore : null,
      totalScore: Math.round(totalScore),
      analysis: `${genre}の投稿として${Math.round(totalScore)}点の評価です。検出された内容: ${detectedContent.type}`,
      rekognitionLabels: detectedLabels,
      debugInfo: debugInfo
    };
  };

  // AWS Rekognitionの結果から運動情報を分析
  const analyzeExerciseLabels = (labels) => {
    const exerciseTypes = [
      { type: 'ランニング・ジョギング', keywords: ['Running', 'Jogging', 'Marathon', 'Track'], healthScore: 0.9 },
      { type: 'ウェイトトレーニング', keywords: ['Weight', 'Dumbbell', 'Barbell', 'Gym', 'Fitness'], healthScore: 0.8 },
      { type: 'ヨガ・ストレッチ', keywords: ['Yoga', 'Stretch', 'Mat', 'Meditation'], healthScore: 0.8 },
      { type: 'サイクリング', keywords: ['Bicycle', 'Bike', 'Cycling'], healthScore: 0.8 },
      { type: 'スイミング', keywords: ['Swimming', 'Pool', 'Water'], healthScore: 0.9 },
      { type: 'チームスポーツ', keywords: ['Soccer', 'Basketball', 'Tennis', 'Volleyball'], healthScore: 0.8 },
      { type: 'ウォーキング', keywords: ['Walking', 'Hiking', 'Trail'], healthScore: 0.7 },
      { type: 'ダンス', keywords: ['Dance', 'Dancing'], healthScore: 0.7 },
      { type: '格闘技', keywords: ['Boxing', 'Martial Arts', 'Karate'], healthScore: 0.8 }
    ];

    // 検出されたラベルから運動タイプを判定
    for (const exerciseType of exerciseTypes) {
      for (const label of labels) {
        if (exerciseType.keywords.some(keyword => 
          label.Name.toLowerCase().includes(keyword.toLowerCase())
        )) {
          return {
            type: exerciseType.type,
            keywords: [label.Name],
            healthScore: exerciseType.healthScore,
            confidence: label.Confidence
          };
        }
      }
    }

    // 運動関連のラベルが見つからない場合
    const exerciseRelatedLabels = labels.filter(label => 
      ['Sport', 'Exercise', 'Fitness', 'Gym', 'Training', 'Activity', 'Person', 'Human'].some(keyword =>
        label.Name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (exerciseRelatedLabels.length > 0) {
      return {
        type: '運動',
        keywords: exerciseRelatedLabels.map(label => label.Name),
        healthScore: 0.7,
        confidence: exerciseRelatedLabels[0].Confidence
      };
    }

    return { type: '不明', keywords: ['運動'], healthScore: 0.5 };
  };

  // AWS Rekognitionの結果から睡眠情報を分析
  const analyzeSleepLabels = (labels) => {
    const sleepTypes = [
      { type: 'ベッドでの睡眠', keywords: ['Bed', 'Bedroom', 'Mattress', 'Pillow', 'Blanket'], healthScore: 0.9 },
      { type: 'ソファでの仮眠', keywords: ['Couch', 'Sofa', 'Living Room'], healthScore: 0.6 },
      { type: '昼寝', keywords: ['Nap', 'Rest', 'Relaxation'], healthScore: 0.7 },
      { type: '睡眠環境', keywords: ['Room', 'Dark', 'Quiet', 'Comfortable'], healthScore: 0.8 },
      { type: '睡眠準備', keywords: ['Pajamas', 'Nightwear', 'Book', 'Reading'], healthScore: 0.8 }
    ];

    // 検出されたラベルから睡眠タイプを判定
    for (const sleepType of sleepTypes) {
      for (const label of labels) {
        if (sleepType.keywords.some(keyword => 
          label.Name.toLowerCase().includes(keyword.toLowerCase())
        )) {
          return {
            type: sleepType.type,
            keywords: [label.Name],
            healthScore: sleepType.healthScore,
            confidence: label.Confidence
          };
        }
      }
    }

    // 睡眠関連のラベルが見つからない場合
    const sleepRelatedLabels = labels.filter(label => 
      ['Sleep', 'Rest', 'Relax', 'Person', 'Human', 'Furniture', 'Room'].some(keyword =>
        label.Name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (sleepRelatedLabels.length > 0) {
      return {
        type: '睡眠',
        keywords: sleepRelatedLabels.map(label => label.Name),
        healthScore: 0.7,
        confidence: sleepRelatedLabels[0].Confidence
      };
    }

    return { type: '不明', keywords: ['睡眠'], healthScore: 0.5 };
  };

  // AWS Rekognitionの結果から食事情報を分析
  const analyzeFoodLabels = (labels) => {
    const foodTypes = [
      { type: 'サラダ・野菜', keywords: ['Salad', 'Vegetable', 'Lettuce', 'Tomato', 'Broccoli'], healthScore: 0.9 },
      { type: '和食', keywords: ['Rice', 'Sushi', 'Soup', 'Fish'], healthScore: 0.8 },
      { type: 'フルーツ', keywords: ['Fruit', 'Apple', 'Orange', 'Banana'], healthScore: 0.8 },
      { type: '肉料理', keywords: ['Meat', 'Chicken', 'Beef', 'Pork'], healthScore: 0.6 },
      { type: '弁当・定食', keywords: ['Lunch', 'Meal', 'Dish'], healthScore: 0.6 },
      { type: 'パン・パスタ', keywords: ['Bread', 'Pasta', 'Noodle'], healthScore: 0.5 },
      { type: 'ファストフード', keywords: ['Burger', 'Pizza', 'Fries'], healthScore: 0.2 },
      { type: 'スイーツ', keywords: ['Cake', 'Ice Cream', 'Dessert', 'Cookie'], healthScore: 0.1 }
    ];

    // 検出されたラベルから食事タイプを判定
    for (const foodType of foodTypes) {
      for (const label of labels) {
        if (foodType.keywords.some(keyword => 
          label.Name.toLowerCase().includes(keyword.toLowerCase())
        )) {
          return {
            type: foodType.type,
            keywords: [label.Name],
            healthScore: foodType.healthScore,
            confidence: label.Confidence
          };
        }
      }
    }

    // 食事関連のラベルが見つからない場合
    const foodRelatedLabels = labels.filter(label => 
      ['Food', 'Meal', 'Dish', 'Plate', 'Bowl'].some(keyword =>
        label.Name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (foodRelatedLabels.length > 0) {
      return {
        type: '食事',
        keywords: foodRelatedLabels.map(label => label.Name),
        healthScore: 0.5,
        confidence: foodRelatedLabels[0].Confidence
      };
    }

    return { type: '不明', keywords: ['食事'], healthScore: 0.5 };
  };

  // ジャンル別の時間コンテキストを取得
  const getTimeContext = (genre) => {
    const hour = new Date().getHours();
    
    switch (genre) {
      case '食事':
        if (hour >= 6 && hour < 10) return '朝食時';
        if (hour >= 11 && hour < 15) return '昼食時';
        if (hour >= 17 && hour < 21) return '夕食時';
        return '間食時';
        
      case '運動':
        if (hour >= 6 && hour < 10) return '朝の運動';
        if (hour >= 10 && hour < 17) return '日中の運動';
        if (hour >= 17 && hour < 21) return '夕方の運動';
        return '夜の運動';
        
      case '睡眠':
        if (hour >= 22 || hour < 6) return '夜間睡眠';
        if (hour >= 13 && hour < 16) return '昼寝';
        return '休息時間';
        
      default:
        return null;
    }
  };

  // ジャンル別の場所を推定
  const inferLocationByGenre = (labels, genre) => {
    const locationKeywords = {
      '食事': {
        'レストラン': ['Restaurant', 'Dining', 'Table', 'Chair'],
        '自宅': ['Home', 'Kitchen', 'Dining Room'],
        'カフェ': ['Cafe', 'Coffee', 'Shop'],
        'オフィス': ['Office', 'Desk', 'Workplace']
      },
      '運動': {
        'ジム': ['Gym', 'Fitness', 'Equipment', 'Weight'],
        '公園': ['Park', 'Outdoor', 'Tree', 'Grass'],
        '自宅': ['Home', 'Room', 'Indoor'],
        'スポーツ施設': ['Court', 'Field', 'Stadium', 'Pool'],
        '道路': ['Road', 'Street', 'Path', 'Track']
      },
      '睡眠': {
        'ベッドルーム': ['Bedroom', 'Bed', 'Room'],
        'リビング': ['Living Room', 'Sofa', 'Couch'],
        '自宅': ['Home', 'House', 'Indoor'],
        'ホテル': ['Hotel', 'Accommodation']
      }
    };

    const genreKeywords = locationKeywords[genre] || {};
    
    for (const [location, keywords] of Object.entries(genreKeywords)) {
      if (labels.some(label => 
        keywords.some(keyword => 
          label.Name.toLowerCase().includes(keyword.toLowerCase())
        )
      )) {
        return location;
      }
    }
    
    // デフォルト値
    switch (genre) {
      case '食事': return 'レストラン';
      case '運動': return 'ジム';
      case '睡眠': return 'ベッドルーム';
      default: return null;
    }
  };

  // ジャンル別の理由を取得
  const getReasonByGenre = (genre) => {
    const reasons = {
      '食事': ['健康のため', '栄養補給', 'エネルギー補給', '楽しみ'],
      '運動': ['健康維持', 'ダイエット', 'ストレス解消', '体力向上', '筋力アップ'],
      '睡眠': ['疲労回復', '健康維持', 'リフレッシュ', '体調管理']
    };
    
    const genreReasons = reasons[genre] || ['健康のため'];
    return Math.random() > 0.4 ? genreReasons[Math.floor(Math.random() * genreReasons.length)] : null;
  };

  const generateAudienceReactions = (score, audienceSettings) => {
    const reactions = {
      likes: 0,
      comments: [],
      newFollowers: 0
    };

    // オーディエンス設定を取得（デフォルト値を設定）
    const settings = audienceSettings || {};
    const composition = settings.audienceComposition || { easy: 30, medium: 15, hard: 5 };

    const { easy, medium, hard } = composition;

    // 各オーディエンス層の反応を詳細に記録
    const audienceReactions = {
      easy: { likes: 0, threshold: 50, multiplier: 0.8 },
      medium: { likes: 0, threshold: 70, multiplier: 0.7 },
      hard: { likes: 0, threshold: 90, multiplier: 0.6 }
    };

    // いいね計算
    if (score >= 50) {
      audienceReactions.easy.likes = Math.floor(easy * 0.8);
      reactions.likes += audienceReactions.easy.likes;
    }
    if (score >= 70) {
      audienceReactions.medium.likes = Math.floor(medium * 0.7);
      reactions.likes += audienceReactions.medium.likes;
    }
    if (score >= 90) {
      audienceReactions.hard.likes = Math.floor(hard * 0.6);
      reactions.likes += audienceReactions.hard.likes;
    }

    // コメント生成（ランダムに数個）
    const commentTemplates = [
      '素晴らしい投稿ですね！',
      'とても参考になります',
      'もう少し詳細が知りたいです',
      '継続が大切ですね',
      '良い習慣だと思います'
    ];

    const commentCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < commentCount; i++) {
      reactions.comments.push({
        id: Date.now() + i,
        text: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
        author: `オーディエンス${Math.floor(Math.random() * 100) + 1}`
      });
    }

    // 新規フォロワー計算（いいね3つで1フォロワーの確率）
    reactions.newFollowers = Math.floor(reactions.likes / 3);

    // デバッグ用の詳細情報
    reactions.debugInfo = {
      scoreThresholds: {
        inputScore: score,
        easy: { threshold: 50, passed: score >= 50 },
        medium: { threshold: 70, passed: score >= 70 },
        hard: { threshold: 90, passed: score >= 90 }
      },
      audienceComposition: composition,
      reactionBreakdown: audienceReactions,
      calculationDetails: {
        totalLikes: reactions.likes,
        newFollowers: reactions.newFollowers,
        commentsGenerated: commentCount
      }
    };

    return reactions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      alert('画像を選択してください');
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('投稿処理開始:', { genre: selectedGenre, hasImage: !!selectedImage });
      
      // 画像分析を実行
      const analysis = await analyzeImage(selectedGenre);
      console.log('画像分析完了:', analysis);
      
      // オーディエンス設定を取得
      const audienceSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
      console.log('オーディエンス設定:', audienceSettings);
      
      // オーディエンスの反応を生成
      const reactions = generateAudienceReactions(analysis.totalScore, audienceSettings);
      console.log('オーディエンス反応生成完了:', reactions);

      // 新しい投稿データを作成（統計情報は0で初期化）
      const newPost = {
        id: Date.now(),
        image: imagePreview,
        genre: selectedGenre,
        description: description,
        timestamp: new Date(),
        analysis: analysis,
        likes: 0, // 初期値は0
        comments: reactions.comments, // 実際のコメントデータ
        commentsCount: 0, // 表示用のコメント数（キュー処理で更新）
        finalLikes: reactions.likes, // キュー処理用の最終いいね数
        finalComments: reactions.comments.length, // キュー処理用の最終コメント数
        newFollowers: reactions.newFollowers,
        score: analysis.totalScore,
        isNewPost: true, // 新規投稿フラグ
        debugInfo: reactions.debugInfo // デバッグ情報
      };

      // デバッグ用：投稿データの確認
      console.log('作成された投稿データ:', {
        id: newPost.id,
        genre: newPost.genre,
        hasAnalysis: !!newPost.analysis,
        hasRekognitionLabels: !!(newPost.analysis?.rekognitionLabels),
        rekognitionLabelsCount: newPost.analysis?.rekognitionLabels?.length || 0,
        analysisKeys: Object.keys(newPost.analysis || {}),
        rekognitionLabels: newPost.analysis?.rekognitionLabels
      });

      // 投稿を保存
      const existingPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
      const updatedPosts = [newPost, ...existingPosts];
      localStorage.setItem('userPosts', JSON.stringify(updatedPosts));

      // 総フォロワー数を更新
      const currentFollowers = parseInt(localStorage.getItem('totalFollowers') || '0');
      const newTotalFollowers = currentFollowers + reactions.newFollowers;
      localStorage.setItem('totalFollowers', newTotalFollowers.toString());

      // 親コンポーネントに通知
      if (onUpload) {
        onUpload(newPost);
      }

      // フォームをリセット
      setSelectedImage(null);
      setImagePreview('');
      setDescription('');
      setIsAnalyzing(false);

      alert(`投稿が完了しました！\nスコア: ${analysis.totalScore}点\nいいね: ${reactions.likes}個\n新規フォロワー: ${reactions.newFollowers}人`);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('投稿の処理中にエラーが発生しました:', error);
      setIsAnalyzing(false);
      alert('投稿の処理中にエラーが発生しました');
    }
  };

  return (
    <div className="post-upload-overlay">
      <div className="post-upload-modal">
        <div className="modal-header">
          <h2>新しい投稿</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="upload-label">
              {imagePreview ? (
                <img src={imagePreview} alt="プレビュー" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span>📷</span>
                  <p>画像を選択</p>
                </div>
              )}
            </label>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="genre">ジャンル</label>
              <select
                id="genre"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="form-control"
              >
                <option value="食事">🍽️ 食事</option>
                <option value="運動">🏃‍♂️ 運動</option>
                <option value="睡眠">😴 睡眠</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">説明</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="投稿の説明を入力してください..."
                className="form-control"
                rows="3"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              キャンセル
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isAnalyzing || !selectedImage}
            >
              {isAnalyzing ? '分析中...' : '投稿する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostUpload;