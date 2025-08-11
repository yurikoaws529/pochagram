import React, { useState, useEffect } from 'react';
import '../styles/InstagramFeed.css';

const InstagramFeed = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [animatingStats, setAnimatingStats] = useState(new Set());
  const [glowingStats, setGlowingStats] = useState(new Set());
  const [floatingElements, setFloatingElements] = useState([]);
  const [currentAnimatingPost, setCurrentAnimatingPost] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // ジャンルアイコンを取得する関数
  const getGenreIcon = (genre) => {
    const icons = {
      '食事': '🍽️',
      '運動': '🏃‍♂️',
      '睡眠': '😴'
    };
    return icons[genre] || '📝';
  };

  // 浮遊エフェクトを生成する関数（ハートとコメント両方対応）
  const createFloatingEffect = (postId, type) => {
    const elementCount = Math.floor(Math.random() * 2) + 1; // 1-2個の要素
    const emoji = type === 'likes' ? '❤️' : '💬';
    
    for (let i = 0; i < elementCount; i++) {
      const elementId = Date.now() + Math.random() + i;
      const newElement = {
        id: elementId,
        postId: postId,
        type: type,
        emoji: emoji,
        x: Math.random() * 60 + 20, // 20-80%の位置
        delay: Math.random() * 0.6, // 0-0.6秒の遅延
        size: Math.random() * 0.3 + 0.6, // 0.6-0.9倍のサイズ（小さく）
      };
      
      setFloatingElements(prev => [...prev, newElement]);
      
      // 3秒後に要素を削除
      setTimeout(() => {
        setFloatingElements(prev => prev.filter(element => element.id !== elementId));
      }, 3000);
    }
  };



  // 新規投稿の統計情報を段階的に更新する関数
  const animateNewPostStats = (postId, finalLikes, finalComments) => {
    // 他の投稿のエフェクトをクリア
    setAnimatingStats(new Set());
    setGlowingStats(new Set());
    setFloatingElements([]);
    
    let currentLikes = 0;
    let currentComments = 0;
    
    const updateStats = () => {
      if (currentLikes < finalLikes || currentComments < finalComments) {
        // いいね数を更新
        if (currentLikes < finalLikes) {
          currentLikes++;
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postId ? { ...post, likes: currentLikes } : post
            )
          );
          
          // アニメーション効果
          const animationKey = `${postId}-likes`;
          setAnimatingStats(prev => new Set([...prev, animationKey]));
          setTimeout(() => {
            setAnimatingStats(prev => {
              const newSet = new Set(prev);
              newSet.delete(animationKey);
              return newSet;
            });
          }, 600);
          
          // 1件以上で光るエフェクト
          if (currentLikes >= 1) {
            const glowKey = `${postId}-likes-glow`;
            setGlowingStats(prev => new Set([...prev, glowKey]));
          }
          
          // 浮遊ハートエフェクトを生成
          createFloatingEffect(postId, 'likes');
        }
        
        // コメント数を更新
        if (currentComments < finalComments) {
          currentComments++;
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postId ? { ...post, commentsCount: currentComments } : post
            )
          );
          
          // アニメーション効果
          const animationKey = `${postId}-comments`;
          setAnimatingStats(prev => new Set([...prev, animationKey]));
          setTimeout(() => {
            setAnimatingStats(prev => {
              const newSet = new Set(prev);
              newSet.delete(animationKey);
              return newSet;
            });
          }, 600);
          
          // 1件以上で光るエフェクト
          if (currentComments >= 1) {
            const glowKey = `${postId}-comments-glow`;
            setGlowingStats(prev => new Set([...prev, glowKey]));
          }
          
          // 浮遊コメントエフェクトを生成
          createFloatingEffect(postId, 'comments');
        }
        
        // 2秒後に次の更新
        setTimeout(updateStats, 2000);
      } else {
        // 完了時にローカルストレージを更新
        const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
        const updatedPosts = userPosts.map(post => 
          post.id === postId ? { 
            ...post, 
            likes: finalLikes, 
            comments: post.comments,
            isNewPost: false // 新規投稿フラグを削除
          } : post
        );
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
        
        // アニメーション状態をクリア
        setCurrentAnimatingPost(null);
      }
    };
    
    // 最初の更新を2秒後に開始
    setTimeout(updateStats, 2000);
  };

  useEffect(() => {
    // 実際の投稿データを取得
    const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
    
    // 新規投稿を時系列順にソート（最新が最初）
    const newPosts = userPosts
      .filter(post => post.isNewPost && post.finalLikes !== undefined)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 最新の投稿のみアニメーション処理
    if (newPosts.length > 0) {
      const latestPost = newPosts[0];
      
      // 前のアニメーションをクリア
      if (currentAnimatingPost && currentAnimatingPost !== latestPost.id) {
        // 前の投稿のエフェクトをクリア
        setAnimatingStats(new Set());
        setGlowingStats(new Set());
        setFloatingElements([]);
      }
      
      // 最新の投稿のみアニメーション開始
      if (currentAnimatingPost !== latestPost.id) {
        setCurrentAnimatingPost(latestPost.id);
        animateNewPostStats(latestPost.id, latestPost.finalLikes, latestPost.finalComments || 0);
      }
    }
    
    // 横3×縦4 = 12個のダミーデータを生成
    const dummyPosts = [];
    const genres = ['食事', '運動', '睡眠'];
    
    // 各ジャンルのサンプル画像パス（JPGを優先、なければSVG）
    const sampleImages = {
      '食事': [
        { jpg: '/images/samples/food1.jpg', svg: '/images/samples/food1.svg' },
        { jpg: '/images/samples/food2.jpg', svg: '/images/samples/food2.svg' },
        { jpg: '/images/samples/food3.jpg', svg: '/images/samples/food3.svg' },
        { jpg: '/images/samples/food4.jpg', svg: '/images/samples/food4.svg' }
      ],
      '運動': [
        { jpg: '/images/samples/exercise1.jpg', svg: '/images/samples/exercise1.svg' },
        { jpg: '/images/samples/exercise2.jpg', svg: '/images/samples/exercise2.svg' },
        { jpg: '/images/samples/exercise3.jpg', svg: '/images/samples/exercise3.svg' },
        { jpg: '/images/samples/exercise4.jpg', svg: '/images/samples/exercise4.svg' }
      ],
      '睡眠': [
        { jpg: '/images/samples/sleep1.jpg', svg: '/images/samples/sleep1.svg' },
        { jpg: '/images/samples/sleep2.jpg', svg: '/images/samples/sleep2.svg' },
        { jpg: '/images/samples/sleep3.jpg', svg: '/images/samples/sleep3.svg' },
        { jpg: '/images/samples/sleep4.jpg', svg: '/images/samples/sleep4.svg' }
      ]
    };
    
    // フォールバック用のSVG画像
    const colors = ['FF6B9D', '4CAF50', '2196F3'];
    
    for (let i = 1; i <= 12; i++) {
      const genreIndex = (i - 1) % 3; // 1:1:1の割合
      const genre = genres[genreIndex];
      const color = colors[genreIndex];
      const imageIndex = Math.floor((i - 1) / 3) % 4; // 各ジャンル4枚の画像をローテーション
      
      const imageOptions = sampleImages[genre][imageIndex];
      
      // フォールバック用のSVG画像
      const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
          <rect width="300" height="300" fill="#${color}"/>
          <text x="150" y="130" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" font-weight="bold">${genre}</text>
          <text x="150" y="170" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" font-weight="bold">${i}</text>
        </svg>
      `)}`;
      
      // コメントデータを生成
      const commentTemplates = {
        '食事': [
          'とても美味しそうですね！',
          '栄養バランスが良さそう',
          'レシピを教えてください',
          '健康的な食事ですね'
        ],
        '運動': [
          'お疲れ様でした！',
          '継続が大切ですね',
          '素晴らしい運動量です',
          'モチベーションが上がります'
        ],
        '睡眠': [
          'ゆっくり休んでくださいね',
          '質の良い睡眠は大切です',
          'リラックスできそう',
          '良い夢を見てください'
        ]
      };

      const commentCount = Math.floor(Math.random() * 5) + 1;
      const postComments = [];
      
      for (let j = 0; j < commentCount; j++) {
        const templates = commentTemplates[genre];
        postComments.push({
          id: j + 1,
          author: `オーディエンス${Math.floor(Math.random() * 100) + 1}`,
          text: templates[Math.floor(Math.random() * templates.length)],
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        });
      }

      dummyPosts.push({
        id: i,
        image: imageOptions.jpg, // まずJPGを試す
        svgFallback: imageOptions.svg, // JPGが失敗したらSVGを試す
        fallbackImage: fallbackSvg, // 最終的なフォールバック
        genre: genre,
        likes: Math.floor(Math.random() * 50) + 10,
        comments: postComments,
        score: Math.floor(Math.random() * 40) + 60,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // 1時間ずつ古くする
        description: `${genre}の記録 #${i}`
      });
    }
    
    // 実際の投稿とダミーデータを結合
    const allPosts = [...userPosts, ...dummyPosts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setPosts(allPosts);
  }, [refreshTrigger, currentAnimatingPost]);

  // 投稿削除機能
  const handleDeletePost = (postId, event) => {
    event.stopPropagation(); // 投稿詳細モーダルが開かないようにする
    setShowDeleteConfirm(postId);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      // ローカルストレージから投稿を削除
      const userPosts = JSON.parse(localStorage.getItem('userPosts') || '[]');
      const postToDelete = userPosts.find(post => post.id === showDeleteConfirm);
      
      if (postToDelete) {
        // 削除する投稿で増えたフォロワー数を取得
        const followersToRemove = postToDelete.newFollowers || 0;
        
        // 投稿を削除
        const updatedPosts = userPosts.filter(post => post.id !== showDeleteConfirm);
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
        
        // フォロワー数を減らす（実際のアプリでは総フォロワー数を管理する必要があります）
        const currentFollowers = parseInt(localStorage.getItem('totalFollowers') || '0');
        const newFollowerCount = Math.max(0, currentFollowers - followersToRemove);
        localStorage.setItem('totalFollowers', newFollowerCount.toString());
        
        // 投稿一覧を更新
        const allPosts = posts.filter(post => post.id !== showDeleteConfirm);
        setPosts(allPosts);
        
        console.log(`投稿を削除しました。フォロワー ${followersToRemove} 人が解除されました。`);
      }
      
      setShowDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="instagram-feed">
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-item" onClick={() => setSelectedPost(post)}>
            {/* 浮遊エフェクト（ハートとコメント） */}
            {floatingElements
              .filter(element => element.postId === post.id)
              .map(element => (
                <div
                  key={element.id}
                  className={`floating-element floating-${element.type}`}
                  style={{
                    left: `${element.x}%`,
                    animationDelay: `${element.delay}s`,
                    transform: `scale(${element.size})`
                  }}
                >
                  {element.emoji}
                </div>
              ))
            }
            
            {/* ジャンルバッジ（左上） */}
            <div className="genre-badge">
              {getGenreIcon(post.genre)}
            </div>
            
            {/* 削除ボタン（ユーザーの投稿のみ表示） */}
            {(post.id > 12 || (typeof post.id === 'number' && post.id > Date.now() - 86400000)) && (
              <button 
                className="delete-btn"
                onClick={(e) => handleDeletePost(post.id, e)}
                title="投稿を削除"
              >
                ×
              </button>
            )}
            <div className="post-image">
              <img 
                src={post.image} 
                alt={`${post.genre}の投稿`}
                onError={(e) => {
                  // 段階的フォールバック: JPG → SVG → 最終フォールバック
                  if (e.target.src.endsWith('.jpg')) {
                    // JPGが失敗した場合、SVGを試す
                    e.target.src = post.svgFallback;
                  } else if (e.target.src.endsWith('.svg')) {
                    // SVGも失敗した場合、最終フォールバックを使用
                    e.target.src = post.fallbackImage;
                  }
                }}
              />
            </div>
            <div className="post-info">
              <div className="post-stats-bottom">
                <span className={`likes ${animatingStats.has(`${post.id}-likes`) ? 'animating' : ''} ${glowingStats.has(`${post.id}-likes-glow`) ? 'glowing' : ''}`}>
                  ❤️ {post.likes}
                </span>
                <span className={`comments ${animatingStats.has(`${post.id}-comments`) ? 'animating' : ''} ${glowingStats.has(`${post.id}-comments-glow`) ? 'glowing' : ''}`}>
                  💬 {post.isNewPost ? (post.commentsCount || 0) : post.comments.length}
                </span>
              </div>
              <div className="post-score">スコア: {post.score}点</div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedPost && (
        <div className="post-modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPost(null)}>×</button>
            
            <div className="modal-content">
              <div className="modal-image">
                <img src={selectedPost.image} alt={`${selectedPost.genre}の投稿`} />
              </div>
              
              <div className="modal-info">
                <div className="post-header">
                  <span className="post-genre-modal">
                    {getGenreIcon(selectedPost.genre)} {selectedPost.genre}
                  </span>
                  <span className="post-score">スコア: {selectedPost.score}点</span>
                </div>
                
                {selectedPost.description && (
                  <div className="post-description">
                    <p>{selectedPost.description}</p>
                  </div>
                )}
                
                <div className="post-stats-detail">
                  <span className="likes">❤️ {selectedPost.likes} いいね</span>
                  <span className="comments-count">💬 {selectedPost.comments.length} コメント</span>
                </div>
                
                <div className="comments-section">
                  <h4>コメント</h4>
                  <div className="comments-list">
                    {selectedPost.comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-author">{comment.author}</div>
                        <div className="comment-text">{comment.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* デバッグ情報セクション（ユーザー投稿のみ） */}
                {(selectedPost.analysis || selectedPost.debugInfo) && (
                  <div className="debug-section">
                    <div className="debug-header">
                      <button 
                        className="debug-toggle"
                        onClick={() => setShowDebugInfo(!showDebugInfo)}
                      >
                        🔍 スコア詳細 {showDebugInfo ? '▼' : '▶'}
                      </button>
                    </div>
                    
                    {showDebugInfo && (
                      <div className="debug-content">
                        {/* 分析結果 */}
                        {selectedPost.analysis && selectedPost.analysis.debugInfo && (
                          <div className="debug-analysis">
                            <h5>📊 分析結果</h5>
                            <div className="analysis-breakdown">
                              <div className="analysis-item">
                                <strong>総合スコア:</strong> {selectedPost.analysis.totalScore}点
                              </div>
                              <div className="analysis-item">
                                <strong>5W分析:</strong> {selectedPost.analysis.debugInfo.analysisBreakdown.fiveWAnalysis.score}/{selectedPost.analysis.debugInfo.analysisBreakdown.fiveWAnalysis.maxScore}点
                                <div className="analysis-details">
                                  完了項目: {selectedPost.analysis.debugInfo.analysisBreakdown.fiveWAnalysis.completedItems}/5
                                  <br />
                                  詳細: {Object.entries(selectedPost.analysis.debugInfo.analysisBreakdown.fiveWAnalysis.details)
                                    .filter(([key, value]) => value !== null)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(', ') || 'なし'}
                                </div>
                              </div>
                              {selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis && (
                                <div className="analysis-item">
                                  <strong>栄養分析:</strong> {selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.score}/{selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.maxScore}点
                                  <div className="analysis-details">
                                    検出された食事: {selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.detectedFoodType || '不明'}
                                    <br />
                                    健康度係数: {((selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.healthScore || 0) * 100).toFixed(0)}%
                                    <br />
                                    バランス: {selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.details.balance}点 | 
                                    多様性: {selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.details.variety}点 | 
                                    分量: {selectedPost.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.details.portion}点
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* オーディエンス反応 */}
                        {selectedPost.debugInfo && (
                          <div className="debug-audience">
                            <h5>👥 オーディエンス反応</h5>
                            <div className="audience-breakdown">
                              <div className="audience-item">
                                <strong>入力スコア:</strong> {selectedPost.debugInfo.scoreThresholds.inputScore}点
                              </div>
                              <div className="audience-layers">
                                <div className={`audience-layer ${selectedPost.debugInfo.scoreThresholds.easy.passed ? 'passed' : 'failed'}`}>
                                  Easy層 (50点以上): {selectedPost.debugInfo.reactionBreakdown.easy.likes}いいね
                                </div>
                                <div className={`audience-layer ${selectedPost.debugInfo.scoreThresholds.medium.passed ? 'passed' : 'failed'}`}>
                                  Medium層 (70点以上): {selectedPost.debugInfo.reactionBreakdown.medium.likes}いいね
                                </div>
                                <div className={`audience-layer ${selectedPost.debugInfo.scoreThresholds.hard.passed ? 'passed' : 'failed'}`}>
                                  Hard層 (90点以上): {selectedPost.debugInfo.reactionBreakdown.hard.likes}いいね
                                </div>
                              </div>
                              <div className="audience-total">
                                <strong>合計:</strong> {selectedPost.debugInfo.calculationDetails.totalLikes}いいね, {selectedPost.debugInfo.calculationDetails.newFollowers}新規フォロワー
                              </div>
                            </div>
                          </div>
                        )}

                        {/* デバッグ情報がない場合の表示 */}
                        {!selectedPost.analysis?.debugInfo && !selectedPost.debugInfo && (
                          <div className="debug-no-data">
                            <p>この投稿にはデバッグ情報がありません。</p>
                            <p>新しく投稿された投稿のみデバッグ情報が表示されます。</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>投稿を削除しますか？</h3>
            <p>この操作は取り消せません。</p>
            <p>この投稿で増えたフォロワーも自動で解除されます。</p>
            <div className="delete-confirm-actions">
              <button className="btn btn-secondary" onClick={cancelDelete}>
                キャンセル
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramFeed;