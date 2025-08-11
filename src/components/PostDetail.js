import React from 'react';
import '../styles/PostDetail.css';

const PostDetail = ({ post, onClose }) => {
  if (!post) return null;

  const formatTimestamp = (timestamp) => {
    try {
      const now = new Date();
      const postDate = new Date(timestamp);
      const diffInSeconds = Math.floor((now - postDate) / 1000);
      
      if (diffInSeconds < 60) {
        return '今';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}分前`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}時間前`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}日前`;
      } else {
        return postDate.toLocaleDateString('ja-JP', {
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return '不明';
    }
  };

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="post-detail-content">
          <div className="post-detail-image">
            <img src={post.image} alt={`${post.genre}の投稿`} />
          </div>
          
          <div className="post-detail-info">
            <div className="post-header">
              <div className="post-meta">
                <span className="post-genre">{post.genre}</span>
                <span className="post-timestamp">{formatTimestamp(post.timestamp)}</span>
              </div>
              <div className="post-score">スコア: {post.score}点</div>
            </div>
            
            {post.description && (
              <div className="post-description">
                <p>{post.description}</p>
              </div>
            )}
            
            {post.analysis && (
              <div className="post-analysis">
                <h4>分析結果</h4>
                {post.analysis.analysis && <p>{post.analysis.analysis}</p>}
                
                {post.analysis.fiveW && (
                  <div className="five-w-analysis">
                    <h5>5W分析 ({post.analysis.fiveWScore || 0}点)</h5>
                    <ul>
                      {post.analysis.fiveW.when && <li><strong>When:</strong> {post.analysis.fiveW.when}</li>}
                      {post.analysis.fiveW.where && <li><strong>Where:</strong> {post.analysis.fiveW.where}</li>}
                      {post.analysis.fiveW.what && <li><strong>What:</strong> {post.analysis.fiveW.what}</li>}
                      {post.analysis.fiveW.who && <li><strong>Who:</strong> {post.analysis.fiveW.who}</li>}
                      {post.analysis.fiveW.why && <li><strong>Why:</strong> {post.analysis.fiveW.why}</li>}
                    </ul>
                  </div>
                )}

                {/* 食事の栄養分析 */}
                {post.genre === '食事' && post.analysis.nutritionScore !== null && (
                  <div className="nutrition-analysis">
                    <h5>栄養分析 ({post.analysis.nutritionScore || 0}点)</h5>
                    
                    {/* デバッグ用：分析データの存在確認 */}
                    <div className="debug-data-check">
                      <small style={{color: '#666', fontSize: '11px'}}>
                        Debug: rekognitionLabels存在: {post.analysis.rekognitionLabels ? 'あり' : 'なし'} 
                        {post.analysis.rekognitionLabels && ` (${post.analysis.rekognitionLabels.length}個)`}
                      </small>
                    </div>
                    
                    {post.analysis.rekognitionLabels && post.analysis.rekognitionLabels.length > 0 ? (
                      <div className="rekognition-results">
                        <h6>AWS Rekognition検出結果</h6>
                        <div className="detected-labels">
                          {post.analysis.rekognitionLabels.map((label, index) => (
                            <div key={index} className="label-item">
                              <span className="label-name">{label.Name}</span>
                              <span className="label-confidence">{Math.round(label.Confidence)}%</span>
                            </div>
                          ))}
                        </div>
                        
                        {post.analysis.debugInfo && post.analysis.debugInfo.analysisBreakdown && (
                          <div className="debug-info">
                            <h6>デバッグ情報</h6>
                            <div className="debug-section">
                              <strong>栄養分析詳細:</strong>
                              {post.analysis.debugInfo.analysisBreakdown.nutritionAnalysis && (
                                <ul>
                                  <li>バランス: {post.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.details?.balance || 0}点</li>
                                  <li>多様性: {post.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.details?.variety || 0}点</li>
                                  <li>分量: {post.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.details?.portion || 0}点</li>
                                  <li>検出食材タイプ: {post.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.detectedFoodType || '不明'}</li>
                                  <li>健康スコア: {Math.round((post.analysis.debugInfo.analysisBreakdown.nutritionAnalysis.healthScore || 0) * 100)}%</li>
                                </ul>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-recognition-data">
                        <p>AWS Rekognition分析データがありません</p>
                        <small style={{color: '#999', fontSize: '11px'}}>
                          この投稿は古いバージョンで作成されたか、AWS Rekognition分析に失敗した可能性があります。
                          新しい食事投稿を作成すると、AWS Rekognitionによる詳細な分析結果が表示されます。
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {/* 運動・睡眠のAWS Rekognition分析結果 */}
                {(post.genre === '運動' || post.genre === '睡眠') && (
                  <div className="activity-analysis">
                    <h5>{post.genre}分析</h5>
                    
                    {/* デバッグ用：分析データの存在確認 */}
                    <div className="debug-data-check">
                      <small style={{color: '#666', fontSize: '11px'}}>
                        Debug: rekognitionLabels存在: {post.analysis.rekognitionLabels ? 'あり' : 'なし'} 
                        {post.analysis.rekognitionLabels && ` (${post.analysis.rekognitionLabels.length}個)`}
                      </small>
                    </div>
                    
                    {post.analysis.rekognitionLabels && post.analysis.rekognitionLabels.length > 0 ? (
                      <div className="rekognition-results">
                        <h6>AWS Rekognition検出結果</h6>
                        <div className="detected-labels">
                          {post.analysis.rekognitionLabels.map((label, index) => (
                            <div key={index} className="label-item">
                              <span className="label-name">{label.Name}</span>
                              <span className="label-confidence">{Math.round(label.Confidence)}%</span>
                            </div>
                          ))}
                        </div>
                        
                        {post.analysis.debugInfo && post.analysis.debugInfo.analysisBreakdown && (
                          <div className="debug-info">
                            <h6>デバッグ情報</h6>
                            <div className="debug-section">
                              <strong>5W1H分析詳細:</strong>
                              <ul>
                                <li>完了項目: {post.analysis.debugInfo.analysisBreakdown.fiveWAnalysis?.completedItems || 0}/5</li>
                                <li>5W1Hスコア: {post.analysis.debugInfo.analysisBreakdown.fiveWAnalysis?.score || 0}点</li>
                                <li>検出内容: {post.analysis.analysis || '不明'}</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-recognition-data">
                        <p>AWS Rekognition分析データがありません</p>
                        <small style={{color: '#999', fontSize: '11px'}}>
                          この投稿は古いバージョンで作成されたか、AWS Rekognition分析に失敗した可能性があります。
                          新しい{post.genre}投稿を作成すると、AWS Rekognitionによる詳細な分析結果が表示されます。
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="post-stats">
              <div className="stats-row">
                <span className="likes">❤️ {post.likes || 0} いいね</span>
                <span className="comments-count">💬 {post.comments?.length || 0} コメント</span>
                {(post.newFollowers || 0) > 0 && (
                  <span className="new-followers">👥 +{post.newFollowers} フォロワー</span>
                )}
              </div>
            </div>
            
            {post.comments && post.comments.length > 0 && (
              <div className="comments-section">
                <h4>コメント</h4>
                <div className="comments-list">
                  {post.comments.map((comment, index) => (
                    <div key={comment.id || index} className="comment-item">
                      <div className="comment-author">{comment.author}</div>
                      <div className="comment-text">{comment.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;