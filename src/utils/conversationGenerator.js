// 会話生成システム（OpenAI + LangChain統合版）
import { characters, speakingPatterns, createMessage, evaluationCriteria, openaiCharacters, langchainCharacters } from './aiTesterData';
import openaiService from '../services/openaiService';
import bedrockService from '../services/langchainAgentService';

// 司会者による意見集約生成
export const generateModeratorSummary = async (moderatorId, topic, conversation) => {
  const character = characters[moderatorId];
  
  // OpenAI APIを使用するキャラクターかチェック
  if (openaiCharacters.includes(moderatorId)) {
    try {
      console.log(`司会者による意見集約開始: ${character.name}`);
      
      // 会話履歴から各参加者の主要な意見を抽出
      const participantOpinions = extractParticipantOpinions(conversation);
      
      const prompt = buildSummaryPrompt(character, topic, participantOpinions);
      
      const response = await openaiService.generateResponse(character, topic, conversation, 'summary');
      console.log(`司会者による意見集約完了: ${character.name} - ${response}`);
      return response;
    } catch (error) {
      console.error(`司会者による意見集約エラー (${character.name}):`, error);
      // エラー時はモック集約にフォールバック
      return generateMockSummary(moderatorId, topic, conversation);
    }
  }
  
  // Bedrockを使用するキャラクターかチェック
  if (langchainCharacters.includes(moderatorId)) {
    try {
      console.log(`Bedrock司会者による意見集約開始: ${character.name}`);
      const response = await bedrockService.generateResponse(moderatorId, topic, conversation, 'summary');
      console.log(`Bedrock司会者による意見集約完了: ${character.name} - ${response}`);
      return response;
    } catch (error) {
      console.error(`Bedrock司会者による意見集約エラー (${character.name}):`, error);
      // エラー時はモック集約にフォールバック
      return generateMockSummary(moderatorId, topic, conversation);
    }
  }
  
  // その他のキャラクターは既存のモック集約
  return generateMockSummary(moderatorId, topic, conversation);
};

// 参加者の意見を抽出
const extractParticipantOpinions = (conversation) => {
  const opinions = {};
  
  conversation.forEach(message => {
    if (!message.isSummary) {
      if (!opinions[message.characterId]) {
        opinions[message.characterId] = [];
      }
      opinions[message.characterId].push(message.text);
    }
  });
  
  return opinions;
};

// 集約用プロンプト構築
const buildSummaryPrompt = (character, topic, participantOpinions) => {
  let prompt = `お題: "${topic}"\n\n`;
  prompt += "参加者の意見:\n";
  
  Object.entries(participantOpinions).forEach(([characterId, opinions]) => {
    const participantName = characters[characterId].name;
    prompt += `\n${participantName}の意見:\n`;
    opinions.forEach((opinion, index) => {
      prompt += `${index + 1}. ${opinion}\n`;
    });
  });
  
  // お題の種類を判定して適切な集約指示を生成
  const isQuestionTopic = topic.includes('？') || topic.includes('?') || 
                         topic.includes('おすすめ') || topic.includes('どれ') || 
                         topic.includes('どの') || topic.includes('何');
  
  if (isQuestionTopic) {
    prompt += `\n${character.name}として、司会者の立場でお題に対する具体的な回答を提供してください：

1. 各参加者の推奨事項や意見を整理
2. 最も支持された選択肢や共通の推奨事項を明確化
3. お題の質問に対する具体的な答えを提示
4. その理由や根拠を簡潔に説明

150文字以内で、お題の質問に対する明確で実用的な回答を提供してください。`;
  } else {
    prompt += `\n${character.name}として、司会者の立場で以下を行ってください：
1. 各参加者の主要な意見を整理
2. 共通点と相違点を明確化
3. 全体的な総評を提供
4. 実用的な結論やアドバイスを含める

150文字以内で、司会者らしい丁寧で包括的な集約を行ってください。`;
  }
  
  return prompt;
};

