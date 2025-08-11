// Bedrock接続テスト用スクリプト
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

async function testBedrockConnection() {
  console.log('🔍 Bedrock接続テスト開始...');
  
  const client = new BedrockRuntimeClient({
    region: 'ap-northeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your_aws_access_key_id_here',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your_aws_secret_access_key_here'
    }
  });

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 50,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: "こんにちは、テストです。"
          }
        ]
      })
    });

    console.log('📡 Bedrockにリクエスト送信中...');
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ Bedrock接続成功！');
    console.log('📝 応答:', responseBody.content[0].text);
    
  } catch (error) {
    console.error('❌ Bedrock接続エラー:', error.message);
    
    if (error.name === 'AccessDeniedException') {
      console.log('🔐 アクセス権限エラー: Claude 3 Haikuモデルへのアクセス許可が必要です');
      console.log('📋 対処法:');
      console.log('1. AWS Console → Bedrock → Model access');
      console.log('2. Claude 3 Haikuにアクセス許可を設定');
    } else if (error.name === 'ValidationException') {
      console.log('📝 リクエスト形式エラー: モデルIDまたはリクエスト形式を確認してください');
    } else {
      console.log('🔧 その他のエラー:', error);
    }
  }
}

testBedrockConnection();