import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import '../styles/ProductEvaluation.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ProductEvaluation = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [price, setPrice] = useState('');
  const [promotionPhrase, setPromotionPhrase] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showAudienceSettings, setShowAudienceSettings] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('sentiment'); // 'sentiment', 'age', 'gender', 'budget', 'interest'
  const [audienceSettings, setAudienceSettings] = useState({
    participantCount: 50, // 参加人数設定を追加
    gender: { male: 50, female: 50 },
    age: { '20s': 25, '30s': 30, '40s': 25, '50s': 20 },
    interest: {
      'beauty': 20,
      'tech': 20,
      'family': 15,
      'game': 15,
      'business': 15,
      'lifestyle': 15
    },
    budget: { low: 30, medium: 40, high: 30 }
  });
  const chatEndRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // 画像がアップロードされたらチャットをリセット
        setChatMessages([]);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeProduct = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setChatMessages([]);

    // 商品分析のモック処理（画像内容に基づいた判定をシミュレート）
    const productTypes = [
      { 
        name: 'スマートフォン', 
        baseAppeal: 0.8, 
        concerns: ['価格が高い', 'バッテリー持ち', '機種変更の手間'],
        priceRange: [50000, 150000],
        baseAudience: 80,
        keywords: ['phone', 'mobile', 'スマホ', '携帯'],
        weight: 0.15
      },
      { 
        name: 'スニーカー', 
        baseAppeal: 0.7, 
        concerns: ['サイズ感', '耐久性', 'デザインの好み'],
        priceRange: [5000, 30000],
        baseAudience: 60,
        keywords: ['shoes', 'sneaker', '靴', 'シューズ'],
        weight: 0.15
      },
      { 
        name: 'コーヒー', 
        baseAppeal: 0.6, 
        concerns: ['味の好み', 'カフェイン量', '価格'],
        priceRange: [300, 2000],
        baseAudience: 40,
        keywords: ['coffee', 'drink', 'コーヒー', '飲み物'],
        weight: 0.10
      },
      { 
        name: 'バッグ', 
        baseAppeal: 0.5, 
        concerns: ['容量', '重さ', 'デザイン'],
        priceRange: [3000, 50000],
        baseAudience: 45,
        keywords: ['bag', 'handbag', 'バッグ', 'かばん'],
        weight: 0.15
      },
      { 
        name: 'ゲーム', 
        baseAppeal: 0.9, 
        concerns: ['難易度', '時間がかかる', 'ジャンルの好み'],
        priceRange: [2000, 8000],
        baseAudience: 70,
        keywords: ['game', 'gaming', 'ゲーム', 'プレイ'],
        weight: 0.15
      },
      { 
        name: '化粧品', 
        baseAppeal: 0.4, 
        concerns: ['肌に合うか', '効果が不明', 'アレルギー'],
        priceRange: [1000, 15000],
        baseAudience: 35,
        keywords: ['cosmetic', 'makeup', '化粧品', 'コスメ'],
        weight: 0.15
      },
      { 
        name: '食品', 
        baseAppeal: 0.6, 
        concerns: ['味の好み', '賞味期限', 'アレルギー'],
        priceRange: [200, 5000],
        baseAudience: 50,
        keywords: ['food', 'snack', '食品', '食べ物'],
        weight: 0.15
      }
    ];

    // より現実的な商品判定（価格や販促フレーズからヒントを得る）
    let detectedProduct = productTypes[0]; // デフォルト
    let maxScore = 0;

    productTypes.forEach(product => {
      let score = product.weight;
      
      // 価格帯による判定
      const inputPrice = parseFloat(price) || 0;
      if (inputPrice > 0) {
        const [minPrice, maxPrice] = product.priceRange;
        if (inputPrice >= minPrice && inputPrice <= maxPrice) {
          score += 0.3; // 価格帯が合致
        } else if (inputPrice >= minPrice * 0.5 && inputPrice <= maxPrice * 2) {
          score += 0.1; // 価格帯が近い
        }
      }
      
      // 販促フレーズによる判定
      if (promotionPhrase) {
        const phrase = promotionPhrase.toLowerCase();
        product.keywords.forEach(keyword => {
          if (phrase.includes(keyword)) {
            score += 0.2;
          }
        });
      }
      
      // ランダム要素を追加（画像認識の不確実性をシミュレート）
      score += Math.random() * 0.3;
      
      if (score > maxScore) {
        maxScore = score;
        detectedProduct = product;
      }
    });
    
    // 価格による影響を計算
    const inputPrice = parseFloat(price) || 0;
    const [minPrice, maxPrice] = detectedProduct.priceRange;
    const priceRatio = inputPrice / ((minPrice + maxPrice) / 2);
    
    // 価格影響: 適正価格(0.8-1.2倍)なら+0.1、高すぎる(1.5倍以上)なら-0.3、安すぎる(0.5倍以下)なら-0.1
    let priceImpact = 0;
    if (inputPrice > 0) {
      if (priceRatio >= 0.8 && priceRatio <= 1.2) {
        priceImpact = 0.1; // 適正価格
      } else if (priceRatio > 1.5) {
        priceImpact = -0.3; // 高すぎる
      } else if (priceRatio < 0.5) {
        priceImpact = -0.1; // 安すぎる（品質への不安）
      }
    }
    
    // 販促フレーズによる影響を計算
    const promotionKeywords = {
      positive: ['限定', '特価', '新発売', '人気', 'おすすめ', 'セール', '割引'],
      negative: ['在庫処分', '訳あり', 'B級品'],
      neutral: ['通常価格', '定価']
    };
    
    let promotionImpact = 0;
    const phrase = promotionPhrase.toLowerCase();
    
    if (promotionKeywords.positive.some(keyword => phrase.includes(keyword))) {
      promotionImpact = 0.15;
    } else if (promotionKeywords.negative.some(keyword => phrase.includes(keyword))) {
      promotionImpact = -0.2;
    }
    
    // 最終的な魅力度を計算
    const finalAppeal = Math.max(0.1, Math.min(1.0, detectedProduct.baseAppeal + priceImpact + promotionImpact));
    
    // 参加者数を設定値から取得
    const finalAudienceCount = audienceSettings.participantCount;
    
    const analysis = {
      productName: detectedProduct.name,
      price: inputPrice,
      promotionPhrase: promotionPhrase,
      baseAppeal: detectedProduct.baseAppeal,
      priceImpact: priceImpact,
      promotionImpact: promotionImpact,
      finalAppeal: finalAppeal,
      purchaseIntention: Math.floor(finalAppeal * 100),
      concerns: detectedProduct.concerns,
      positivePoints: ['デザインが良い', '機能性が高い', 'ブランド力がある'],
      audienceCount: finalAudienceCount,
      priceRange: detectedProduct.priceRange
    };

    setAnalysisResult(analysis);

    // オーディエンスのチャットメッセージを段階的に表示
    const generateMessages = () => {
      // 使用済みコメントを追跡
      const usedComments = new Set();
      
      // プロフィールベースの個性的なコメント生成
      const generatePersonalizedComment = (profile, sentiment, productName, price) => {
        const { age, gender, interest, budget } = profile;
        
        // 年代別の話し方パターン
        const speechPatterns = {
          '20代': {
            positive: ['やばい、これ欲しい！', 'めっちゃいいじゃん', 'インスタ映えしそう', 'これ絶対買う', 'テンション上がる〜'],
            negative: ['うーん、微妙かも', 'ちょっと違うかな', 'もっといいのありそう', 'パスかな〜', '今回は見送り'],
            neutral: ['どうなんだろ？', '気になるけど...', '実物見てみたい', '口コミチェックしよ', '迷うなあ']
          },
          '30代': {
            positive: ['これいいですね', '実用的で良さそう', '長く使えそう', '品質良さそう', 'コスパ良いかも'],
            negative: ['ちょっと高いかな', '必要性を感じない', '他と比較したい', '今は買い時じゃない', '見送ります'],
            neutral: ['検討してみます', '詳細を確認したい', '実際の評価は？', '使い勝手はどう？', '悩ましいところ']
          },
          '40代': {
            positive: ['良い商品ですね', '家族にも良さそう', '安心して使えそう', '信頼できるブランド', '投資価値あり'],
            negative: ['予算的に厳しい', '本当に必要？', '慎重に検討したい', '時期を見て考える', '優先度低め'],
            neutral: ['じっくり検討します', '家族と相談してから', '他の選択肢も見たい', '情報収集中', '様子見です']
          },
          '50代': {
            positive: ['これは良いものですね', '長年の経験から見ても◎', '孫にも安心', '品質重視で選びたい', '価値ある投資'],
            negative: ['年齢的に不要かも', '若い人向けかな', '使いこなせるか心配', '維持費が気になる', '今更感がある'],
            neutral: ['慎重に判断したい', '専門家の意見を聞きたい', '実績はどうなの？', '長期的に考えて', '総合的に検討']
          }
        };

        // 興味分野別の専門的コメント
        const interestComments = {
          '美容・ファッション': {
            positive: ['肌に良さそう', 'トレンド感ある', '美容効果期待', 'おしゃれ', '若見え効果'],
            negative: ['肌に合うか心配', '流行遅れかも', 'メンテ大変そう', '年齢に合わない', 'アレルギーが心配'],
            neutral: ['成分チェックしたい', '色味が気になる', '季節的にどう？', 'サイズ感は？', '手入れ方法は？']
          },
          'テクノロジー': {
            positive: ['スペック良い', '最新技術搭載', '効率アップしそう', '革新的', '未来感ある'],
            negative: ['スペック不足', '互換性が心配', 'サポート期間短そう', '学習コスト高い', '既存品で十分'],
            neutral: ['詳細スペックは？', 'アップデート頻度は？', '他製品との比較', 'セキュリティ面は？', '導入コストは？']
          },
          '家庭・育児': {
            positive: ['子供に安全', '家事が楽になる', '家族みんなで使える', '教育効果あり', '時短になる'],
            negative: ['子供には危険かも', '置き場所がない', '家族が使わなそう', '教育方針に合わない', '管理が大変'],
            neutral: ['安全性は大丈夫？', '年齢制限ある？', '家族の反応は？', '長期利用できる？', 'メンテナンス必要？']
          },
          'ゲーム・エンタメ': {
            positive: ['面白そう', 'グラフィック綺麗', 'ストーリー良さそう', 'やり込み要素豊富', '友達と楽しめる'],
            negative: ['時間の無駄かも', '難しすぎそう', '飽きそう', '課金が心配', '年齢に合わない'],
            neutral: ['プレイ時間どのくらい？', '難易度は？', 'オンライン必須？', 'DLC多い？', '評価はどう？']
          },
          'ビジネス': {
            positive: ['業務効率化', 'ROI良さそう', 'スキルアップに', '競合優位性', '将来性ある'],
            negative: ['費用対効果悪い', '導入リスク高い', '学習コスト大', '既存システムで十分', '市場性疑問'],
            neutral: ['導入事例は？', 'サポート体制は？', '競合比較したい', '試用期間ある？', 'カスタマイズ可能？']
          },
          'ライフスタイル': {
            positive: ['生活が豊かに', '健康に良さそう', 'QOL向上', '趣味が広がる', 'リラックスできそう'],
            negative: ['生活に合わない', '継続できなそう', '場所取りそう', '効果疑問', '習慣化困難'],
            neutral: ['効果はどの程度？', '継続のコツは？', '他の方法と比較', '個人差ある？', '科学的根拠は？']
          }
        };

        // 予算感別のコメント調整
        const budgetModifiers = {
          'low': {
            positive: ['コスパ最高', 'お得感ある', '節約になる', '価格以上の価値', '安くて良い'],
            negative: ['予算オーバー', 'もっと安いのを', '給料日後に', 'セール待ち', '贅沢すぎる'],
            neutral: ['価格相応？', 'もう少し安ければ', '割引ある？', '中古でも良いかも', '必要最低限で']
          },
          'medium': {
            positive: ['適正価格', 'バランス良い', '妥当な値段', '価値に見合う', '標準的価格'],
            negative: ['もう少し安ければ', '価格に見合わない', '他と比較したい', '時期を見て', '慎重に検討'],
            neutral: ['価格妥当？', '他社比較したい', '機能と価格のバランス', '長期利用なら', '総合的に判断']
          },
          'high': {
            positive: ['品質重視', '投資価値あり', 'プレミアム感', '長期利用前提', '満足度高そう'],
            negative: ['さすがに高額', 'もっと良いのを', 'ブランド料高い', '費用対効果疑問', '他の選択肢も'],
            neutral: ['品質は保証される？', 'アフターサービスは？', '長期保証ある？', '資産価値は？', '専門性必要？']
          }
        };

        // コメント候補を生成
        let candidates = [];
        
        // 基本的な年代別コメント
        if (speechPatterns[age] && speechPatterns[age][sentiment]) {
          candidates.push(...speechPatterns[age][sentiment]);
        }
        
        // 興味分野別コメント
        if (interestComments[interest] && interestComments[interest][sentiment]) {
          candidates.push(...interestComments[interest][sentiment]);
        }
        
        // 予算感別コメント
        if (budgetModifiers[budget] && budgetModifiers[budget][sentiment]) {
          candidates.push(...budgetModifiers[budget][sentiment]);
        }

        // 商品固有のコメント
        const productSpecificComments = {
          'スマートフォン': {
            positive: ['カメラ性能良さそう', 'バッテリー持ち良い？', '操作性どう？', '5G対応？', 'ケース豊富？'],
            negative: ['画面サイズが...', 'OSアップデート期間', '発熱しない？', '重くない？', '指紋認証ある？'],
            neutral: ['実際の使用感は？', 'カメラの画質は？', 'ゲーム性能は？', '防水性能は？', 'ワイヤレス充電対応？']
          },
          '化粧品': {
            positive: ['肌に優しそう', '成分が良い', 'パッケージ可愛い', '口コミ良い', '有名ブランド'],
            negative: ['肌に合うか心配', 'アレルギー大丈夫？', '香りが強そう', '効果疑問', '価格が高め'],
            neutral: ['成分表示見たい', 'パッチテストした？', '使用期限は？', '他の商品との相性', 'サンプルある？']
          }
        };

        if (productSpecificComments[productName] && productSpecificComments[productName][sentiment]) {
          candidates.push(...productSpecificComments[productName][sentiment]);
        }

        // 重複を避けてコメントを選択
        let selectedComment = null;
        let attempts = 0;
        while (!selectedComment && attempts < 50) {
          const randomComment = candidates[Math.floor(Math.random() * candidates.length)];
          if (!usedComments.has(randomComment)) {
            selectedComment = randomComment;
            usedComments.add(randomComment);
          }
          attempts++;
        }

        // 全て使用済みの場合は、バリエーションを追加
        if (!selectedComment) {
          const variations = ['〜ですね', '〜かも', '〜だと思う', '〜な感じ', '〜っぽい'];
          const baseComment = candidates[Math.floor(Math.random() * candidates.length)];
          const variation = variations[Math.floor(Math.random() * variations.length)];
          selectedComment = baseComment + variation;
        }

        return selectedComment || 'コメントを検討中...';
      };

      // オーディエンス設定に基づいてプロフィールを生成
      const generateAudienceProfile = () => {
        // 性別を選択
        const genderRand = Math.random() * 100;
        const gender = genderRand < audienceSettings.gender.male ? '男性' : '女性';
        
        // 年代を選択
        const ageRand = Math.random() * 100;
        let age = '20代';
        let cumulative = 0;
        for (const [ageGroup, percentage] of Object.entries(audienceSettings.age)) {
          cumulative += percentage;
          if (ageRand < cumulative) {
            age = ageGroup === '20s' ? '20代' : 
                  ageGroup === '30s' ? '30代' : 
                  ageGroup === '40s' ? '40代' : '50代';
            break;
          }
        }
        
        // 興味分野を選択
        const interestRand = Math.random() * 100;
        let interest = '美容・ファッション';
        cumulative = 0;
        const interestMap = {
          'beauty': '美容・ファッション',
          'tech': 'テクノロジー',
          'family': '家庭・育児',
          'game': 'ゲーム・エンタメ',
          'business': 'ビジネス',
          'lifestyle': 'ライフスタイル'
        };
        
        for (const [key, percentage] of Object.entries(audienceSettings.interest)) {
          cumulative += percentage;
          if (interestRand < cumulative) {
            interest = interestMap[key];
            break;
          }
        }
        
        // 予算感を選択
        const budgetRand = Math.random() * 100;
        let budget = 'medium';
        cumulative = 0;
        for (const [budgetLevel, percentage] of Object.entries(audienceSettings.budget)) {
          cumulative += percentage;
          if (budgetRand < cumulative) {
            budget = budgetLevel;
            break;
          }
        }
        
        return { age, gender, interest, budget };
      };

      const messages = [];
      const totalMessages = analysis.audienceCount;
      
      for (let i = 0; i < totalMessages; i++) {
        const profile = generateAudienceProfile();
        const rand = Math.random();
        let sentiment;
        
        // プロフィールに基づいて判定基準を調整
        let appealModifier = 0;
        if (profile.budget === 'low' && analysis.price > 10000) appealModifier -= 0.2;
        if (profile.budget === 'high' && analysis.price < 5000) appealModifier -= 0.1;
        if (profile.interest === 'テクノロジー' && detectedProduct.name === 'スマートフォン') appealModifier += 0.3;
        if (profile.interest === '美容・ファッション' && detectedProduct.name === '化粧品') appealModifier += 0.3;
        
        const adjustedAppeal = Math.max(0, Math.min(1, analysis.finalAppeal + appealModifier));
        
        // 感情を決定
        if (rand < adjustedAppeal * 0.6) {
          sentiment = 'positive';
        } else if (rand < adjustedAppeal * 0.8) {
          sentiment = 'neutral';
        } else {
          sentiment = 'negative';
        }

        // 個性的なコメントを生成
        const personalizedComment = generatePersonalizedComment(
          profile, 
          sentiment, 
          detectedProduct.name, 
          analysis.price
        );

        // 判定理由を生成（予算感との整合性を考慮）
        const reasons = [];
        
        // 予算感に基づく理由
        if (profile.budget === 'low' && analysis.price > 5000) {
          reasons.push('予算オーバー');
        } else if (profile.budget === 'medium' && analysis.price > 15000) {
          reasons.push('価格が高め');
        } else if (profile.budget === 'high' && analysis.price > 50000) {
          reasons.push('さすがに高額');
        } else if (profile.budget === 'high' && analysis.price < 1000) {
          reasons.push('品質に不安');
        }
        
        // 興味分野に基づく理由
        if (sentiment === 'positive' && profile.interest === 'テクノロジー' && detectedProduct.name === 'スマートフォン') {
          reasons.push('興味分野と一致');
        }
        if (sentiment === 'positive' && profile.interest === '美容・ファッション' && detectedProduct.name === '化粧品') {
          reasons.push('興味分野と一致');
        }
        
        // その他の理由
        if (sentiment === 'negative' && reasons.length === 0) {
          reasons.push(analysis.concerns[Math.floor(Math.random() * analysis.concerns.length)]);
        }
        if (reasons.length === 0) {
          reasons.push('直感的な判断');
        }

        // より個性的なユーザー名を生成
        const generateUserName = (profile) => {
          const agePrefix = {
            '20代': ['ゆう', 'あい', 'りょう', 'みお', 'けん'],
            '30代': ['たかし', 'ゆき', 'まさき', 'えり', 'ひろ'],
            '40代': ['としお', 'みどり', 'かずお', 'よしこ', 'のぶ'],
            '50代': ['ひろし', 'きよみ', 'まさる', 'ちえこ', 'あきら']
          };
          
          const interestSuffix = {
            '美容・ファッション': ['_beauty', '_fashion', '_style', '_cosme', '_trend'],
            'テクノロジー': ['_tech', '_gadget', '_dev', '_digital', '_innovation'],
            '家庭・育児': ['_mama', '_papa', '_family', '_kids', '_home'],
            'ゲーム・エンタメ': ['_gamer', '_otaku', '_anime', '_game', '_fun'],
            'ビジネス': ['_biz', '_work', '_career', '_pro', '_success'],
            'ライフスタイル': ['_life', '_wellness', '_natural', '_simple', '_enjoy']
          };
          
          const names = agePrefix[profile.age] || ['ユーザー'];
          const suffixes = interestSuffix[profile.interest] || [''];
          
          const baseName = names[Math.floor(Math.random() * names.length)];
          const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
          const number = Math.floor(Math.random() * 99) + 1;
          
          return `${baseName}${suffix}${number}`;
        };

        messages.push({
          id: i + 1,
          author: generateUserName(profile),
          text: personalizedComment,
          sentiment: sentiment,
          timestamp: new Date(Date.now() + i * 1000),
          profile: profile,
          reasons: reasons,
          appealScore: Math.floor(adjustedAppeal * 100),
          purchaseIntention: sentiment === 'positive' ? Math.floor(Math.random() * 30) + 70 : 
                           sentiment === 'neutral' ? Math.floor(Math.random() * 40) + 30 : 
                           Math.floor(Math.random() * 30) + 10
        });
      }

      return messages.sort((a, b) => a.timestamp - b.timestamp);
    };

    const messages = generateMessages();
    
    // メッセージを段階的に表示
    for (let i = 0; i < messages.length; i++) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, messages[i]]);
      }, i * 200); // 200msごとに1つずつ表示
    }

    setTimeout(() => {
      setIsAnalyzing(false);
    }, messages.length * 200 + 1000);
  };

  // チャットの最下部にスクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'message-positive';
      case 'negative': return 'message-negative';
      default: return 'message-neutral';
    }
  };

  // チャートデータを生成する関数
  const generateChartData = (type) => {
    if (!chatMessages.length) return null;

    const colors = {
      positive: '#28a745',
      negative: '#dc3545',
      neutral: '#ffc107',
      male: '#007bff',
      female: '#e83e8c',
      '20代': '#17a2b8',
      '30代': '#28a745',
      '40代': '#ffc107',
      '50代': '#dc3545',
      low: '#6c757d',
      medium: '#007bff',
      high: '#28a745',
      '美容・ファッション': '#e83e8c',
      'テクノロジー': '#007bff',
      '家庭・育児': '#28a745',
      'ゲーム・エンタメ': '#ffc107',
      'ビジネス': '#6c757d',
      'ライフスタイル': '#17a2b8'
    };

    switch (type) {
      case 'sentiment':
        const sentimentCounts = chatMessages.reduce((acc, msg) => {
          acc[msg.sentiment] = (acc[msg.sentiment] || 0) + 1;
          return acc;
        }, {});
        
        return {
          labels: ['ポジティブ', 'ニュートラル', 'ネガティブ'],
          datasets: [{
            data: [
              sentimentCounts.positive || 0,
              sentimentCounts.neutral || 0,
              sentimentCounts.negative || 0
            ],
            backgroundColor: [colors.positive, colors.neutral, colors.negative],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };

      case 'gender':
        const genderCounts = chatMessages.reduce((acc, msg) => {
          acc[msg.profile.gender] = (acc[msg.profile.gender] || 0) + 1;
          return acc;
        }, {});
        
        return {
          labels: ['男性', '女性'],
          datasets: [{
            data: [genderCounts['男性'] || 0, genderCounts['女性'] || 0],
            backgroundColor: [colors.male, colors.female],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };

      case 'age':
        const ageCounts = chatMessages.reduce((acc, msg) => {
          acc[msg.profile.age] = (acc[msg.profile.age] || 0) + 1;
          return acc;
        }, {});
        
        return {
          labels: ['20代', '30代', '40代', '50代'],
          datasets: [{
            data: [
              ageCounts['20代'] || 0,
              ageCounts['30代'] || 0,
              ageCounts['40代'] || 0,
              ageCounts['50代'] || 0
            ],
            backgroundColor: [colors['20代'], colors['30代'], colors['40代'], colors['50代']],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };

      case 'budget':
        const budgetCounts = chatMessages.reduce((acc, msg) => {
          const budgetLabel = msg.profile.budget === 'low' ? '低め' : 
                             msg.profile.budget === 'medium' ? '普通' : '高め';
          acc[budgetLabel] = (acc[budgetLabel] || 0) + 1;
          return acc;
        }, {});
        
        return {
          labels: ['低め', '普通', '高め'],
          datasets: [{
            data: [budgetCounts['低め'] || 0, budgetCounts['普通'] || 0, budgetCounts['高め'] || 0],
            backgroundColor: [colors.low, colors.medium, colors.high],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };

      case 'interest':
        const interestCounts = chatMessages.reduce((acc, msg) => {
          acc[msg.profile.interest] = (acc[msg.profile.interest] || 0) + 1;
          return acc;
        }, {});
        
        const interests = Object.keys(interestCounts);
        return {
          labels: interests,
          datasets: [{
            data: interests.map(interest => interestCounts[interest]),
            backgroundColor: interests.map(interest => colors[interest] || '#6c757d'),
            borderWidth: 2,
            borderColor: '#fff'
          }]
        };

      default:
        return null;
    }
  };

  return (
    <div className="product-evaluation">
      <div className="evaluation-header">
        <h1>商品評価システム</h1>
        <p>商品画像をアップロードして、オーディエンスの反応を見てみましょう</p>
      </div>

      {/* 画像アップロード・プレビューエリア */}
      <div className="upload-preview-section">
        <div className="upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
            id="product-upload"
          />
          <label htmlFor="product-upload" className="upload-label">
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="商品プレビュー" className="product-preview" />
                <div className="upload-overlay">
                  <span>📷 画像を変更</span>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📦</span>
                <p>商品画像をアップロード</p>
                <small>JPG, PNG, GIF対応</small>
              </div>
            )}
          </label>
        </div>

        {imagePreview && (
          <div className="product-attributes">
            <h3>📝 商品情報</h3>
            <div className="attributes-form">
              <div className="form-group">
                <label htmlFor="price">💰 価格（円）</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="例: 5980"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="promotion">🎯 販促フレーズ</label>
                <input
                  type="text"
                  id="promotion"
                  value={promotionPhrase}
                  onChange={(e) => setPromotionPhrase(e.target.value)}
                  placeholder="例: 期間限定特価、新発売、セール中"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}

        {imagePreview && (
          <div className="analysis-controls">
            <button 
              className="analyze-btn"
              onClick={analyzeProduct}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '分析中...' : '🔍 オーディエンス反応を分析'}
            </button>
          </div>
        )}

        {/* 分析結果サマリー */}
        {analysisResult && (
          <div className="analysis-summary">
            <h3>📊 分析結果</h3>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">商品:</span>
                <span className="stat-value">{analysisResult.productName}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">価格:</span>
                <span className="stat-value">
                  {analysisResult.price > 0 ? `¥${analysisResult.price.toLocaleString()}` : '未設定'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">購入意欲:</span>
                <span className="stat-value">{analysisResult.purchaseIntention}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">参加者:</span>
                <span className="stat-value">{analysisResult.audienceCount}人 (設定値)</span>
              </div>
            </div>
            
            {/* 詳細分析 */}
            <div className="detailed-analysis">
              <h4>🔍 詳細分析</h4>
              <div className="analysis-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">基本魅力度:</span>
                  <span className="breakdown-value">{(analysisResult.baseAppeal * 100).toFixed(0)}%</span>
                </div>
                {analysisResult.priceImpact !== 0 && (
                  <div className="breakdown-item">
                    <span className="breakdown-label">価格影響:</span>
                    <span className={`breakdown-value ${analysisResult.priceImpact > 0 ? 'positive' : 'negative'}`}>
                      {analysisResult.priceImpact > 0 ? '+' : ''}{(analysisResult.priceImpact * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {analysisResult.promotionImpact !== 0 && (
                  <div className="breakdown-item">
                    <span className="breakdown-label">販促影響:</span>
                    <span className={`breakdown-value ${analysisResult.promotionImpact > 0 ? 'positive' : 'negative'}`}>
                      {analysisResult.promotionImpact > 0 ? '+' : ''}{(analysisResult.promotionImpact * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <div className="breakdown-item final">
                  <span className="breakdown-label">最終魅力度:</span>
                  <span className="breakdown-value">{(analysisResult.finalAppeal * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              {analysisResult.price > 0 && (
                <div className="price-analysis">
                  <p className="price-note">
                    💡 この商品の適正価格帯: ¥{analysisResult.priceRange[0].toLocaleString()} - ¥{analysisResult.priceRange[1].toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* チャットエリア */}
      <div className="chat-section">
        <div className="chat-header">
          <h3>💬 オーディエンスの反応</h3>
          <div className="chat-controls">
            {isAnalyzing && <div className="typing-indicator">分析中...</div>}
            {chatMessages.length > 0 && !isAnalyzing && (
              <button 
                className="chart-toggle-btn"
                onClick={() => setShowChart(!showChart)}
                title={showChart ? 'チャット表示に戻る' : 'チャート表示に切り替え'}
              >
                {showChart ? '💬 チャット' : '📊 チャート'}
              </button>
            )}
            <button 
              className="settings-btn"
              onClick={() => setShowAudienceSettings(true)}
              title="オーディエンス設定"
            >
              ⚙️ 設定
            </button>
          </div>
        </div>
        
        {!showChart ? (
          <div className="chat-messages">
            {chatMessages.length === 0 && !isAnalyzing && (
              <div className="chat-empty">
                <p>商品画像をアップロードして分析を開始してください</p>
              </div>
            )}
            
            {chatMessages.map(message => (
              <div key={message.id} className={`chat-message ${getSentimentClass(message.sentiment)}`}>
                <div className="message-author">{message.author}</div>
                <div className="message-text">{message.text}</div>
                <div className="message-actions">
                  <button 
                    className="detail-btn"
                    onClick={() => setSelectedMessage(message)}
                  >
                    詳しく聞く
                  </button>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        ) : (
          <div className="chart-container">
            <div className="chart-controls">
              <div className="chart-type-selector">
                <button 
                  className={`chart-type-btn ${chartType === 'sentiment' ? 'active' : ''}`}
                  onClick={() => setChartType('sentiment')}
                >
                  感情分析
                </button>
                <button 
                  className={`chart-type-btn ${chartType === 'gender' ? 'active' : ''}`}
                  onClick={() => setChartType('gender')}
                >
                  性別
                </button>
                <button 
                  className={`chart-type-btn ${chartType === 'age' ? 'active' : ''}`}
                  onClick={() => setChartType('age')}
                >
                  年代
                </button>
                <button 
                  className={`chart-type-btn ${chartType === 'budget' ? 'active' : ''}`}
                  onClick={() => setChartType('budget')}
                >
                  予算感
                </button>
                <button 
                  className={`chart-type-btn ${chartType === 'interest' ? 'active' : ''}`}
                  onClick={() => setChartType('interest')}
                >
                  興味分野
                </button>
              </div>
            </div>
            
            <div className="chart-display">
              {(() => {
                const chartData = generateChartData(chartType);
                if (!chartData) return <div className="chart-empty">データがありません</div>;
                
                return (
                  <div className="chart-wrapper">
                    <Pie 
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed}人 (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* オーディエンス詳細モーダル */}
      {selectedMessage && (
        <div className="audience-detail-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="audience-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👤 {selectedMessage.author} の詳細</h3>
              <button className="close-btn" onClick={() => setSelectedMessage(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="profile-section">
                <h4>📋 プロフィール</h4>
                <div className="profile-grid">
                  <div className="profile-item">
                    <span className="profile-label">年代:</span>
                    <span className="profile-value">{selectedMessage.profile.age}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">性別:</span>
                    <span className="profile-value">{selectedMessage.profile.gender}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">興味分野:</span>
                    <span className="profile-value">{selectedMessage.profile.interest}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">予算感:</span>
                    <span className="profile-value">
                      {selectedMessage.profile.budget === 'low' ? '低め' : 
                       selectedMessage.profile.budget === 'medium' ? '普通' : '高め'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="judgment-section">
                <h4>🎯 判定結果</h4>
                <div className="judgment-grid">
                  <div className="judgment-item">
                    <span className="judgment-label">魅力度スコア:</span>
                    <span className="judgment-value">{selectedMessage.appealScore}%</span>
                  </div>
                  <div className="judgment-item">
                    <span className="judgment-label">購入意欲:</span>
                    <span className="judgment-value">{selectedMessage.purchaseIntention}%</span>
                  </div>
                  <div className="judgment-item">
                    <span className="judgment-label">感情:</span>
                    <span className={`judgment-value sentiment-${selectedMessage.sentiment}`}>
                      {selectedMessage.sentiment === 'positive' ? 'ポジティブ' : 
                       selectedMessage.sentiment === 'negative' ? 'ネガティブ' : 'ニュートラル'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="reasons-section">
                <h4>💭 判定理由</h4>
                <ul className="reasons-list">
                  {selectedMessage.reasons.map((reason, index) => (
                    <li key={index} className="reason-item">{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="comment-section">
                <h4>💬 コメント</h4>
                <div className="original-comment">
                  "{selectedMessage.text}"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* オーディエンス設定モーダル */}
      {showAudienceSettings && (
        <div className="audience-settings-overlay" onClick={() => setShowAudienceSettings(false)}>
          <div className="audience-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👥 オーディエンス設定</h3>
              <button className="close-btn" onClick={() => setShowAudienceSettings(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* 参加人数設定 */}
              <div className="setting-section">
                <h4>👥 参加人数設定</h4>
                <div className="slider-group">
                  <div className="slider-item">
                    <label>参加人数: {audienceSettings.participantCount}人</label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={audienceSettings.participantCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        setAudienceSettings(prev => ({
                          ...prev,
                          participantCount: count
                        }));
                      }}
                      className="slider"
                    />
                    <div className="slider-range-info">
                      <span>10人</span>
                      <span>200人</span>
                    </div>
                    <div className="participant-recommendations">
                      <div className="recommendation-item">
                        <button 
                          className="quick-set-btn"
                          onClick={() => setAudienceSettings(prev => ({ ...prev, participantCount: 30 }))}
                        >
                          小規模 (30人)
                        </button>
                        <button 
                          className="quick-set-btn"
                          onClick={() => setAudienceSettings(prev => ({ ...prev, participantCount: 50 }))}
                        >
                          標準 (50人)
                        </button>
                        <button 
                          className="quick-set-btn"
                          onClick={() => setAudienceSettings(prev => ({ ...prev, participantCount: 100 }))}
                        >
                          大規模 (100人)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 性別設定 */}
              <div className="setting-section">
                <h4>👫 性別構成</h4>
                <div className="slider-group">
                  <div className="slider-item">
                    <label>男性: {audienceSettings.gender.male}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audienceSettings.gender.male}
                      onChange={(e) => {
                        const male = parseInt(e.target.value);
                        setAudienceSettings(prev => ({
                          ...prev,
                          gender: { male, female: 100 - male }
                        }));
                      }}
                      className="slider"
                    />
                  </div>
                  <div className="slider-item">
                    <label>女性: {audienceSettings.gender.female}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audienceSettings.gender.female}
                      onChange={(e) => {
                        const female = parseInt(e.target.value);
                        setAudienceSettings(prev => ({
                          ...prev,
                          gender: { male: 100 - female, female }
                        }));
                      }}
                      className="slider"
                    />
                  </div>
                </div>
              </div>

              {/* 年代設定 */}
              <div className="setting-section">
                <h4>📅 年代構成</h4>
                <div className="slider-group">
                  {Object.entries(audienceSettings.age).map(([key, value]) => (
                    <div key={key} className="slider-item">
                      <label>
                        {key === '20s' ? '20代' : key === '30s' ? '30代' : key === '40s' ? '40代' : '50代'}: {value}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={value}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value);
                          setAudienceSettings(prev => ({
                            ...prev,
                            age: { ...prev.age, [key]: newValue }
                          }));
                        }}
                        className="slider"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 興味分野設定 */}
              <div className="setting-section">
                <h4>🎯 興味分野構成</h4>
                <div className="slider-group">
                  {Object.entries(audienceSettings.interest).map(([key, value]) => {
                    const labels = {
                      'beauty': '美容・ファッション',
                      'tech': 'テクノロジー',
                      'family': '家庭・育児',
                      'game': 'ゲーム・エンタメ',
                      'business': 'ビジネス',
                      'lifestyle': 'ライフスタイル'
                    };
                    return (
                      <div key={key} className="slider-item">
                        <label>{labels[key]}: {value}%</label>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={value}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            setAudienceSettings(prev => ({
                              ...prev,
                              interest: { ...prev.interest, [key]: newValue }
                            }));
                          }}
                          className="slider"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 予算感設定 */}
              <div className="setting-section">
                <h4>💰 予算感構成</h4>
                <div className="slider-group">
                  {Object.entries(audienceSettings.budget).map(([key, value]) => {
                    const labels = { 'low': '低め', 'medium': '普通', 'high': '高め' };
                    return (
                      <div key={key} className="slider-item">
                        <label>{labels[key]}: {value}%</label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          value={value}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            setAudienceSettings(prev => ({
                              ...prev,
                              budget: { ...prev.budget, [key]: newValue }
                            }));
                          }}
                          className="slider"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="settings-note">
                <p>💡 設定を変更後、再度分析を実行すると新しい設定が反映されます</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEvaluation;