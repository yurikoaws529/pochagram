import AWS from 'aws-sdk';

// AWS設定
const configureAWS = () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_REGION
  });
};

// Rekognitionクライアントを作成
const createRekognitionClient = () => {
  configureAWS();
  return new AWS.Rekognition();
};

// S3クライアントを作成（将来的に画像保存で使用）
const createS3Client = () => {
  configureAWS();
  return new AWS.S3();
};

// 設定情報の検証
const validateAWSConfig = () => {
  const requiredEnvVars = [
    'REACT_APP_AWS_ACCESS_KEY_ID',
    'REACT_APP_AWS_SECRET_ACCESS_KEY',
    'REACT_APP_AWS_REGION'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing AWS environment variables:', missingVars);
    return false;
  }

  console.log('AWS configuration validated successfully');
  console.log('Region:', process.env.REACT_APP_AWS_REGION);
  console.log('Account ID:', process.env.REACT_APP_AWS_ACCOUNT_ID);
  
  return true;
};

export {
  configureAWS,
  createRekognitionClient,
  createS3Client,
  validateAWSConfig
};