// モック集約生成
const generateMockSummary = (moderatorId, topic, conversation) => {
  const character = characters[moderatorId];
  const patterns = speakingPatterns[character.speakingStyle];
  
  // お題が質問形式かどうかを判定
  const isQuestionTopic = topic.includes('？') || topic.includes('?') || 
                         topic.includes('おすすめ') || topic.includes('どれ') || 
                         topic.includes('どの') || topic.includes('何');
  
  let summaryTemplates;
  
  if (isQuestionTopic) {
    // 質問形式のお題に対する回答テンプレート
    summaryTemplates = {
      tamako: [
        `皆さんのご意見を聞いて、${topic.replace('？', '').replace('?', '')}については、お手頃で安全なものが一番良いと思います。家計に優しくて、のび太にも安心して使えるものを選びたいですね`,
        `今日の議論で、価格と品質のバランスが大切だということが分かりました。お母さんとしては、5000円以下で良い商品を選ぶのがおすすめです`,
        `皆さんの意見を参考にすると、実用性を重視した選択が良さそうです。家族みんなで使えるものを選ぶのが一番ですね`
      ],
      suneko: [
        `皆様のご意見を総合すると、やはり品質の良いものを選ぶのが正解ですわね。多少お値段が張っても、長く使えるものがおすすめです`,
        `今回の議論で、投資する価値のある商品の見極め方が分かりました。スネ夫にも良いものを選んであげたいと思います`,
        `セレブな奥様方の間でも話題になっているような、上質なものを選ぶのが間違いありませんわ`
      ],
      tsubaki: [
        `みんなの話を聞いて、コスパの良いものが一番だってことが分かったよ。実用的で長持ちするものを選ぶのがおすすめだね`,
        `庶民の知恵を集めると、やっぱり安くて良いものが見つかるもんだ。1500円以下でも十分良いものがあるよ`,
        `ジャイアンにも教えてやりたいけど、実際に使ってみて良かったものを選ぶのが一番確実だね`
      ],
      tomi: [
        `みなさんの意見を聞いて、昔からの知恵で選ぶのが一番だと思っただべ。ドラッグストアで相談して、8000円以下で良いものを選ぶのがおすすめだべな`,
        `若い人たちの意見も参考になったけど、やっぱり長年使ってみて良かったものが確実だべ。わだしの経験からもそう思うじゃ`,
        `長生きしてると分かるけど、値段じゃなくて自分に合うものを選ぶのが大事だべ。みんなで話し合って決めるのが良いもんだな`
      ]
    };
  } else {
    // 一般的なお題に対する集約テンプレート
    summaryTemplates = {
      tamako: [
        `皆さん、${topic}について貴重なご意見をありがとうございました。それぞれ違った視点があって勉強になりました`,
        `今日の議論を聞いていて、${topic}については様々な考え方があることがよく分かりました`,
        `お母さんとしては、皆さんの意見を参考にして家族にも伝えたいと思います`
      ],
      suneko: [
        `皆様、${topic}について活発な議論をありがとうございました。さすが皆様、それぞれ素晴らしい見識をお持ちですわ`,
        `今回の${topic}の件、皆様のご意見を伺って大変参考になりました`,
        `やはり品質の良い情報交換ができて、有意義な時間でしたわ`
      ],
      tsubaki: [
        `みんな、${topic}についていろんな意見が聞けて良かったよ。それぞれの立場があるからね`,
        `今日の${topic}の話、実用的な意見がたくさん出て参考になったね`,
        `庶民の知恵が集まると、やっぱり良いアイデアが生まれるもんだ`
      ],
      tomi: [
        `みなさん、${topic}についてたくさんお話しできて良かっただべ。わだしも勉強になったじゃ`,
        `${topic}のこと、若い人たちの意見も聞けて、昔とは違うもんだなと思っただべ`,
        `長生きしてると、いろんな考え方があるのが分かって面白いもんだべな`
      ]
    };
  }
  
  const templates = summaryTemplates[moderatorId] || summaryTemplates.tamako;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const ending = patterns ? patterns.endings[Math.floor(Math.random() * patterns.endings.length)] : 'ですね';
  
  return template + ending;
};

