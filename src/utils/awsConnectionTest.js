import rekognitionService from '../services/rekognitionService';

// AWS接続テスト
export const testAWSConnection = async () => {
  console.log('=== AWS Connection Test ===');
  
  try {
    // 1. 設定の検証
    console.log('1. Validating AWS configuration...');
    rekognitionService.initialize();
    console.log('✅ AWS configuration is valid');

    // 2. Rekognitionサービスの疎通確認
    console.log('2. Testing Rekognition service...');
    
    // 小さなテスト画像を作成（1x1ピクセルの透明PNG）
    const testImageBlob = createTestImage();
    
    try {
      const labels = await rekognitionService.detectLabels(testImageBlob, {
        maxLabels: 1,
        minConfidence: 50
      });
      
      console.log('✅ Rekognition service is accessible');
      console.log('Test result:', labels);
      
      return {
        success: true,
        message: 'AWS connection test passed',
        details: {
          region: process.env.REACT_APP_AWS_REGION,
          labelsDetected: labels.length
        }
      };
      
    } catch (rekognitionError) {
      console.error('❌ Rekognition service error:', rekognitionError);
      
      // エラーの種類を判定
      if (rekognitionError.code === 'InvalidImageFormatException') {
        return {
          success: true,
          message: 'Connection OK (expected image format error)',
          details: { error: 'Test image format issue (normal)' }
        };
      }
      
      throw rekognitionError;
    }
    
  } catch (error) {
    console.error('❌ AWS connection test failed:', error);
    
    return {
      success: false,
      message: 'AWS connection test failed',
      error: error.message,
      details: {
        errorCode: error.code,
        errorType: error.name
      }
    };
  }
};

// テスト用の小さな画像を作成
const createTestImage = () => {
  // 1x1ピクセルの透明PNG（Base64）
  const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  // Base64をBlobに変換
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
};

// 権限チェック
export const checkPermissions = async () => {
  console.log('=== Permission Check ===');
  
  const permissions = {
    detectLabels: false,
    detectText: false,
    detectFaces: false
  };
  
  const testImage = createTestImage();
  
  // DetectLabels権限チェック
  try {
    await rekognitionService.detectLabels(testImage, { maxLabels: 1 });
    permissions.detectLabels = true;
    console.log('✅ DetectLabels permission: OK');
  } catch (error) {
    console.log('❌ DetectLabels permission: DENIED');
    console.log('Error:', error.message);
  }
  
  // DetectText権限チェック
  try {
    await rekognitionService.detectText(testImage);
    permissions.detectText = true;
    console.log('✅ DetectText permission: OK');
  } catch (error) {
    console.log('❌ DetectText permission: DENIED');
    console.log('Error:', error.message);
  }
  
  // DetectFaces権限チェック
  try {
    await rekognitionService.detectFaces(testImage);
    permissions.detectFaces = true;
    console.log('✅ DetectFaces permission: OK');
  } catch (error) {
    console.log('❌ DetectFaces permission: DENIED');
    console.log('Error:', error.message);
  }
  
  return permissions;
};