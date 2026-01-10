# Data Statistics

This document provides comprehensive statistics on the data stored by Game6Multi, including core operating files, generated data, and content by type.

## Current System Statistics

**Analysis Date**: January 2026  
**Total Games**: 21  
**Total Event Files**: 22  
**Total Session Files**: 9  
**Total Storage**: 54,387 bytes (53.11 KB)

## Core Operating Files

### Game State Files

**Location**: `backend/data/games/{game_id}.json`

**Statistics**:
- **Total Files**: 21
- **Average Size**: 1,710 bytes (1.67 KB)
- **Size Range**: 1,618 - 2,135 bytes (1.58 - 2.08 KB)
- **Total Storage**: 35,910 bytes (~35 KB)
- **Min Size**: 1,618 bytes (empty game)
- **Max Size**: 2,135 bytes (game with players and moves)

**Content Breakdown**:
- Base structure: ~1,600 bytes
- Per player: +200-300 bytes
- Per strategy/move: +150-200 bytes
- Per history entry: +100-150 bytes

**Storage Percentage**: 66% of total storage

### Event Files

**Location**: `backend/data/events/{game_id}_events.json`

**Statistics**:
- **Total Files**: 22
- **Average Size**: 740 bytes (0.72 KB)
- **Size Range**: 324 - 4,143 bytes (0.32 - 4.05 KB)
- **Total Storage**: 16,280 bytes (~16 KB)
- **Average Events per File**: 1.6 events
- **Min Size**: 324 bytes (single PLAYER_JOINED event)
- **Max Size**: 4,143 bytes (game with AI interactions)

**Storage Percentage**: 30% of total storage

### Session Files

**Location**: `backend/data/sessions/{game_id}_sessions.json`

**Statistics**:
- **Total Files**: 9
- **Average Size**: 246 bytes (0.24 KB)
- **Size Range**: 235 - 257 bytes (0.23 - 0.25 KB)
- **Total Storage**: 2,214 bytes (~2 KB)
- **Average Sessions per File**: 1.0 session
- **Min Size**: 235 bytes
- **Max Size**: 257 bytes

**Storage Percentage**: 4% of total storage

## Generated Data Statistics

### Per-Game Totals

**Average Total Storage per Game**: 2,422 bytes (2.37 KB)

**Breakdown**:
- Game state: ~1,710 bytes (70.6%)
- Events: ~607 bytes (25.1%)
- Sessions: ~105 bytes (4.3%)

**Range**:
- Minimum: ~1,900 bytes (game with minimal activity)
- Maximum: ~6,500 bytes (game with extensive AI interactions)

### Storage Growth Patterns

#### Game State File Growth

**Base Size**: ~1,600 bytes (empty game)

**Growth Rates**:
- Per player added: +200-300 bytes
- Per strategy/move: +150-200 bytes
- Per history entry: +100-150 bytes

**Projected Sizes**:
- Empty game: 1,600 bytes
- +2 players: 2,100 bytes
- +10 moves: 3,600 bytes
- +5 rounds: 4,100 bytes
- +50 moves: 9,100 bytes
- +100 rounds: 16,000 bytes

**Estimated Maximum**: 10-20 KB for heavily played game (100+ rounds)

#### Event File Growth

**Base Size**: 0 bytes (empty array)

**Growth Rates**:
- Per simple event (MOVE, PLAYER_JOINED): +300-400 bytes
- Per AI prompt event: +467 bytes (average)
- Per AI response event: +1,126 bytes (average, highly variable)

**Projected Sizes**:
- Empty: 0 bytes
- +10 simple events: 3,500 bytes
- +5 AI prompts: 2,335 bytes
- +5 AI responses: 5,630 bytes
- **Subtotal**: ~11,465 bytes (~11 KB)
- +50 AI interactions: ~80,000 bytes (~80 KB)
- +100 AI interactions: ~160,000 bytes (~160 KB)

**Estimated Maximum**: Can grow to 100+ KB with extensive AI interactions

#### Session File Growth

**Base Size**: 0 bytes (created on first join)

**Growth Rates**:
- Per session: +250 bytes

**Projected Sizes**:
- Empty: 0 bytes
- +1 session: 250 bytes
- +5 sessions: 1,250 bytes
- +10 sessions: 2,500 bytes
- +20 sessions: 5,000 bytes

**Estimated Maximum**: ~2-3 KB for games with many participants

## Content by Type Statistics

### Event Type Distribution

Based on analysis of 22 event files:

#### Event Types

