# Implementation Plan

- [ ] 1. Define character profiles and data structures
  - Create character profile constants with all 4 characters
  - Define discussion data model and conversation structure
  - Create evaluation scoring system structure
  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4_

- [ ] 2. Implement participant settings component
  - Create ParticipantSettings.js component similar to QuotaSettings
  - Add character profile display with avatars and details
  - Implement participant selection checkboxes
  - Add save/load functionality for participant preferences
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Create discussion feed component
  - Create AITesterFeed.js component similar to InstagramFeed
  - Implement card-based layout for past discussions
  - Display topic, participants, score, and timestamp
  - Add click handlers to view discussion details
  - _Requirements: 3.1, 3.2, 4.2_

- [ ] 4. Implement new discussion modal
  - Create NewDiscussion.js component similar to PostUpload
  - Add topic input field and participant selection
  - Implement discussion generation logic
  - Add progress indicator and loading states
  - _Requirements: 2.1, 2.2_

- [ ] 5. Create discussion detail view
  - Create DiscussionDetail.js component similar to PostDetail
  - Display full conversation with character avatars
  - Show detailed analysis breakdown and evaluation score
  - Implement character-specific styling and speech patterns
  - _Requirements: 3.3, 3.4, 4.3_

- [ ] 6. Implement conversation generation system
  - Create character response generation functions
  - Implement speaking style for each character (のび太ママ, スネ男ママ, ジャイアンママ, 津軽弁)
  - Add discussion flow logic with multiple rounds
  - Create evaluation scoring algorithm
  - _Requirements: 2.3, 2.4, 5.1, 5.2, 5.3, 5.4_

- [ ] 7. Update AITester main component and header
  - Modify AITester.js to handle feed/settings/new discussion views
  - Update AITesterHeader.js with hamburger menu options
  - Add navigation between different views
  - Implement modal handling for new discussions
  - _Requirements: 4.1, 4.4_

- [ ] 8. Create CSS styles for all components
  - Style ParticipantSettings with character cards
  - Style discussion feed with pochagram-like cards
  - Style discussion detail view with conversation bubbles
  - Style new discussion modal with topic input
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 9. Implement data persistence
  - Add localStorage for discussion history
  - Save participant settings preferences
  - Implement discussion data serialization
  - Add data migration and cleanup functions
  - _Requirements: 1.3, 3.1_

- [ ] 10. Test and polish implementation
  - Test all character speaking styles and personalities
  - Verify evaluation scoring accuracy
  - Test discussion generation with different participant combinations
  - Ensure UI consistency with pochagram design
  - _Requirements: 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4_