// キャラクター別の応答生成
export const generateCharacterResponse = async (characterId, topic, round, previousMessages = []) => {
  const character = characters[characterId];
  
  // OpenAI APIを使用するキャラクターかチェック
  if (openaiCharacters.includes(characterId)) {
    try {
      console.log(`OpenAI応答生成開始: ${character.name}`);
      const response = await openaiService.generateResponse(character, topic, previousMessages, round);
      console.log(`OpenAI応答生成完了: ${character.name} - ${response}`);
      return response;
    } catch (error) {
      console.error(`OpenAI応答生成エラー (${character.name}):`, error);
      // エラー時はモック応答にフォールバック
      return generateMockResponse(characterId, topic, round, previousMessages);
    }
  }
  
  // Bedrockを使用するキャラクターかチェック
  if (langchainCharacters.includes(characterId)) {
    try {
      console.log(`Bedrock応答生成開始: ${character.name}`);
      const response = await bedrockService.generateResponse(characterId, topic, previousMessages, round);
      console.log(`Bedrock応答生成完了: ${character.name} - ${response}`);
      return response;
    } catch (error) {
      console.error(`Bedrock応答生成エラー (${character.name}):`, error);
      // エラー時はモック応答にフォールバック
      return generateMockResponse(characterId, topic, round, previousMessages);
    }
  }
  
  // その他のキャラクターは既存のモック応答
  return generateMockResponse(characterId, topic, round, previousMessages);
};

// モック応答生成（既存の仕組み）
const generateMockResponse = (characterId, topic, round, previousMessages = []) => {
  const character = characters[characterId];
  const patterns = speakingPatterns[character.speakingStyle];
  
  if (!patterns) {
    return `${character.name}です。${topic}について考えてみますね。`;
  }

  // ラウンドに応じた応答パターン
  let response = '';
  
  if (round === 1) {
    // 最初のラウンド：トピックに対する初期反応
    response = generateInitialResponse(character, topic, patterns);
  } else {
    // 後続ラウンド：他の参加者への反応
    response = generateFollowUpResponse(character, topic, patterns, previousMessages);
  }

  return response;
};

// 初期応答生成
const generateInitialResponse = (character, topic, patterns) => {
  const pattern = patterns.patterns[Math.floor(Math.random() * patterns.patterns.length)];
  const ending = patterns.endings[Math.floor(Math.random() * patterns.endings.length)];
  
  let response = pattern.replace('{topic}', topic);
  
  // キャラクター特有の反応を追加
  switch (character.id) {
    case 'tamako':
      response += getGentleMotherResponse(topic);
      break;
    case 'suneko':
      response += getSophisticatedMotherResponse(topic);
      break;
    case 'tsubaki':
      response += getStrongMotherResponse(topic);
      break;
    case 'tomi':
      response += getTsugaruResponse(topic);
      break;
  }
  
  return response + ending;
};

// フォローアップ応答生成
const generateFollowUpResponse = (character, topic, patterns, previousMessages) => {
  const lastMessage = previousMessages[previousMessages.length - 1];
  const pattern = patterns.patterns[Math.floor(Math.random() * patterns.patterns.length)];
  const ending = patterns.endings[Math.floor(Math.random() * patterns.endings.length)];
  
  let response = '';
  
  // 前の発言に対する反応
  if (lastMessage && lastMessage.characterId !== character.id) {
    response = generateReactionToMessage(character, lastMessage, patterns);
  } else {
    response = pattern.replace('{topic}', topic);
  }
  
  return response + ending;
};