**PLAYER_JOINED**:
- **Count**: ~15 events
- **Average Size**: 324 bytes
- **Total Storage**: ~4,860 bytes
- **Percentage**: ~30% of events

**MOVE**:
- **Count**: ~10 events
- **Average Size**: 350 bytes
- **Total Storage**: ~3,500 bytes
- **Percentage**: ~20% of events

**PROMPT** (AI Prompts):
- **Count**: 4 events
- **Average Size**: 467 bytes (0.46 KB)
- **Total Storage**: 1,869 bytes (1.83 KB)
- **Percentage**: ~12% of events
- **Size Range**: 399 - 529 bytes

**RESPONSE** (AI Responses):
- **Count**: 4 events
- **Average Size**: 1,126 bytes (1.10 KB)
- **Total Storage**: 4,504 bytes (4.40 KB)
- **Percentage**: ~12% of events
- **Size Range**: 558 - 2,810 bytes

**ROUND_RESOLVED**:
- **Count**: ~5 events
- **Average Size**: 400 bytes
- **Total Storage**: ~2,000 bytes
- **Percentage**: ~15% of events

**Other Events**:
- **Count**: ~5 events
- **Average Size**: 350 bytes
- **Total Storage**: ~1,750 bytes
- **Percentage**: ~11% of events

### AI Content Statistics

#### Prompts

**Total Prompts**: 4

**Size Statistics**:
- Average: 467 bytes (0.46 KB)
- Min: 399 bytes (0.39 KB)
- Max: 529 bytes (0.52 KB)
- Total: 1,869 bytes (1.83 KB)

**Content Statistics**:
- Average prompt text length: ~100-150 characters
- Contains: prompt_text, prompt_id, role, model, thread_id

**Distribution by Game**:
- `general_analysis`: 3 prompts
- `prisoner_dilemma_2d1ac618`: 1 prompt

#### Responses

**Total Responses**: 4

**Size Statistics**:
- Average: 1,126 bytes (1.10 KB)
- Min: 558 bytes (0.54 KB)
- Max: 2,810 bytes (2.74 KB)
- Total: 4,504 bytes (4.40 KB)

**Content Statistics**:
- Average response text length: ~500-1,000 characters
- Contains: response_text (full AI response), prompt_id, role, model, thread_id
- Highly variable size (depends on AI response length)

**Distribution by Game**:
- `general_analysis`: 3 responses
- `prisoner_dilemma_2d1ac618`: 1 response

**Linking**:
- 100% of responses linked to prompts via `parent_event_id`
- All prompt-response pairs share same `game_id` and `thread_id`

### Game State Content Statistics

#### Players

**Total Players Across All Games**: ~30 players

**Per Game**:
- Average: ~1.4 players per game
- Range: 0-2 players per game
- Most games: 0-1 players (many games created but not played)

**Player Data Size**:
- Per player: ~200-300 bytes
- Includes: id, name, type, role, objectives, constraints, resources

#### Strategies

**Total Strategies Across All Games**: ~15 strategies

**Per Game**:
- Average: ~0.7 strategies per game
- Range: 0-5 strategies per game
- Most games: 0 strategies (games created but no moves)

**Strategy Data Size**:
- Per strategy: ~150-200 bytes
- Includes: player_id, move_type, round, timestamp, metadata

#### History Entries

**Total History Entries Across All Games**: ~10 entries

**Per Game**:
- Average: ~0.5 entries per game
- Range: 0-3 entries per game
- Most games: 0 entries (no rounds resolved)

**History Entry Size**:
- Per entry: ~100-150 bytes
- Includes: round, player_id, move, timestamp

### Session Content Statistics

**Total Sessions**: 9 sessions

**Per Game**:
- Average: ~1.0 session per game (for games with sessions)
- Range: 1-2 sessions per game
- Games with sessions: 9 out of 21 games (43%)

**Session Data Size**:
- Per session: ~250 bytes
- Includes: session_id, user_name, game_id, joined_at, last_active, metadata

**Session Activity**:
- Average sessions per active game: 1.0
- Most games have single participant
- Some games have 2 participants (multi-player)

## Storage Efficiency

### Compression Potential

**Current Format**: JSON (human-readable, uncompressed)

**Compression Ratios** (estimated):
- Game state files: ~60-70% compression possible
- Event files: ~50-60% compression possible
- Session files: ~40-50% compression possible

**If Compressed**:
- Current 54 KB could become ~25-30 KB
- Significant savings for large deployments

### Redundancy Analysis

