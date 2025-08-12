const express = require('express');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const router = express.Router();

// Bedrock クライアントの初期化
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BACKEND_AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.BACKEND_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BACKEND_AWS_SECRET_ACCESS_KEY
  }
});

// OpenAI API互換のエンドポイント
router.post('/chat/completions', async (req, res) => {
  try {
    const { messages, model, temperature = 0.7, max_tokens = 150, character_id } = req.body;

    // メッセージからプロンプトを構築
    const userMessage = messages.find(msg => msg.role === 'user');
    const systemMessage = messages.find(msg => msg.role === 'system');
    
    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    // Bedrock用のリクエストボディを構築
    const bedrockRequest = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: max_tokens,
      temperature: temperature,
      messages: [
        {
          role: "user",
          content: userMessage.content
        }
      ]
    };

    // システムメッセージがある場合は追加
    if (systemMessage) {
      bedrockRequest.system = systemMessage.content;
    }

    // モデルIDの設定（Claude 3.5 Sonnetを使用）
    const modelId = model || 'anthropic.claude-3-5-sonnet-20240620-v1:0';

    console.log(`🤖 Bedrock API呼び出し開始 - Character: ${character_id}, Model: ${modelId}`);

    const command = new InvokeModelCommand({
      modelId: modelId,
      body: JSON.stringify(bedrockRequest)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log(`✅ Bedrock API呼び出し完了 - Character: ${character_id}`);

    // OpenAI API互換のレスポンス形式で返す
    const openaiCompatibleResponse = {
      id: `bedrock-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: modelId,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseBody.content[0].text.trim()
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 0, // Bedrockでは詳細なトークン数が取得できない場合がある
        completion_tokens: 0,
        total_tokens: 0
      }
    };

    res.json(openaiCompatibleResponse);

  } catch (error) {
    console.error('❌ Bedrock API Error:', error);
    
    // エラーレスポンスもOpenAI API互換形式で返す
    res.status(500).json({
      error: {
        message: error.message || 'Bedrock API call failed',
        type: 'bedrock_error',
        code: error.code || 'unknown_error'
      }
    });
  }
});

// ヘルスチェック
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bedrock API proxy is running',
    region: process.env.AWS_REGION 
  });
});

// Bedrock接続テスト用エンドポイント
router.get('/test', async (req, res) => {
  try {
    console.log('🔍 Bedrock接続テスト開始...');
    
    const testRequest = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: "こんにちは、接続テストです。短く挨拶してください。"
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      body: JSON.stringify(testRequest)
    });

    console.log('📡 Bedrockにテストリクエスト送信中...');
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ Bedrock接続テスト成功！');
    
    res.json({
      status: 'SUCCESS',
      message: 'Bedrock connection test successful',
      response: responseBody.content[0].text.trim(),
      model: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
      region: process.env.AWS_REGION
    });
    
  } catch (error) {
    console.error('❌ Bedrock接続テストエラー:', error);
    
    let errorMessage = 'Unknown error';
    let solution = 'Check AWS credentials and permissions';
    
    if (error.name === 'AccessDeniedException') {
      errorMessage = 'Access denied to Claude 3 Haiku model';
      solution = 'Enable model access in AWS Console: Bedrock → Model access → Claude 3 Haiku';
    } else if (error.name === 'ValidationException') {
      errorMessage = 'Invalid request format or model ID';
      solution = 'Check model ID and request format';
    } else if (error.name === 'ThrottlingException') {
      errorMessage = 'Request rate limit exceeded';
      solution = 'Wait and retry, or check usage limits';
    }
    
    res.status(500).json({
      status: 'ERROR',
      error: error.name || 'BedrockError',
      message: errorMessage,
      solution: solution,
      details: error.message
    });
  }
});

module.exports = router;