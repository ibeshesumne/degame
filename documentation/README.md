# Game6Multi Documentation

This folder contains comprehensive documentation for the Game6Multi game-theoretic platform.

## Documentation Structure

### Core Documentation

1. **[HOW_TO_PLAY.md](HOW_TO_PLAY.md)** - Complete user guide on how to play the game
   - Getting started
   - Game mechanics
   - Multi-participant features
   - AI features
   - Nash equilibrium analysis

2. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture documentation
   - Overall system design
   - Frontend architecture (React)
   - Backend architecture (FastAPI)
   - Component breakdown
   - API structure
   - Storage architecture

3. **[DATA_FLOW.md](DATA_FLOW.md)** - Data flow and storage documentation
   - How data is presented to users
   - How data is created
   - How data is saved
   - Storage mechanisms
   - File structure

4. **[GAME_LIFECYCLE.md](GAME_LIFECYCLE.md)** - Game lifecycle and traces
   - What the game starts with
   - How traces develop as the game progresses
   - Event tracking
   - State evolution

5. **[DATA_STATISTICS.md](DATA_STATISTICS.md)** - Data statistics and analysis
   - Core operating files statistics
   - Generated data statistics
   - Content by type statistics
   - Storage growth patterns

6. **[AI_TWO_PLAYER_CONTEXT.md](AI_TWO_PLAYER_CONTEXT.md)** - How two-player setup impacts AI responses
   - Game context inclusion
   - Player-specific references
   - Payoff matrix awareness
   - Nash equilibrium context
   - Move history awareness

7. **[PARTICIPANTS_VS_PLAYERS.md](PARTICIPANTS_VS_PLAYERS.md)** - Participants vs Players distinction
   - Difference between participants (users) and players (game entities)
   - How AI responses reflect two-player structure
   - How participants can target specific players
   - Current limitations and potential enhancements

## Quick Reference

### For Users
- Start with [HOW_TO_PLAY.md](HOW_TO_PLAY.md) to learn how to use the game

### For Developers
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Review [DATA_FLOW.md](DATA_FLOW.md) to understand data handling
- Check [DATA_STATISTICS.md](DATA_STATISTICS.md) for storage details

### For System Administrators
- See [DATA_STATISTICS.md](DATA_STATISTICS.md) for storage requirements
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for deployment considerations

## Related Documentation

Historical documentation and deployment guides are stored in the `../scratch/` folder:
- Setup guides
- Deployment instructions
- Troubleshooting guides
- Feature comparisons

## Current Game State

This documentation describes the game **as it stands now** (January 2026), including:
- Multi-participant support
- Real-time event tracking
- AI integration (OpenAI GPT-4/3.5, Anthropic Claude)
- Nash equilibrium computation
- JSON-based file storage
- Thread-based AI conversations