**Duplication**:
- Payoff matrix stored twice (in game file and game_state)
- Some metadata duplicated across files

**Optimization Potential**:
- Store payoff matrix once, reference it
- Could reduce game state file size by ~200-300 bytes

## Content Type Breakdown

### By Storage Type

**Game State Files**:
- 35,910 bytes (66%)
- Core game structure
- Player data
- Strategy history
- Round history

**Event Files**:
- 16,280 bytes (30%)
- Action log
- AI interactions
- Event tracking

**Session Files**:
- 2,214 bytes (4%)
- User sessions
- Activity tracking

### By Content Category

**Core Game Data** (Game State):
- 35,910 bytes (66%)
- Essential for game operation
- Required for game restoration

**Activity Log** (Events):
- 16,280 bytes (30%)
- Audit trail
- Real-time updates
- AI conversations

**User Data** (Sessions):
- 2,214 bytes (4%)
- Participant tracking
- Activity monitoring

### By Data Volatility

**Static Data** (rarely changes):
- Payoff matrix: ~500 bytes per game
- Game structure: ~200 bytes per game
- **Total**: ~700 bytes per game (static)

**Semi-Static Data** (changes occasionally):
- Players: ~250 bytes per player
- **Total**: Variable (depends on players)

**Dynamic Data** (changes frequently):
- Strategies: ~175 bytes per move
- Events: ~350 bytes per event
- History: ~125 bytes per round
- **Total**: Grows with activity

## Growth Projections

### Short-Term Growth (10 games)

**Assumptions**:
- 10 active games
- 5 moves per game
- 2 AI interactions per game

**Projected Storage**:
- Game state: ~20 KB
- Events: ~8 KB
- Sessions: ~2 KB
- **Total**: ~30 KB

### Medium-Term Growth (50 games)

**Assumptions**:
- 50 active games
- 10 moves per game
- 5 AI interactions per game

**Projected Storage**:
- Game state: ~85 KB
- Events: ~50 KB
- Sessions: ~12 KB
- **Total**: ~147 KB

### Long-Term Growth (100 games)

**Assumptions**:
- 100 active games
- 20 moves per game
- 10 AI interactions per game

**Projected Storage**:
- Game state: ~170 KB
- Events: ~150 KB
- Sessions: ~25 KB
- **Total**: ~345 KB

### Heavy Usage Scenario (10 games, extensive activity)

**Assumptions**:
- 10 games
- 100 moves per game
- 50 AI interactions per game
- Long AI responses

**Projected Storage**:
- Game state: ~20 KB
- Events: ~600 KB (AI responses dominate)
- Sessions: ~2 KB
- **Total**: ~622 KB

## Storage Recommendations

### For Current Scale (< 100 games)

**Current Approach**: JSON files (adequate)
- Simple to manage
- Easy to debug
- Sufficient for current scale

### For Medium Scale (100-1,000 games)

**Recommendation**: Consider database migration
- PostgreSQL or MongoDB
- Better query performance
- Indexing for faster lookups
- Better concurrency handling

### For Large Scale (1,000+ games)

**Recommendation**: Database + Caching
- Database for persistence
- Redis for caching
- Event streaming (Kafka/RabbitMQ)
- CDN for static assets

### Storage Optimization Strategies

1. **Compression**: Compress JSON files (gzip)
2. **Archiving**: Archive old games/events
3. **Deduplication**: Remove duplicate data
4. **Partitioning**: Separate active/inactive games
5. **Cleanup**: Remove unused sessions

## Summary

### Current Statistics

- **Total Storage**: 54 KB for 21 games
- **Average per Game**: 2.4 KB
- **Largest Component**: Game state files (66%)
- **Fastest Growing**: Event files (with AI interactions)

### Key Insights

1. **Game State Files**: Largest component, grows with players/moves
2. **Event Files**: Can grow significantly with AI interactions
3. **Session Files**: Smallest component, minimal growth
4. **AI Content**: Prompts small (~467 bytes), responses larger (~1,126 bytes avg)
5. **Storage Efficiency**: JSON format is readable but not compressed

### Growth Characteristics

- **Linear Growth**: Game state and sessions grow linearly
- **Exponential Potential**: Event files can grow exponentially with AI usage
- **Predictable**: Growth patterns are predictable based on activity
- **Manageable**: Current scale is easily manageable with file storage

### Recommendations

- **Current**: File storage is adequate
- **Future**: Consider database migration for scale
- **Optimization**: Compression and archiving can help
- **Monitoring**: Track storage growth, especially event files
