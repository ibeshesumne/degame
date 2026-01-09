import React, { useState } from 'react'

function GameBoard({ gameState, players, onSubmitMove, onResolveRound, loading }) {
  const [selectedMoves, setSelectedMoves] = useState({})

  if (!gameState) {
    return <div className="bg-white p-6 rounded shadow">Loading game state...</div>
  }

  const handleMoveSelect = (playerId, moveType) => {
    setSelectedMoves({
      ...selectedMoves,
      [playerId]: moveType
    })
  }

  const handleSubmitMove = async (playerId) => {
    const moveType = selectedMoves[playerId]
    if (moveType) {
      await onSubmitMove(playerId, moveType)
      setSelectedMoves({
        ...selectedMoves,
        [playerId]: null
      })
    }
  }

  const handleResolveRound = async () => {
    const result = await onResolveRound()
    if (result && result.round_result) {
      alert(`Round resolved! Payoffs: ${JSON.stringify(result.round_result.payoffs)}`)
    }
  }

  const currentStrategies = gameState.current_strategies || {}
  const allPlayersMoved = players.every(p => currentStrategies[p.id])

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Game Board - Round {gameState.round}</h2>

      <div className="space-y-4">
        {players.map(player => {
          const currentMove = currentStrategies[player.id]
          const hasMoved = !!currentMove

          return (
            <div
              key={player.id}
              className={`p-4 border-2 rounded ${
                hasMoved ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
            >
              <h3 className="font-semibold mb-2">
                {player.name} ({player.type === 'human' ? 'Human' : 'AI'})
              </h3>

              {hasMoved ? (
                <div className="text-green-700">
                  ✓ Move submitted: <strong>{currentMove.move_type}</strong>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveSelect(player.id, 'cooperate')}
                      className={`px-4 py-2 rounded ${
                        selectedMoves[player.id] === 'cooperate'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Cooperate
                    </button>
                    <button
                      onClick={() => handleMoveSelect(player.id, 'defect')}
                      className={`px-4 py-2 rounded ${
                        selectedMoves[player.id] === 'defect'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Defect
                    </button>
                  </div>
                  {selectedMoves[player.id] && (
                    <button
                      onClick={() => handleSubmitMove(player.id)}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Submit Move
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allPlayersMoved && (
        <div className="mt-6">
          <button
            onClick={handleResolveRound}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
          >
            Resolve Round
          </button>
        </div>
      )}

      {gameState.payoff_matrix && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Payoff Matrix</h3>
          <div className="text-sm space-y-1">
            <div>CC: {JSON.stringify(gameState.payoff_matrix.payoffs['(cooperate,cooperate)'])}</div>
            <div>CD: {JSON.stringify(gameState.payoff_matrix.payoffs['(cooperate,defect)'])}</div>
            <div>DC: {JSON.stringify(gameState.payoff_matrix.payoffs['(defect,cooperate)'])}</div>
            <div>DD: {JSON.stringify(gameState.payoff_matrix.payoffs['(defect,defect)'])}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
