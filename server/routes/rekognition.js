const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const router = express.Router();

// AWS Rekognition設定
const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// multerの設定（メモリストレージを使用）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB制限
  }
});

// ラベル検出API
router.post('/detect-labels', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { maxLabels = 10, minConfidence = 70 } = req.body;

    const params = {
      Image: {
        Bytes: req.file.buffer
      },
      MaxLabels: parseInt(maxLabels),
      MinConfidence: parseFloat(minConfidence)
    };

    console.log('Calling Rekognition detectLabels...');
    const result = await rekognition.detectLabels(params).promise();
    
    console.log('Rekognition result:', result);
    res.json({
      success: true,
      labels: result.Labels
    });

  } catch (error) {
    console.error('Rekognition detectLabels error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// テキスト検出API
router.post('/detect-text', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const params = {
      Image: {
        Bytes: req.file.buffer
      }
    };

    console.log('Calling Rekognition detectText...');
    const result = await rekognition.detectText(params).promise();
    
    console.log('Text detection result:', result);
    res.json({
      success: true,
      textDetections: result.TextDetections
    });

  } catch (error) {
    console.error('Rekognition detectText error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 顔検出API
router.post('/detect-faces', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const params = {
      Image: {
        Bytes: req.file.buffer
      },
      Attributes: ['ALL']
    };

    console.log('Calling Rekognition detectFaces...');
    const result = await rekognition.detectFaces(params).promise();
    
    console.log('Face detection result:', result);
    res.json({
      success: true,
      faceDetails: result.FaceDetails
    });

  } catch (error) {
    console.error('Rekognition detectFaces error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;