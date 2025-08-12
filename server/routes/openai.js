const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// OpenAI API プロキシエンドポイント
router.post('/chat/completions', async (req, res) => {
  try {
    console.log('OpenAI API プロキシ呼び出し開始');
    console.log('環境変数確認 - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'あり' : 'なし');
    console.log('APIキー先頭:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'undefined');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API 応答成功');
    res.json(data);
    
  } catch (error) {
    console.error('OpenAI API プロキシエラー:', error);
    
    // フォールバック応答
    const mockResponse = {
      choices: [{
        message: {
          content: "申し訳ございません。現在OpenAI APIに接続できません。後ほどお試しください。"
        }
      }]
    };
    
    res.status(500).json(mockResponse);
  }
});

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'OpenAI Proxy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;