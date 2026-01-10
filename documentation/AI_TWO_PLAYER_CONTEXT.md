# How the Two-Player Setup Impacts AI Responses

This document explains how the Prisoner's Dilemma two-player structure (player_1 and player_2) affects how the AI responds to prompts.

## Overview

When you ask the AI a question, the system automatically includes the **current game context** in the prompt sent to the AI. This context includes information about the two-player setup, which significantly shapes the AI's responses.

## Two Modes: Game-Specific vs. General Analysis

The AI operates in two modes:

### 1. Game-Specific Mode (Default)

When `general_analysis=False` (default), the AI receives **full game context** including:
- Current players (player_1, player_2)
- Their names and roles
- Recent moves
- Complete payoff matrix
- Computed Nash equilibria

### 2. General Analysis Mode

When `general_analysis=True`, the AI receives **no game context** and analyzes the question as a general game theory problem, not tied to the current game.

## What the AI Sees: Game Context Structure

When you ask a game-specific question, the AI receives a prompt structured like this:

```
[Role Instructions - e.g., "You are a game theory analyst..."]

CURRENT GAME CONTEXT:
- Game ID: prisoner_dilemma_014a4902
- Current Round: 1
- Players:
  - Alice (ID: player_1, Type: human, Role: N/A)
  - Bob (ID: player_2, Type: human, Role: N/A)

RECENT STRATEGIES:
- Round 1: player_1 chose cooperate
- Round 1: player_2 chose defect

PAYOFF MATRIX:
player_1 strategies: cooperate, defect
player_2 strategies: cooperate, defect

Payoffs for each strategy combination:
  (cooperate,cooperate): player_1: 3.0, player_2: 3.0
  (cooperate,defect): player_1: 0.0, player_2: 5.0
  (defect,cooperate): player_1: 5.0, player_2: 0.0
  (defect,defect): player_1: 1.0, player_2: 1.0

COMPUTED NASH EQUILIBRIA:
  Equilibrium 1:
    Strategies: player_1: defect, player_2: defect
    Payoffs: player_1: 1, player_2: 1

DOMINANT STRATEGIES:
  player_1: defect
  player_2: defect

PARETO-EFFICIENT OUTCOMES:
  Outcome 1:
    Strategies: player_1: cooperate, player_2: cooperate
    Payoffs: player_1: 3, player_2: 3

USER QUESTION:
[Your question here]
```

## How Two-Player Setup Impacts Responses

### 1. **Player-Specific References**

The AI knows the exact players in your game:

**Example Question**: "What should player_1 do?"

**AI Response Impact**:
- AI can reference "player_1" or "Alice" specifically
- AI knows player_1's history of moves
- AI can analyze player_1's position relative to player_2
- AI can recommend strategies for player_1 specifically

**Without Context**: AI would give generic advice without knowing which player you're asking about.

### 2. **Payoff Matrix Awareness**

The AI sees the complete 2x2 payoff matrix:

**What This Means**:
- AI understands the exact payoffs for each combination
- AI knows that (cooperate, cooperate) = (3, 3)
- AI knows that (defect, defect) = (1, 1)
- AI can calculate which outcomes are best for each player

**Example Question**: "What's the best outcome?"

**AI Response Impact**:
- AI can reference specific payoff values: "The best outcome is (cooperate, cooperate) which gives both players 3 points"
- AI can compare outcomes: "While (cooperate, cooperate) gives 3 points each, (defect, cooperate) gives player_1 5 points but player_2 gets 0"
- AI understands the Prisoner's Dilemma structure

**Without Context**: AI would give theoretical advice without knowing your specific payoffs.

### 3. **Nash Equilibrium Context**

The AI receives computed Nash equilibria:

**What This Means**:
- AI knows the mathematical Nash equilibrium: (defect, defect)
- AI knows dominant strategies: both players should defect
- AI knows Pareto-efficient outcomes: (cooperate, cooperate) is better but unstable
- AI can explain why the equilibrium exists

**Example Question**: "What is the Nash equilibrium?"

**AI Response Impact**:
- AI can state: "The Nash equilibrium is (defect, defect) where both players get 1 point"
- AI can explain: "This is the Nash equilibrium because neither player can improve by unilaterally changing strategy"
- AI can contrast: "However, (cooperate, cooperate) is Pareto-efficient but not a Nash equilibrium because each player has incentive to defect"

**Without Context**: AI would explain Nash equilibrium theory but couldn't compute it for your specific game.

### 4. **Move History Awareness**

The AI sees recent moves (last 5 strategies):

**What This Means**:
- AI knows what moves have been played
- AI can analyze patterns: "Player_1 has been cooperating while player_2 has been defecting"
- AI can predict: "Given this history, player_2 might continue defecting"
- AI can recommend: "Player_1 should consider defecting to avoid exploitation"

**Example Question**: "What should I do next?"

**AI Response Impact**:
- AI can reference specific moves: "In Round 1, player_2 defected while you cooperated, giving them 5 points and you 0"
- AI can analyze patterns: "Player_2 has defected in both rounds, suggesting they're playing a defection strategy"
- AI can give contextual advice: "Given player_2's pattern, you might want to defect to avoid being exploited"

**Without Context**: AI would give generic strategic advice without knowing the game history.

### 5. **Round Awareness**

The AI knows the current round number:

**What This Means**:
- AI understands game progression
- AI can give different advice for early vs. late rounds
- AI can consider: "This is Round 1, so there's no history yet"
- AI can strategize: "In later rounds, you might use tit-for-tat"

**Example Question**: "What strategy should I use?"

