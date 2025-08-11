# Pochagram (Healthgram)

Instagram風健康SNSアプリ「pochagram（healthgram）」

## 機能

- ユーザープロフィール設定
- 王子キャラクターのカスタマイズ
- 食事画像のアップロードと分析
- 進捗記録と可視化
- **AIテスター（井戸端会議）**: 4キャラクターによる美容・健康に関する議論

## AIテスター機能

4人のキャラクターが美容・健康に関するトピックについて井戸端会議を行います：

- **野比玉子**: OpenAI GPT-3.5-turbo（優しい母親、家計重視）
- **福士とみ**: OpenAI GPT-3.5-turbo（津軽弁のおばあちゃん、昔ながらの知恵）
- **骨川スネ子**: AWS Bedrock Claude 3.5 Sonnet（上品なセレブママ、高級志向）
- **剛田椿**: AWS Bedrock Claude 3.5 Sonnet（豪快な庶民派ママ、コスパ重視）

## セットアップ

### 1. 依存関係のインストール

```bash
# フロントエンド
npm install

# バックエンド
npm run install-server
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下を設定：

```env
# OpenAI API設定
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# AWS Bedrock設定
REACT_APP_AWS_REGION=ap-northeast-1
REACT_APP_AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
REACT_APP_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# Bedrock API URL
REACT_APP_BEDROCK_API_URL=http://localhost:3001/api/bedrock
```

### 3. アプリケーションの起動

#### 方法1: 同時起動（推奨）
```bash
npm run dev
```

#### 方法2: 個別起動
```bash
# ターミナル1: バックエンドサーバー
npm run server

# ターミナル2: フロントエンド
npm start
```

#### 方法3: Windowsバッチファイル
```bash
# バックエンドサーバーのみ
start-server.bat
```

## アーキテクチャ

### フロントエンド
- React.js
- OpenAI API（野比玉子、福士とみ）
- Bedrock API Proxy（骨川スネ子、剛田椿）

### バックエンド
- Express.js
- AWS Bedrock Runtime API
- OpenAI API互換エンドポイント

### API構成

```
Frontend (React)
    ↓
OpenAI API (直接) ← 野比玉子、福士とみ
    ↓
Backend API Proxy (Express)
    ↓
AWS Bedrock ← 骨川スネ子、剛田椿
```

## 使用方法

1. アプリケーションを起動
2. AIテスター機能にアクセス
3. 「新しい井戸端会議」をクリック
4. トピックを入力（例：「おすすめのスキンケア商品は？」）
5. 参加者を選択（4人全員推奨）
6. 「井戸端会議を開始」をクリック
7. キャラクターたちの議論を楽しむ

## 技術スタック

- **フロントエンド**: React.js, CSS
- **バックエンド**: Node.js, Express.js
- **AI**: OpenAI GPT-3.5-turbo, AWS Bedrock Claude 3.5 Sonnet
- **インフラ**: AWS (Bedrock)

## 開発

### ポート設定
- フロントエンド: http://localhost:3000
- バックエンド: http://localhost:3001

### API エンドポイント
- Bedrock Proxy: `POST /api/bedrock/chat/completions`
- Health Check: `GET /api/bedrock/health`

## トラブルシューティング

### Bedrock APIエラー
- AWS認証情報を確認
- 東京リージョン（ap-northeast-1）でClaude 3.5 Sonnetモデルへのアクセス許可を確認
- バックエンドサーバーが起動していることを確認

### OpenAI APIエラー
- APIキーを確認
- 利用制限を確認

エラー時は自動的にモック応答にフォールバックします。