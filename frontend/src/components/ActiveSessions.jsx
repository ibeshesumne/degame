import React from 'react'

function ActiveSessions({ sessions, currentSessionId }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow mb-6 border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          Active Participants
        </h3>
        <p className="text-sm text-gray-500">No active sessions</p>
        <p className="text-xs text-gray-400 mt-2">Share your Game ID with others to enable multi-participant mode!</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-6 border-2 border-blue-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span className="text-2xl">👥</span>
        Active Participants 
        <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">{sessions.length}</span>
      </h3>
      <div className="space-y-2">
        {sessions.map((session) => {
          const isCurrentUser = session.session_id === currentSessionId
          const joinedDate = new Date(session.joined_at)
          const lastActiveDate = new Date(session.last_active)
          const timeSinceActive = Math.floor((Date.now() - lastActiveDate.getTime()) / 1000 / 60) // minutes
          
          return (
            <div
              key={session.session_id}
              className={`p-3 rounded-lg border-2 ${
                isCurrentUser
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isCurrentUser ? '👤' : '👥'}</span>
                  <span className={`font-medium ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                    {session.user_name}
                  </span>
                </div>
                {isCurrentUser && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-semibold">You</span>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <div className="flex items-center gap-1">
                  <span>🕐</span>
                  <span>Joined: {joinedDate.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⚡</span>
                  <span>
                    {timeSinceActive < 1 
                      ? 'Active now' 
                      : timeSinceActive < 60 
                        ? `Active ${timeSinceActive}m ago`
                        : `Active ${Math.floor(timeSinceActive / 60)}h ago`
                    }
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Multi-Participant Mode:</strong> All participants can see each other's moves and AI conversations in real-time!
        </p>
      </div>
    </div>
  )
}

export default ActiveSessions