**AI Response Impact**:
- Early rounds: "Since this is Round 1, you have no information about the other player's strategy yet"
- Later rounds: "Given the history, you might consider tit-for-tat: cooperate if they cooperated last round, defect if they defected"

**Without Context**: AI couldn't tailor advice to game stage.

## Concrete Examples

### Example 1: Player-Specific Question

**Question**: "What should Alice do?"

**With Two-Player Context**:
```
AI sees:
- Alice is player_1
- Bob is player_2
- Last round: Alice cooperated, Bob defected
- Payoff matrix shows Alice got 0 points, Bob got 5 points

AI Response: "Alice, you cooperated while Bob defected, giving you 0 points and Bob 5 points. 
Given Bob's defection, you might want to defect next round to avoid being exploited again. 
However, if Bob switches to cooperation, mutual cooperation (3,3) is better than mutual defection (1,1)."
```

**Without Context**:
```
AI Response: "In a Prisoner's Dilemma, players should consider their opponent's likely strategy..."
(Generic advice, no specific references)
```

### Example 2: Strategic Analysis

**Question**: "What's the best strategy?"

**With Two-Player Context**:
```
AI sees:
- Nash equilibrium: (defect, defect)
- Dominant strategy: defect for both players
- Pareto-efficient: (cooperate, cooperate) = (3,3)
- Current moves: player_1 cooperated, player_2 defected

AI Response: "The Nash equilibrium is (defect, defect) where both players get 1 point. 
However, (cooperate, cooperate) gives both players 3 points, which is Pareto-efficient but 
unstable because each player has incentive to defect. In your current game, player_2 defected 
while you cooperated, suggesting player_2 is playing the dominant strategy. You might want to 
match their strategy or try to signal cooperation."
```

**Without Context**:
```
AI Response: "In Prisoner's Dilemma, the dominant strategy is to defect, but this leads to 
a suboptimal outcome. Cooperation can lead to better outcomes if both players cooperate..."
(Theoretical explanation, no game-specific analysis)
```

### Example 3: Outcome Analysis

**Question**: "What happened in the last round?"

**With Two-Player Context**:
```
AI sees:
- Round 1: player_1 cooperated, player_2 defected
- Payoffs: player_1 got 0, player_2 got 5
- This matches the (cooperate, defect) outcome

AI Response: "In Round 1, player_1 (Alice) cooperated while player_2 (Bob) defected. 
According to the payoff matrix, this resulted in player_1 receiving 0 points and player_2 
receiving 5 points. This is the (cooperate, defect) outcome, which is favorable for player_2 
but unfavorable for player_1."
```

**Without Context**:
```
AI Response: "I don't have access to your game history. In general, when one player 
cooperates and the other defects in Prisoner's Dilemma..."
(No specific game information)
```

## Impact Summary

### What the Two-Player Setup Provides:

1. **Specificity**: AI can reference exact players (player_1, player_2) and their names
2. **Accuracy**: AI knows exact payoffs and can calculate outcomes precisely
3. **Relevance**: AI can analyze your specific game state, not just theory
4. **History**: AI can reference past moves and patterns
5. **Mathematics**: AI receives computed Nash equilibria and dominant strategies
6. **Context**: AI understands the current round and game progression

### What Changes Without Context:

1. **Generic Advice**: AI gives theoretical game theory advice
2. **No Specifics**: AI can't reference your players or moves
3. **No Calculations**: AI can't compute equilibria for your specific game
4. **No History**: AI can't analyze your game's progression
5. **Abstract**: AI discusses concepts rather than your actual game

## Technical Details

### How Context is Built

The system builds context in `_build_game_context()`:

1. **Player Information**: Loops through `game_state.players` and includes:
   - Player name
   - Player ID (player_1, player_2)
   - Player type (human/AI)
   - Player role (if set)

2. **Recent Strategies**: Takes last 5 strategies and shows:
   - Round number
   - Player ID
   - Move type (cooperate/defect)

3. **Payoff Matrix**: Formats the complete 2x2 matrix:
   - All strategy combinations
   - Payoffs for each player

4. **Nash Equilibria**: Computes and includes:
   - All Nash equilibria
   - Dominant strategies
   - Pareto-efficient outcomes

### When Context is Included

**Context Included When**:
- `general_analysis=False` (default)
- Question is about the current game
- Game has players and a payoff matrix

**Context Excluded When**:
- `general_analysis=True` (explicitly set)
- Question is detected as general (mentions topics like "China", "Taiwan", etc.)
- No game context available

## Best Practices

### For Game-Specific Questions

**Use Default Mode** (`general_analysis=False`):
- Ask about your specific players
- Ask about strategies for your game
- Ask about outcomes in your game
- Ask about Nash equilibria for your game

**Example Questions**:
- "What should player_1 do?"
- "What's the Nash equilibrium for this game?"
- "What happened in the last round?"
- "What's the best strategy given the current state?"

### For General Questions

**Use General Analysis Mode** (`general_analysis=True`):
- Ask about game theory concepts
- Ask about real-world scenarios
- Ask about topics unrelated to your game

**Example Questions**:
- "How should China deal with Taiwan?"
- "What's the best strategy for Ukraine?"
- "Explain Nash equilibrium in general"

## Conclusion

The two-player setup significantly impacts AI responses by providing:

1. **Specific Context**: Exact players, moves, and payoffs
2. **Mathematical Analysis**: Computed Nash equilibria and dominant strategies
3. **Historical Awareness**: Past moves and patterns
4. **Precise Recommendations**: Tailored to your specific game state

This makes AI responses **highly relevant and specific** to your actual game, rather than generic game theory advice. The AI can reference your players by name, analyze your specific payoff matrix, and provide recommendations based on your game's actual history and current state.
