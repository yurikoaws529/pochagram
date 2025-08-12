// OpenAI API サービス（野比さん・とみさん用）
class OpenAIService {
  constructor() {
    this.isConfigured = false;
    this.apiUrl = process.env.REACT_APP_OPENAI_API_URL || 'http://localhost:3001/api/openai/chat/completions';
  }

  initialize() {
    this.isConfigured = true;
    console.log('OpenAI service initialized successfully');
    console.log('API URL:', this.apiUrl);
    return true;
  }

  async generateResponse(character, topic, conversationHistory, round) {
    if (!this.isConfigured) {
      if (!this.initialize()) {
        throw new Error('OpenAI service not configured');
      }
    }

    try {
      const prompt = this.buildPrompt(character, topic, conversationHistory, round);
      
      console.log(`OpenAI API呼び出し開始 - ${character.name}`);
      console.log('プロンプト:', prompt);
      
      const requestBody = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: this.getSystemMessage(character)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: character.id === 'tomi' ? 0.9 : 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
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
      console.log(`OpenAI応答生成完了 - ${character.name}:`, generatedText);
      
      return generatedText;
      
    } catch (error) {
      console.error(`OpenAI API error for ${character.name}:`, error);
      
      // フォールバック応答を返す（エラーを投げない）
      const fallbackResponses = {
        tamako: "申し訳ございません。現在システムメンテナンス中です。後ほどお試しください。",
        tomi: "すまねぇだべ、今ちょっと調子悪いみたいだべ。また後で話しかけてくれだべ。"
      };
      
      return fallbackResponses[character.id] || "申し訳ございません。現在ご利用いただけません。";
    }
  }

  getSystemMessage(character) {
    const systemMessages = {
      tamako: `あなたは野比玉子（38歳）、のび太のママです。
特徴:
- 優しく家庭的な性格で、家族思い
- 家計を気にする実用的な考え方
- 子供の安全性を重視する母親
- 5000円以下の化粧品を好む庶民的な感覚
- よく見るメディア: STORY、美ST、VOCE、X（twitter）

口調: 「〜ですね」「〜かしら」「〜のよ」「〜ですもの」「〜ですわ」
話し方: 丁寧で優しく、時々心配そうに話す。「のび太にも〜」「お母さんとしては〜」などの表現を使う。

重要: 可能な限り「STORYで読んだのですが〜」「美STに載っていた〜」「VOCEで紹介されていた〜」「Xで話題になっていた〜」など、よく見るメディアを出典として言及してください。

回答は100文字以内で、キャラクターらしい温かみのある表現で答えてください。`,

      tomi: `あなたは福士とみ（79歳）、津軽弁を話すおばあちゃんです。
特徴:
- 人生経験豊富で昔ながらの知恵を持つ
- ドラッグストアでよく買い物をする
- 8000円以下の化粧品を好む実用的な価値観
- 伝統的で温かい人柄
- よく見るメディア: 近所のドラッグストア

口調: 「〜だべ」「〜だべな」「〜じゃ」「〜はんで」「〜っちゃ」
話し方: 津軽弁で温かく話し、「わだしの若い頃はな〜」「昔からの知恵でな〜」などの表現を使う。

重要: 可能な限り「ドラッグストアで聞いただべ〜」「薬剤師さんが言ってたべ〜」「近所の人から教わっただべ〜」など、ドラッグストアや近所での情報を出典として言及してください。

回答は100文字以内で、津軽弁を使った温かみのある表現で答えてください。`
    };

    return systemMessages[character.id] || systemMessages.tamako;
  }

  buildPrompt(character, topic, conversationHistory, round) {
    let prompt = `お題: "${topic}"\n\n`;
    
    // 集約モードの場合
    if (round === 'summary') {
      return this.buildSummaryPrompt(character, topic, conversationHistory);
    }
    
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += "これまでの会話:\n";
      const recentMessages = conversationHistory.slice(-6); // 直近6発言
      recentMessages.forEach(msg => {
        prompt += `${msg.character.name}: ${msg.text}\n`;
      });
      prompt += "\n";
    }

    if (round === 1) {
      prompt += `${character.name}として、このお題について最初の意見を述べてください。`;
    } else {
      prompt += `${character.name}として、これまでの会話を踏まえて自然に会話を続けてください。他の人の意見に対して反応したり、新しい視点を加えたりしてください。`;
    }

    prompt += `\n\n注意事項:
- ${character.name}の性格と口調を必ず保ってください
- 100文字以内で簡潔に回答してください
- 井戸端会議らしい自然な会話になるように心がけてください
- キャラクターらしい特徴的な表現を使ってください`;

    return prompt;
  }

  buildSummaryPrompt(character, topic, conversationHistory) {
    let prompt = `お題: "${topic}"\n\n`;
    prompt += "これまでの議論:\n";
    
    // 集約用に全ての会話を含める
    conversationHistory.forEach(msg => {
      if (!msg.isSummary) {
        prompt += `${msg.character.name}: ${msg.text}\n`;
      }
    });
    
    // お題の種類を判定して適切な集約指示を生成
    const isQuestionTopic = topic.includes('？') || topic.includes('?') || 
                           topic.includes('おすすめ') || topic.includes('どれ') || 
                           topic.includes('どの') || topic.includes('何') ||
                           topic.includes('選ぶ') || topic.includes('良い');
    
    if (isQuestionTopic) {
      prompt += `\n${character.name}として、司会者の立場でお題の質問に対する具体的な回答を提供してください：

1. 各参加者が推奨した具体的な商品・ブランド・選択肢を整理
2. 最も支持された推奨事項を明確に特定
3. お題の質問に対する明確で具体的な答えを提示
4. その推奨理由を参加者の意見を基に説明

150文字以内で、お題の質問に対する実用的で具体的な回答を提供してください。「〜がおすすめです」「〜を選ぶと良いでしょう」のような明確な結論を含めてください。`;
    } else {
      prompt += `\n${character.name}として、司会者の立場で議論を集約してください：

1. 各参加者の主要な意見を整理
2. 共通点と相違点を明確化  
3. 全体的な総評を提供
4. 実用的な結論やアドバイスを含める

150文字以内で、司会者らしい丁寧で包括的な集約を行ってください。`;
    }

    return prompt;
  }
}

// シングルトンインスタンス
const openaiService = new OpenAIService();
export default openaiService;