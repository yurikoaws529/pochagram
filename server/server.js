const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const bedrockRoutes = require('./routes/bedrock');

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
});