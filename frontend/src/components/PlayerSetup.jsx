import React, { useState } from 'react'

function PlayerSetup({ players, onAddPlayer, gameState }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'human',
    role: '',
    objectives: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const availablePlayerIds = ['player_1', 'player_2']
    const usedPlayerIds = players.map(p => p.id)
    const nextPlayerId = availablePlayerIds.find(id => !usedPlayerIds.includes(id))
    
    if (!nextPlayerId) {
      alert('All player slots are filled! (Prisoner\'s Dilemma supports 2 players)')
      return
    }
    
    const playerData = {
      id: nextPlayerId,
      name: formData.name,
      type: formData.type,
      role: formData.role || null,
      objectives: formData.objectives.split(',').map(s => s.trim()).filter(Boolean),
      constraints: [],
      resources: {}
    }

    onAddPlayer(playerData)
    setShowForm(false)
    setFormData({
      name: '',
      type: 'human',
      role: '',
      objectives: ''
    })
  }

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Players</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Player'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="human">Human</option>
              <option value="ai">AI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role (optional)</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., government, industry"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Objectives (comma-separated)</label>
            <input
              type="text"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="e.g., Maximize profit, Maintain market share"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Player
          </button>
        </form>
      )}

      <div className="space-y-2">
        {players.length === 0 ? (
          <p className="text-gray-500">No players added yet. Add 2 players to start (Prisoner's Dilemma requires exactly 2 players).</p>
        ) : (
          <>
            {players.map(player => (
              <div key={player.id} className="p-3 bg-gray-50 rounded">
                <div className="font-semibold">{player.name} <span className="text-xs text-gray-500">({player.id})</span></div>
                <div className="text-sm text-gray-600">
                  Type: {player.type} | Role: {player.role || 'N/A'}
                </div>
                {player.objectives && player.objectives.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Objectives: {player.objectives.join(', ')}
                  </div>
                )}
              </div>
            ))}
            {players.length >= 2 && (
              <p className="text-sm text-green-600 font-semibold mt-2">✓ All players added! Ready to play.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PlayerSetup
