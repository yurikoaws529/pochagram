// Bedrock サービス（骨川スネ子・剛田椿用）
// AWS SDKの互換性問題を回避するため、シンプルな実装を使用

class BedrockService {
  constructor() {
    this.isInitialized = false;
    this.apiUrl = process.env.REACT_APP_BEDROCK_API_URL || 'http://localhost:3001/api/bedrock';
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('Bedrock Service初期化開始');

      // ヘルスチェックをスキップして直接初期化完了
      console.log('Bedrock APIサーバー接続確認: ヘルスチェックをスキップ');

      this.isInitialized = true;
      console.log('Bedrock Service初期化完了');
      return true;
    } catch (error) {
      console.error('Bedrock Service初期化エラー:', error);
      return false;
    }
  }

  async invokeModel(characterId, prompt) {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        // 初期化に失敗した場合はモック応答にフォールバック
        console.warn(`Bedrock API初期化失敗、モック応答を使用: ${characterId}`);
        return this.generateMockBedrockResponse(characterId, prompt);
      }
    }

    try {
      console.log(`Bedrock API呼び出し開始: ${characterId}`);

      // OpenAI API互換の形式でリクエストを送信
      const requestBody = {
        messages: [
          {
            role: 'system',
            content: this.getSystemMessage(characterId)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'anthropic.claude-3-5-sonnet-20240620-v1:0',
        temperature: characterId === 'suneko' ? 0.7 : 0.8,
        max_tokens: 150,
        character_id: characterId
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content.trim();

      console.log(`Bedrock API呼び出し完了: ${characterId} - ${generatedText}`);
      return generatedText;

    } catch (error) {
      console.error(`Bedrock API error for ${characterId}:`, error);

      // エラー時はモック応答にフォールバック
      console.warn(`Bedrock APIエラー、モック応答を使用: ${characterId}`);
      return this.generateMockBedrockResponse(characterId, prompt);
    }
  }

  generateMockBedrockResponse(characterId, prompt) {
    // プロンプトからトピックを抽出してより適切な応答を生成
    const topic = this.extractTopicFromPrompt(prompt);

    const responses = {
      suneko: {
        スキンケア: [
          'まあ、スキンケアでしたら、やはりSK-IIやクレ・ド・ポー ボーテがおすすめですわ。セレブな奥様方の間でも評判ですの',
          'デパコスの美容液は確かにお値段が張りますけれど、長期的に見れば投資する価値がありますわね',
          'うちでは15000円以下でも上質なものを選んでいますの。品質重視で選ぶのが大切ですわ'
        ],
        メイク: [
          'メイクでしたら、シャネルやディオールの発色の美しさは格別ですわ。スネ夫にも将来良いものを使わせてあげたいの',
          'やはり上質なコスメは持ちが違いますわね。セレブな奥様方もそうおっしゃっていますの',
          'お値段が高くても、仕上がりの美しさを考えれば納得できますわ'
        ],
        default: [
          'まあ、それは興味深いお話ですわね。うちでも品質の良いものを選ぶよう心がけていますの',
          'セレブな奥様方の間でも話題になっているような、上質なものがおすすめですわ',
          'やはり投資する価値のあるものを選ぶのが大切ですわね'
        ]
      },
      tsubaki: {
        スキンケア: [
          'スキンケアなら、ちふれや無印良品で十分だよ。ドラッグストアの商品でも効果があるからね',
          'ジャイアンにも言ってるんだけど、高いものが良いとは限らないよ。実際に使ってみて良かったものが一番さ',
          '1500円以下でも優秀な商品がたくさんあるよ。テレビでも紹介されてたし'
        ],
        メイク: [
          'メイクならキャンメイクやセザンヌがコスパ最高だね。プチプラでも上手に使えば綺麗になれるよ',
          'うちは庶民だから、安くて良いものを探すのが得意なんだ。実用性重視で選んでるよ',
          'ジャイアンにも「安くて良いもの使え」って言ってるよ。庶民の知恵だね'
        ],
        default: [
          'そうだね、実用的で長持ちするものが一番だよ。コスパを考えて選ぶのが大事だね',
          'うちは庶民だから、みんなで情報交換して良い商品を見つけるのが一番だよ',
          'テレビで紹介されたような、安くて良いものを選ぶのがおすすめだね'
        ]
      }
    };

    const characterResponses = responses[characterId] || responses.suneko;
    const topicResponses = characterResponses[topic] || characterResponses.default;

    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  }

  extractTopicFromPrompt(prompt) {
    // プロンプトからトピックキーワードを抽出
    const keywords = {
      'スキンケア': ['スキンケア', '美容液', '化粧水', '乳液', 'クリーム'],
      'メイク': ['メイク', 'ファンデーション', 'リップ', 'アイシャドウ', 'マスカラ'],
      'ヘアケア': ['シャンプー', 'トリートメント', 'ヘアケア', '髪'],
      'ダイエット': ['ダイエット', '痩せる', '体重', '運動'],
      '健康': ['健康', '栄養', 'サプリ', '食事']
    };

    for (const [topic, words] of Object.entries(keywords)) {
      if (words.some(word => prompt.includes(word))) {
        return topic;
      }
    }

    return 'default';
  }

  getSystemMessage(characterId) {
    const systemMessages = {
      suneko: `あなたは骨川スネ子（35-40歳）、スネ夫のママです。

キャラクター特性:
- 上品で洗練された性格、セレブ志向
- 高級志向で美容への投資を惜しまない  
- 15000円以下の化粧品を好む上流階級の感覚
- よく見るメディア: 美的、VERY、LEE
- 自慢話を交えながらも最終的には建設的なアドバイス

口調: 「〜ですのよ」「〜ですわよ」「〜でしてよ」「〜ざますの」「〜ですもの」
話し方: 上品で丁寧、時々自慢を交える。「うちでは〜」「セレブな奥様方の間では〜」

重要: 可能な限り「美的で特集されていた〜」「VERYに掲載されていた〜」「LEEで紹介されていた〜」など、よく見る美容雑誌を出典として言及してください。

回答は100文字以内で、キャラクターらしい上品で洗練された表現で答えてください。`,

      tsubaki: `あなたは剛田椿（35-40歳）、ジャイアンのママです。

キャラクター特性:
- 元気で豪快な性格、面倒見が良い
- 実用性重視でコスパの良い商品を好む
- 1500円以下の化粧品を好む庶民的な感覚  
- よく見るメディア: めざましTV、YouTube
- 直球で分かりやすいアドバイスをする

口調: 「〜だよ」「〜だね」「〜さ」「〜よ」「〜だからね」
話し方: 豪快で親しみやすく、実体験を交える。「ジャイアンにも〜」「うちは庶民だから〜」

重要: 可能な限り「めざましTVで紹介されてた〜」「YouTubeで見たんだけど〜」「YouTuberが使ってた〜」など、よく見るメディアを出典として言及してください。

回答は100文字以内で、キャラクターらしい豪快で親しみやすい表現で答えてください。`
    };

    return systemMessages[characterId] || systemMessages.suneko;
  }

  // キャラクター固有の知識を統合したプロンプト生成
  buildEnhancedPrompt(characterId, topic, conversationHistory, round) {
    let prompt = `お題: "${topic}"\n\n`;

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += "これまでの会話:\n";
      const recentMessages = conversationHistory.slice(-6);
      recentMessages.forEach(msg => {
        prompt += `${msg.character.name}: ${msg.text}\n`;
      });
      prompt += "\n";
    }

    // キャラクター固有の知識を追加
    const knowledge = this.getCharacterKnowledge(characterId, topic);
    if (knowledge) {
      prompt += `参考情報: ${knowledge}\n\n`;
    }

    if (round === 1) {
      prompt += `このお題について、あなたのキャラクターらしい最初の意見を述べてください。`;
    } else {
      prompt += `これまでの会話を踏まえて、あなたのキャラクターらしく自然に会話を続けてください。`;
    }

    return prompt;
  }

  // キャラクター固有の知識データベース
  getCharacterKnowledge(characterId, topic) {
    const knowledgeBase = {
      suneko: {
        'スキンケア': 'SK-IIやクレ・ド・ポー ボーテなどの高級美容液がおすすめ',
        'メイク': 'シャネルやディオールなどの上質なコスメを愛用',
        'ファンデーション': 'エスティローダーやランコムの仕上がりが美しい',
        '化粧品': '15000円以下でも品質の良いデパコスブランドを選択',
        'ブランド': 'セレブな奥様方の間で評判の高級ブランドを重視'
      },
      tsubaki: {
        'スキンケア': 'ちふれや無印良品などドラッグストアの定番商品で十分',
        'メイク': 'キャンメイクやセザンヌなどプチプラコスメが優秀',
        'ファンデーション': 'レブロンやメイベリンでもカバー力は十分',
        '化粧品': '1500円以下でコスパの良い商品を重視',
        '節約': 'テレビで紹介された実用的で安い商品を選択'
      }
    };

    const characterKnowledge = knowledgeBase[characterId];
    if (!characterKnowledge) return null;

    // トピックに関連するキーワードを検索
    const relevantKey = Object.keys(characterKnowledge).find(key =>
      topic.includes(key) || topic.toLowerCase().includes(key.toLowerCase())
    );

    return relevantKey ? characterKnowledge[relevantKey] : null;
  }

  async generateResponse(characterId, topic, conversationHistory, round) {
    try {
      const prompt = this.buildEnhancedPrompt(characterId, topic, conversationHistory, round);

      console.log(`Bedrock応答生成開始: ${characterId}`);
      const response = await this.invokeModel(characterId, prompt);
      console.log(`Bedrock応答生成完了: ${characterId} - ${response}`);

      return response;

    } catch (error) {
      console.error(`Bedrock error for ${characterId}:`, error);
      throw error;
    }
  }
}

// シングルトンインスタンス
const bedrockService = new BedrockService();
export default bedrockService;