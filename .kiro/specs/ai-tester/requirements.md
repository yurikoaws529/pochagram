# Requirements Document

## Introduction

「AIテスター ～井戸端会議～」は、pochagramのUIデザインを踏襲した井戸端会議シミュレーション機能です。4名の固定キャラクター（野比玉子、骨川スネ子、剛田椿、福士とみ）が参加する会話システムで、ユーザーが提示したお題について議論し、最終的に100点満点で評価を行います。

## Requirements

### Requirement 1

**User Story:** As a user, I want to configure which participants join the discussion, so that I can customize the conversation dynamics.

#### Acceptance Criteria

1. WHEN I access the participant settings THEN the system SHALL display 4 predefined characters with their profiles
2. WHEN I select participants THEN the system SHALL allow me to choose all 4 or any subset of participants
3. WHEN I save participant settings THEN the system SHALL store my selection for future discussions
4. WHEN I view participant profiles THEN the system SHALL display name, age, interests, price range, and speaking style

### Requirement 2

**User Story:** As a user, I want to start a new discussion with a topic, so that the selected participants can discuss it.

#### Acceptance Criteria

1. WHEN I start a new discussion THEN the system SHALL prompt me to enter a topic
2. WHEN I submit a topic THEN the system SHALL initiate discussion among selected participants
3. WHEN participants discuss THEN the system SHALL generate responses in their characteristic speaking styles
4. WHEN the discussion concludes THEN the system SHALL provide a final evaluation score out of 100 points

### Requirement 3

**User Story:** As a user, I want to view past discussions in a feed format, so that I can review previous conversations.

#### Acceptance Criteria

1. WHEN I access the feed THEN the system SHALL display past discussions in chronological order
2. WHEN I view a discussion item THEN the system SHALL show topic, participants, date, and evaluation score
3. WHEN I click on a discussion THEN the system SHALL open detailed view with full conversation
4. WHEN I view discussion details THEN the system SHALL show analysis breakdown similar to pochagram

### Requirement 4

**User Story:** As a user, I want the interface to be consistent with pochagram design, so that the experience feels familiar.

#### Acceptance Criteria

1. WHEN I use the hamburger menu THEN the system SHALL provide access to settings and new discussion options
2. WHEN I view the feed THEN the system SHALL use similar UI patterns as pochagram's Instagram-style feed
3. WHEN I view discussion details THEN the system SHALL show detailed analysis similar to pochagram's post analysis
4. WHEN I navigate the interface THEN the system SHALL maintain pochagram's color scheme and typography

### Requirement 5

**User Story:** As a user, I want each character to speak in their distinctive style, so that the conversation feels authentic.

#### Acceptance Criteria

1. WHEN 野比玉子 speaks THEN the system SHALL use のび太のママ's speaking style and reflect her interests in beauty magazines
2. WHEN 骨川スネ子 speaks THEN the system SHALL use スネ男のママ's speaking style and reflect her higher-end beauty preferences
3. WHEN 剛田椿 speaks THEN the system SHALL use ジャイアンのママ's speaking style and reflect her practical approach
4. WHEN 福士とみ speaks THEN the system SHALL use 津軽弁 and reflect her elderly perspective and drugstore shopping habits

### Requirement 6

**User Story:** As a user, I want to select a moderator from participants, so that discussions can be properly facilitated and summarized.

#### Acceptance Criteria

1. WHEN I select participants THEN the system SHALL allow me to designate one participant as moderator
2. WHEN a moderator is selected THEN the system SHALL indicate their special role in the discussion
3. WHEN no moderator is explicitly chosen THEN the system SHALL automatically assign the first selected participant as moderator
4. WHEN the moderator participates THEN the system SHALL allow them to speak normally during discussion rounds

### Requirement 7

**User Story:** As a user, I want the moderator to provide opinion summary after discussion, so that I can get consolidated insights.

#### Acceptance Criteria

1. WHEN discussion rounds complete THEN the system SHALL prompt the moderator to summarize opinions
2. WHEN moderator summarizes THEN the system SHALL generate a comprehensive opinion summary covering all participants' views
3. WHEN summary is generated THEN the system SHALL include overall assessment and key insights
4. WHEN I view discussion results THEN the system SHALL display both individual evaluation and moderator summary