const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// .envファイルを明示的に指定
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bedrockRoutes = require('./routes/bedrock');
const openaiRoutes = require('./routes/openai');
const rekognitionRoutes = require('./routes/rekognition');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ルート
app.use('/api/bedrock', bedrockRoutes);
app.use('/api/openai', openaiRoutes);
app.use('/api/rekognition', rekognitionRoutes);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pochagram Server is running' });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Pochagram Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Bedrock API: http://localhost:${PORT}/api/bedrock`);
  console.log(`🧠 OpenAI API: http://localhost:${PORT}/api/openai`);
  console.log(`👁️ Rekognition API: http://localhost:${PORT}/api/rekognition`);
  
  // 環境変数の確認
  console.log('🔑 環境変数確認:');
  console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '設定済み' : '未設定');
  console.log('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '設定済み' : '未設定');
  console.log('  AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '設定済み' : '未設定');
  console.log('  AWS_REGION:', process.env.AWS_REGION ? '設定済み' : '未設定');
});