// 各キャラクター特有の応答パターン
const getGentleMotherResponse = (topic) => {
  const responses = [
    `STORYで読んだのですが、${topic}は家族のことを考えると大切ですね`,
    `美STに載っていた記事で、のび太にも教えてあげたいと思いました`,
    `VOCEで紹介されていて、お母さんとしては心配になります`,
    `Xで話題になっていて、家計に優しいものがいいですね`,
    `STORYの特集で見て、安全で安心なものを選びたいです`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getSophisticatedMotherResponse = (topic) => {
  const responses = [
    `美的で特集されていましたが、やはり品質の良いものでないと`,
    `VERYに掲載されていて、スネ夫には最高のものを与えたいの`,
    `LEEで紹介されていて、セレブな奥様方もおすすめしてるの`,
    `美的の記事で読みましたが、お値段が高くても価値があるものは`,
    `VERYで見ましたが、うちでは当然のことですけど`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getStrongMotherResponse = (topic) => {
  const responses = [
    `めざましTVで紹介されてて、ジャイアンにも言ってるんだけどね`,
    `YouTubeで見たんだけど、うちは庶民だから実用性重視よ`,
    `めざましTVで特集されてたよ`,
    `YouTuberが使ってて、安くて良いものが一番だね`,
    `YouTubeで話題になってたけど、でも、これだけは譲れないよ`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getTsugaruResponse = (topic) => {
  const responses = [
    `ドラッグストアで薬剤師さんに聞いただべ、わだしの若い頃はな`,
    `ドラッグストアで聞いたんだけんど`,
    `近所の人から教わっただべ、まんず、これが大事だべ`,
    `ドラッグストアの店員さんが言ってたべ、昔からの知恵でな`,
    `薬剤師さんもそう言ってるべ`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

// メッセージに対する反応生成
const generateReactionToMessage = (character, message, patterns) => {
  const reactions = {
    tamako: [
      `${message.character.name}さんのおっしゃる通り`,
      `そうですね、でも`,
      `なるほど、それは`,
      `私も同感です`
    ],
    suneko: [
      `まあ、${message.character.name}さん`,
      `それはそうですけど`,
      `うちでは違いますの`,
      `やはりそうですわね`
    ],
    tsubaki: [
      `${message.character.name}さん、それは`,
      `そうかもしれないけど`,
      `うちの場合は`,
      `なるほどね`
    ],
    tomi: [
      `${message.character.name}さんの言う通りだべ`,
      `そうだべな、でも`,
      `わだしもそう思うじゃ`,
      `昔からそう言うべ`
    ]
  };
  
  const characterReactions = reactions[character.id] || reactions.tamako;
  return characterReactions[Math.floor(Math.random() * characterReactions.length)];
};

// ディスカッション全体の生成
export const generateDiscussion = async (topic, participantIds, rounds = 2, moderatorId = null) => {
  const conversation = [];
  const actualModerator = moderatorId || participantIds[0];
  
  for (let round = 1; round <= rounds; round++) {
    // 各ラウンドで参加者がランダムな順序で発言
    const shuffledParticipants = [...participantIds].sort(() => Math.random() - 0.5);
    
    for (const participantId of shuffledParticipants) {
      try {
        const response = await generateCharacterResponse(participantId, topic, round, conversation);
        const message = createMessage(participantId, response, round);
        conversation.push(message);
        
        // 少し間隔を空ける（UIでの表示効果用）
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`会話生成エラー (${participantId}):`, error);
        // エラー時はデフォルトメッセージを使用
        const fallbackResponse = `${characters[participantId].name}です。${topic}について考えてみますね。`;
        const message = createMessage(participantId, fallbackResponse, round);
        conversation.push(message);
      }
    }
  }
  
  // 最後に司会者による意見集約を追加
  try {
    const summaryResponse = await generateModeratorSummary(actualModerator, topic, conversation);
    const summaryMessage = createMessage(actualModerator, summaryResponse, rounds + 1);
    summaryMessage.isSummary = true; // 集約メッセージであることを示すフラグ
    conversation.push(summaryMessage);
  } catch (error) {
    console.error('司会者による意見集約エラー:', error);
    // エラー時はデフォルトの集約メッセージを追加
    const fallbackSummary = `${characters[actualModerator].name}です。皆さんの貴重なご意見をありがとうございました。${topic}について活発な議論ができました。`;
    const summaryMessage = createMessage(actualModerator, fallbackSummary, rounds + 1);
    summaryMessage.isSummary = true;
    conversation.push(summaryMessage);
  }
  
  return conversation;
};

// 司会者の集約メッセージを取得
export const getDiscussionSummary = (conversation) => {
  const summaryMessage = conversation.find(msg => msg.isSummary);
  return summaryMessage ? summaryMessage.text : null;
};

