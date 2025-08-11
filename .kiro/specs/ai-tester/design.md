# Design Document

## Overview

AIテスター ～井戸端会議～ は、4名の固定キャラクターによる会話シミュレーション機能です。pochagramのUIパターンを踏襲し、フィード表示、詳細分析、設定管理の機能を提供します。

## Architecture

### Component Structure
```
AITester.js (Main Container)
├── AITesterFeed.js (Discussion Feed - similar to InstagramFeed)
├── DiscussionDetail.js (Discussion Detail View - similar to PostDetail)
├── NewDiscussion.js (New Discussion Modal - similar to PostUpload)
├── ParticipantSettings.js (Participant Configuration - similar to QuotaSettings)
└── AITesterHeader.js (Navigation Header)
```

### Data Flow
1. User configures participants in settings
2. User starts new discussion with topic
3. System generates conversation between selected participants
4. System provides final evaluation and detailed analysis
5. Discussion is saved and displayed in feed

## Components and Interfaces

### Character Profiles
```javascript
const characters = {
  tamako: {
    name: '野比玉子',
    age: 38,
    channels: ['STORY', '美ST', 'VOCE'],
    priceRange: '～5000円',
    personality: 'のび太のママ',
    speakingStyle: 'gentle_mother'
  },
  suneko: {
    name: '骨川スネ子', 
    age: '非公表（35-40歳）',
    channels: ['美的', 'VERY', 'LEE'],
    priceRange: '～15,000円',
    personality: 'スネ男のママ',
    speakingStyle: 'sophisticated_mother'
  },
  tsubaki: {
    name: '剛田椿',
    age: '非公表（35-40歳）', 
    channels: ['めざましTV'],
    priceRange: '～1,500円',
    personality: 'ジャイアンのママ',
    speakingStyle: 'strong_mother'
  },
  tomi: {
    name: '福士とみ',
    age: 79,
    channels: ['近所のドラッグストア'],
    priceRange: '～8000円',
    personality: '津軽弁',
    speakingStyle: 'tsugaru_dialect'
  }
};
```

### Discussion Data Model
```javascript
const discussion = {
  id: timestamp,
  topic: string,
  participants: array,
  conversation: array,
  evaluation: {
    score: number, // 0-100
    breakdown: object,
    analysis: string
  },
  timestamp: date,
  debugInfo: object
};
```

## User Interface Design

### Feed View (Similar to InstagramFeed)
- Card-based layout showing past discussions
- Topic preview, participants, score, and timestamp
- Click to view detailed discussion

### Discussion Detail (Similar to PostDetail)
- Full conversation display
- Participant avatars and speaking styles
- Detailed analysis breakdown
- Evaluation score with reasoning

### New Discussion Modal (Similar to PostUpload)
- Topic input field
- Participant selection (checkboxes)
- Start discussion button
- Progress indicator during generation

### Settings View (Similar to QuotaSettings)
- Participant configuration
- Individual character profiles
- Enable/disable participants
- Default participant selection

## Conversation Generation Logic

### Discussion Flow
1. User provides topic
2. System generates opening statements from each participant
3. Participants respond to each other in character
4. Discussion continues for 3-5 rounds
5. System generates final evaluation

### Character Response Generation
- Each character responds based on their profile
- Speaking style reflects their personality
- Responses consider their interests and price preferences
- Maintain character consistency throughout discussion

## Evaluation System

### Scoring Criteria
- Relevance to topic (25 points)
- Character authenticity (25 points)
- Discussion depth (25 points)
- Overall engagement (25 points)

### Analysis Breakdown
- Individual character contributions
- Discussion dynamics
- Topic coverage
- Recommendation summary