// ThisPersonDoesNotExistから取得した3枚の王子様の画像データ
// Base64形式で保存されています

// 画像データは非常に長いため、実際のデータは別ファイルに保存
import prince1 from './princeImage1';
import prince2 from './princeImage2';
import prince3 from './princeImage3';

// 3枚の王子様の画像データを配列として提供
const princeImagesData = [
  prince1,
  prince2,
  prince3
];

// ランダムな王子様の画像を取得する関数
export const getRandomPrinceImage = () => {
  const randomIndex = Math.floor(Math.random() * princeImagesData.length);
  return princeImagesData[randomIndex];
};

export default princeImagesData;