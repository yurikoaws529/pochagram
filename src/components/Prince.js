import React, { useState, useEffect } from 'react';
import '../styles/Prince.css';

const Prince = ({ mode, message }) => {
  const [princeImage, setPrinceImage] = useState('');
  
  // 王子様の画像を設定する
  useEffect(() => {
    // ローカルストレージから画像を取得
    const savedImage = localStorage.getItem('princeImage');
    
    if (savedImage) {
      // 保存されている画像がある場合はそれを使用
      setPrinceImage(savedImage);
    } else {
      // 保存されている画像がない場合はデフォルトの王子画像を使用
      const defaultImage = `${process.env.PUBLIC_URL}/images/princes/prince1.png`;
      
      // 画像が存在するか確認
      const img = new Image();
      img.onload = () => {
        setPrinceImage(defaultImage);
        localStorage.setItem('princeImage', defaultImage);
      };
      
      img.onerror = () => {
        console.error('デフォルト画像の読み込みに失敗しました:', defaultImage);
        // プレースホルダー画像を使用
        const placeholderImage = 'https://via.placeholder.com/150x150/FF6B9D/FFFFFF?text=王子様';
        setPrinceImage(placeholderImage);
        localStorage.setItem('princeImage', placeholderImage);
      };
      
      img.src = defaultImage;
    }
  }, []);

  // モードに応じたメッセージスタイルを設定
  const getMessageStyle = () => {
    switch(mode) {
      case 'ドS':
        return 'prince-message prince-message-sadistic';
      case 'ドM':
        return 'prince-message prince-message-masochist';
      default:
        return 'prince-message prince-message-normal';
    }
  };

  // モードに応じたメッセージを生成（実際のアプリではより複雑なロジック）
  const getPrinceMessage = () => {
    if (message) return message;
    
    switch(mode) {
      case 'ドS':
        return 'そんなに甘いものばかり食べてどうするつもり？もっと頑張りなさい！';
      case 'ドM':
        return 'お願いです、もう少し頑張ってください。あなたのためを思って言っているんです...';
      default:
        return '今日も頑張っていますね！このまま続けましょう！';
    }
  };

  return (
    <div className="prince-container">
      <div className="prince-image-container">
        {princeImage ? (
          <img src={princeImage} alt="王子様" className="prince-image" />
        ) : (
          <div className="prince-image-placeholder">画像読み込み中...</div>
        )}
      </div>
      <div className={getMessageStyle()}>
        <p>{getPrinceMessage()}</p>
      </div>
    </div>
  );
};

export default Prince;