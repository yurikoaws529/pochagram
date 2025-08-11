import React, { useState, useEffect } from 'react';
import '../styles/PrinceSettings.css';

const PrinceSettings = ({ initialSettings, onSave }) => {
  const [settings, setSettings] = useState(initialSettings || {
    mode: 'ふつう',
    refreshImage: false
  });
  const [princeImage, setPrinceImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  // コンポーネントマウント時に保存されている画像を読み込む
  useEffect(() => {
    const savedImage = localStorage.getItem('princeImage');
    if (savedImage) {
      setPrinceImage(savedImage);
    } else {
      // デフォルト画像を設定
      setPrinceImage('https://via.placeholder.com/150x150/FF6B9D/FFFFFF?text=王子様');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 画像も含めて設定を保存
    onSave({
      ...settings,
      princeImage: princeImage
    });
    
    // ローカルストレージに画像を保存
    if (princeImage) {
      localStorage.setItem('princeImage', princeImage);
    }
  };

  const handleRefreshImage = () => {
    setIsLoading(true);
    setImageError('');
    
    try {
      // 用意された王子画像を使用
      // 画像ファイルは public/images/princes/ に配置されていると仮定
      
      // process.env.PUBLIC_URL を使用して正しいパスを生成
      const imagePath = `${process.env.PUBLIC_URL}/images/princes/prince1.png`;
      
      // 画像が存在するか確認
      const img = new Image();
      img.onload = () => {
        // 画像が正常に読み込めた場合
        setPrinceImage(imagePath);
        localStorage.setItem('princeImage', imagePath);
        setIsLoading(false);
        
        // 設定を更新
        setSettings({
          ...settings,
          refreshImage: true
        });
      };
      
      img.onerror = () => {
        // 画像が読み込めなかった場合
        console.error('画像の読み込みに失敗しました:', imagePath);
        setImageError(`画像の読み込みに失敗しました: ${imagePath}`);
        setIsLoading(false);
        
        // プレースホルダー画像を使用
        const placeholderImage = 'https://via.placeholder.com/150x150/FF6B9D/FFFFFF?text=王子様';
        setPrinceImage(placeholderImage);
        localStorage.setItem('princeImage', placeholderImage);
      };
      
      img.src = imagePath;
    } catch (error) {
      console.error('画像の設定に失敗しました:', error);
      setImageError('画像の設定に失敗しました');
      setIsLoading(false);
      
      // エラーの場合はプレースホルダー画像を使用
      const placeholderImage = 'https://via.placeholder.com/150x150/FF6B9D/FFFFFF?text=王子様';
      setPrinceImage(placeholderImage);
      localStorage.setItem('princeImage', placeholderImage);
    }
  };

  return (
    <div className="prince-settings card">
      <h2>王子様の設定</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="mode">励ましモード</label>
          <select
            id="mode"
            name="mode"
            className="form-control"
            value={settings.mode}
            onChange={handleChange}
          >
            <option value="ふつう">ふつう</option>
            <option value="ドS">ドS</option>
            <option value="ドM">ドM</option>
          </select>
        </div>
        
        <div className="prince-image-settings">
          {princeImage && (
            <div className="current-prince-image">
              <img src={princeImage} alt="現在の王子様" />
            </div>
          )}
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleRefreshImage}
            disabled={isLoading}
          >
            {isLoading ? '画像を取得中...' : '王子様の画像を変更する'}
          </button>
          
          {imageError && (
            <p className="image-error">{imageError}</p>
          )}
          
          <p className="image-note">※ランダムな画像が設定されます</p>
        </div>
        
        <button type="submit" className="btn">設定を保存</button>
      </form>
    </div>
  );
};

export default PrinceSettings;