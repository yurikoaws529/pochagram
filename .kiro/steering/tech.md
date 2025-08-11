# 技術スタック

## コア技術
- プログラミング言語: JavaScript/TypeScript, HTML, CSS
- フレームワーク: React.js (フロントエンド), Node.js/Express (バックエンド)
- ライブラリ: React Router, Axios, Material-UI, Chart.js
- データベース: MongoDB
- インフラ: AWS (S3 for 画像保存, Lambda for 画像分析)

## ビルドシステム
- ビルドツール: Webpack
- パッケージマネージャー: npm

## 共通コマンド

### セットアップ
```
# 開発環境のセットアップ
npm install
```

### ビルド
```
# プロジェクトのビルド
npm run build
```

### テスト
```
# テストの実行
npm test
```

### 実行
```
# ローカルでアプリケーションを実行
npm start
```

### デプロイ
```
# アプリケーションのデプロイ
npm run deploy
```

## 開発環境
- 必要なツール: VS Code, Git, Node.js (v14以上)
- 環境変数: 
  - MONGODB_URI: MongoDBの接続文字列
  - AWS_ACCESS_KEY: AWSアクセスキー
  - AWS_SECRET_KEY: AWSシークレットキー
  - S3_BUCKET_NAME: 画像保存用S3バケット名
- 依存関係: Node.js, npm

## CI/CD
- パイプライン: GitHub Actions
- デプロイ戦略: AWS Amplify を使用した継続的デプロイ