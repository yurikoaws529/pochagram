import { createRekognitionClient, validateAWSConfig } from '../utils/awsConfig';

class RekognitionService {
  constructor() {
    this.rekognition = null;
    this.isConfigured = false;
  }

  // 初期化
  initialize() {
    if (!validateAWSConfig()) {
      throw new Error('AWS configuration is invalid');
    }
    
    this.rekognition = createRekognitionClient();
    this.isConfigured = true;
    console.log('Rekognition service initialized');
  }

  // 画像からラベル（物体・食事）を検出
  async detectLabels(imageFile, options = {}) {
    if (!this.isConfigured) {
      this.initialize();
    }

    const {
      maxLabels = 10,
      minConfidence = 70
    } = options;

    try {
      // 画像をバイト配列に変換
      const imageBytes = await this.fileToBytes(imageFile);
      
      const params = {
        Image: {
          Bytes: imageBytes
        },
        MaxLabels: maxLabels,
        MinConfidence: minConfidence
      };

      console.log('Calling Rekognition detectLabels...');
      const result = await this.rekognition.detectLabels(params).promise();
      
      console.log('Rekognition result:', result);
      return result.Labels;
    } catch (error) {
      console.error('Rekognition detectLabels error:', error);
      throw error;
    }
  }

  // 画像からテキストを検出
  async detectText(imageFile) {
    if (!this.isConfigured) {
      this.initialize();
    }

    try {
      const imageBytes = await this.fileToBytes(imageFile);
      
      const params = {
        Image: {
          Bytes: imageBytes
        }
      };

      console.log('Calling Rekognition detectText...');
      const result = await this.rekognition.detectText(params).promise();
      
      console.log('Text detection result:', result);
      return result.TextDetections;
    } catch (error) {
      console.error('Rekognition detectText error:', error);
      throw error;
    }
  }

  // 画像から顔を検出
  async detectFaces(imageFile) {
    if (!this.isConfigured) {
      this.initialize();
    }

    try {
      const imageBytes = await this.fileToBytes(imageFile);
      
      const params = {
        Image: {
          Bytes: imageBytes
        },
        Attributes: ['ALL']
      };

      console.log('Calling Rekognition detectFaces...');
      const result = await this.rekognition.detectFaces(params).promise();
      
      console.log('Face detection result:', result);
      return result.FaceDetails;
    } catch (error) {
      console.error('Rekognition detectFaces error:', error);
      throw error;
    }
  }

  // ファイルをバイト配列に変換
  async fileToBytes(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const bytes = new Uint8Array(arrayBuffer);
        resolve(bytes);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // 食事関連のラベルをフィルタリング
  filterFoodLabels(labels) {
    const foodKeywords = [
      'Food', 'Meal', 'Dish', 'Cuisine', 'Restaurant', 'Dining',
      'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert',
      'Rice', 'Bread', 'Meat', 'Fish', 'Vegetable', 'Fruit',
      'Soup', 'Salad', 'Pizza', 'Burger', 'Sandwich', 'Pasta',
      'Cake', 'Cookie', 'Ice Cream', 'Coffee', 'Tea', 'Drink'
    ];

    return labels.filter(label => 
      foodKeywords.some(keyword => 
        label.Name.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  // 5W1H分析用のラベル分類
  categorizeLabelsFor5W1H(labels) {
    const categories = {
      what: [], // 何を（食べ物、物体）
      where: [], // どこで（場所、環境）
      when: [], // いつ（時間帯の推測）
      who: [], // 誰が（人物）
      why: [], // なぜ（目的、シーン）
      how: [] // どのように（調理法、状態）
    };

    labels.forEach(label => {
      const name = label.Name.toLowerCase();
      const confidence = label.Confidence;

      // What: 食べ物や物体
      if (this.isFoodOrObject(name)) {
        categories.what.push({ name: label.Name, confidence });
      }

      // Where: 場所や環境
      if (this.isLocation(name)) {
        categories.where.push({ name: label.Name, confidence });
      }

      // When: 時間帯（食事の種類から推測）
      if (this.isTimeIndicator(name)) {
        categories.when.push({ name: label.Name, confidence });
      }

      // Who: 人物
      if (this.isPerson(name)) {
        categories.who.push({ name: label.Name, confidence });
      }

      // Why: 目的やシーン
      if (this.isPurpose(name)) {
        categories.why.push({ name: label.Name, confidence });
      }

      // How: 調理法や状態
      if (this.isCookingMethod(name)) {
        categories.how.push({ name: label.Name, confidence });
      }
    });

    return categories;
  }

  // ヘルパーメソッド
  isFoodOrObject(name) {
    const foodKeywords = ['food', 'meal', 'dish', 'rice', 'bread', 'meat', 'fish', 'vegetable', 'fruit'];
    return foodKeywords.some(keyword => name.includes(keyword));
  }

  isLocation(name) {
    const locationKeywords = ['restaurant', 'kitchen', 'dining', 'table', 'cafe', 'bar'];
    return locationKeywords.some(keyword => name.includes(keyword));
  }

  isTimeIndicator(name) {
    const timeKeywords = ['breakfast', 'lunch', 'dinner', 'morning', 'evening'];
    return timeKeywords.some(keyword => name.includes(keyword));
  }

  isPerson(name) {
    const personKeywords = ['person', 'people', 'human', 'face', 'man', 'woman'];
    return personKeywords.some(keyword => name.includes(keyword));
  }

  isPurpose(name) {
    const purposeKeywords = ['celebration', 'party', 'meeting', 'date', 'family'];
    return purposeKeywords.some(keyword => name.includes(keyword));
  }

  isCookingMethod(name) {
    const methodKeywords = ['grilled', 'fried', 'baked', 'steamed', 'raw', 'cooked'];
    return methodKeywords.some(keyword => name.includes(keyword));
  }
}

// シングルトンインスタンス
const rekognitionService = new RekognitionService();

export default rekognitionService;