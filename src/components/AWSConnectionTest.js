import React, { useState } from 'react';
import { testAWSConnection, checkPermissions } from '../utils/awsConnectionTest';

const AWSConnectionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [permissionResult, setPermissionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('Starting AWS connection test...');
      const result = await testAWSConnection();
      setTestResult(result);
      console.log('Connection test completed:', result);
    } catch (error) {
      console.error('Connection test error:', error);
      setTestResult({
        success: false,
        message: 'Test execution failed',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runPermissionCheck = async () => {
    setIsLoading(true);
    setPermissionResult(null);
    
    try {
      console.log('Starting permission check...');
      const permissions = await checkPermissions();
      setPermissionResult(permissions);
      console.log('Permission check completed:', permissions);
    } catch (error) {
      console.error('Permission check error:', error);
      setPermissionResult({
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnvironmentVariables = () => {
    const envVars = {
      'AWS_ACCESS_KEY_ID': process.env.REACT_APP_AWS_ACCESS_KEY_ID ? '設定済み' : '未設定',
      'AWS_SECRET_ACCESS_KEY': process.env.REACT_APP_AWS_SECRET_ACCESS_KEY ? '設定済み' : '未設定',
      'AWS_REGION': process.env.REACT_APP_AWS_REGION || '未設定',
      'AWS_ACCOUNT_ID': process.env.REACT_APP_AWS_ACCOUNT_ID || '未設定'
    };

    return envVars;
  };

  const envVars = checkEnvironmentVariables();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 AWS接続テスト</h2>
      
      {/* 環境変数確認 */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📋 環境変数確認</h3>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ margin: '5px 0' }}>
            <strong>{key}:</strong> 
            <span style={{ 
              color: value === '未設定' ? 'red' : 'green',
              marginLeft: '10px'
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* テストボタン */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runConnectionTest}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '実行中...' : '🔗 基本接続テスト'}
        </button>
        
        <button 
          onClick={runPermissionCheck}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '実行中...' : '🔐 権限チェック'}
        </button>
      </div>

      {/* 接続テスト結果 */}
      {testResult && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px'
        }}>
          <h3>🔗 接続テスト結果</h3>
          <div>
            <strong>ステータス:</strong> 
            <span style={{ color: testResult.success ? 'green' : 'red', marginLeft: '10px' }}>
              {testResult.success ? '✅ 成功' : '❌ 失敗'}
            </span>
          </div>
          <div><strong>メッセージ:</strong> {testResult.message}</div>
          
          {testResult.details && (
            <div style={{ marginTop: '10px' }}>
              <strong>詳細:</strong>
              <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            </div>
          )}
          
          {testResult.error && (
            <div style={{ marginTop: '10px', color: 'red' }}>
              <strong>エラー:</strong> {testResult.error}
            </div>
          )}
        </div>
      )}

      {/* 権限チェック結果 */}
      {permissionResult && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '8px'
        }}>
          <h3>🔐 権限チェック結果</h3>
          
          {permissionResult.error ? (
            <div style={{ color: 'red' }}>
              <strong>エラー:</strong> {permissionResult.error}
            </div>
          ) : (
            <div>
              {Object.entries(permissionResult).map(([permission, hasAccess]) => (
                <div key={permission} style={{ margin: '5px 0' }}>
                  <strong>{permission}:</strong>
                  <span style={{ 
                    color: hasAccess ? 'green' : 'red',
                    marginLeft: '10px'
                  }}>
                    {hasAccess ? '✅ 利用可能' : '❌ アクセス拒否'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 使用方法 */}
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px'
      }}>
        <h3>📖 使用方法</h3>
        <ol>
          <li><strong>環境変数確認:</strong> 全ての環境変数が「設定済み」になっていることを確認</li>
          <li><strong>基本接続テスト:</strong> AWSとの基本的な接続を確認</li>
          <li><strong>権限チェック:</strong> 必要なRekognition機能へのアクセス権限を確認</li>
        </ol>
        
        <div style={{ marginTop: '15px' }}>
          <strong>⚠️ 注意事項:</strong>
          <ul>
            <li>テスト実行時にAWS料金が少額発生する可能性があります</li>
            <li>エラーが発生した場合は、ブラウザの開発者ツール（F12）のConsoleタブで詳細を確認してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AWSConnectionTest;