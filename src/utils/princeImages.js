// 王子様の画像URLの配列
// 実際のアプリでは、これらの画像をプロジェクトに含めるか、
// 安定したCDNからホストされた画像を使用してください
const princeImages = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/men/10.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/men/12.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/men/14.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
];

// ランダムな王子様の画像を取得する関数
export const getRandomPrinceImage = () => {
  const randomIndex = Math.floor(Math.random() * princeImages.length);
  return princeImages[randomIndex];
};

export default princeImages;