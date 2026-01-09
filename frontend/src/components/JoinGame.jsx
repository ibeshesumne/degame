import React, { useState } from 'react'

function JoinGame({ onJoin, gameId, userName, onUserNameChange }) {
  const [localUserName, setLocalUserName] = useState(userName || '')
  const [localGameId, setLocalGameId] = useState(gameId || '')
  const [showJoinForm, setShowJoinForm] = useState(!userName)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!localUserName.trim()) {
      alert('Please enter your name')
      return
    }
    // If no game ID provided, create a new game (handled by parent)
    if (!localGameId.trim()) {
      // Call onJoin with null gameId to trigger new game creation
      onJoin(null, localUserName.trim())
    } else {
      onJoin(localGameId.trim(), localUserName.trim())
    }
    setShowJoinForm(false)
  }

  if (showJoinForm) {
    return (
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Join Multi-User Game</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Your Name:
            </label>
            <input
              type="text"
              value={localUserName}
              onChange={(e) => setLocalUserName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Game ID (optional):
              </label>
              <input
                type="text"
                value={localGameId}
                onChange={(e) => setLocalGameId(e.target.value)}
                placeholder="Leave empty to create new game"
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to create a new game, or enter a Game ID to join an existing game
              </p>
            </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Join Game
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Multi-User Game</h2>
          <p className="text-sm text-gray-600">
            Joined as: <strong>{userName}</strong> | Game ID: <code className="bg-gray-100 px-2 py-1 rounded">{gameId}</code>
          </p>
        </div>
        <button
          onClick={() => setShowJoinForm(true)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
        >
          Change User/Game
        </button>
      </div>
    </div>
  )
}

export default JoinGame
