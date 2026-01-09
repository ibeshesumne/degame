import React, { useEffect, useRef, useState } from 'react'

function EventFeed({ events }) {
  const feedRef = useRef(null)
  const [expandedEvents, setExpandedEvents] = useState(new Set())

  useEffect(() => {
    // Auto-scroll to bottom when new events arrive
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [events])

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'MOVE':
        return '🎯'
      case 'PROMPT':
        return '💬'
      case 'RESPONSE':
        return '🤖'
      case 'ROUND_RESOLVED':
        return '✅'
      case 'PLAYER_JOINED':
        return '👋'
      case 'PLAYER_LEFT':
        return '👋'
      default:
        return '📢'
    }
  }

  const toggleEvent = (eventId) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const formatEventMessage = (event) => {
    const actorName = event.actor_name || 'Someone'
    const isExpanded = expandedEvents.has(event.event_id)
    
    switch (event.event_type) {
      case 'MOVE':
        const playerName = event.data.player_name || event.data.player_id || 'a player'
        return (
          <div>
            <span className="font-semibold text-blue-600">{actorName}</span> played{' '}
            <span className="font-semibold">{event.data.move_type || 'a move'}</span> for{' '}
            <span className="font-semibold">{playerName}</span>
          </div>
        )
      case 'PROMPT':
        const promptText = event.data?.prompt_text || ''
        const promptIsLong = promptText.length > 60
        const showFullPrompt = isExpanded || !promptIsLong
        return (
          <div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-purple-600">{actorName}</span> asked:
            </div>
            <div 
              className={`mt-1 ${promptIsLong ? 'cursor-pointer hover:bg-purple-100 rounded p-1' : ''}`}
              onClick={() => promptIsLong && toggleEvent(event.event_id)}
            >
              <span className="italic text-gray-800 whitespace-pre-wrap">
                "{showFullPrompt ? promptText : promptText.substring(0, 60) + '...'}"
              </span>
              {promptIsLong && !isExpanded && (
                <span className="text-xs text-purple-600 ml-1">(click to expand)</span>
              )}
              {promptIsLong && isExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleEvent(event.event_id)
                  }}
                  className="text-xs text-purple-600 ml-2 hover:underline"
                >
                  (collapse)
                </button>
              )}
            </div>
          </div>
        )
      case 'RESPONSE':
        const responseText = event.data?.response_text || ''
        const responseIsLong = responseText.length > 100
        const showFullResponse = isExpanded || !responseIsLong
        return (
          <div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-green-600">AI</span> responded to{' '}
              <span className="font-semibold">{actorName}</span>
              {event.data?.thread_id && (
                <span className="text-xs text-gray-500 ml-2">(thread: {event.data.thread_id.substring(0, 8)}...)</span>
              )}
            </div>
            {responseText ? (
              <div 
                className={`mt-2 p-2 bg-green-50 rounded border border-green-200 ${responseIsLong ? 'cursor-pointer hover:bg-green-100' : ''}`}
                onClick={() => responseIsLong && toggleEvent(event.event_id)}
              >
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {showFullResponse ? responseText : responseText.substring(0, 100) + '...'}
                </div>
                {responseIsLong && !isExpanded && (
                  <span className="text-xs text-green-600 mt-1 block">(click to read full response)</span>
                )}
                {responseIsLong && isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleEvent(event.event_id)
                    }}
                    className="text-xs text-green-600 mt-1 hover:underline"
                  >
                    (collapse)
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs text-gray-500 italic">
                Response text not available
              </div>
            )}
          </div>
        )
      case 'ROUND_RESOLVED':
        return (
          <div>
            <span className="font-semibold text-green-600">{actorName}</span> resolved{' '}
            <span className="font-semibold">Round {event.data.round || '?'}</span>
          </div>
        )
      case 'PLAYER_JOINED':
        return (
          <div>
            <span className="font-semibold text-blue-600">👋 {actorName}</span> joined the game!
          </div>
        )
      case 'PLAYER_LEFT':
        return (
          <div>
            <span className="font-semibold text-red-600">👋 {actorName}</span> left the game
          </div>
        )
      default:
        return (
          <div>
            <span className="font-semibold">{event.event_type}</span>: {JSON.stringify(event.data).substring(0, 50)}
          </div>
        )
    }
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span className="text-2xl">📢</span>
          Event Feed
        </h3>
        <p className="text-sm text-gray-500">No events yet</p>
        <p className="text-xs text-gray-400 mt-2">Events from all participants will appear here in real-time!</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow border-2 border-green-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span className="text-2xl">📢</span>
        Event Feed 
        <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">{events.length}</span>
      </h3>
      <div
        ref={feedRef}
        className="space-y-2 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 bg-gray-50"
      >
        {events.slice().reverse().map((event) => {
          const eventColors = {
            'MOVE': 'border-blue-500 bg-blue-50',
            'PROMPT': 'border-purple-500 bg-purple-50',
            'RESPONSE': 'border-green-500 bg-green-50',
            'ROUND_RESOLVED': 'border-yellow-500 bg-yellow-50',
            'PLAYER_JOINED': 'border-blue-500 bg-blue-50',
            'PLAYER_LEFT': 'border-red-500 bg-red-50'
          }
          const borderColor = eventColors[event.event_type] || 'border-gray-500 bg-gray-50'
          
          return (
            <div
              key={event.event_id}
              className={`text-sm p-3 bg-white rounded-lg border-l-4 shadow-sm ${borderColor}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{getEventIcon(event.event_type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-800">
                    {formatEventMessage(event)}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>🕐 {new Date(event.timestamp).toLocaleString()}</span>
                    {event.actor_name && (
                      <span className="px-2 py-0.5 bg-gray-200 rounded">by {event.actor_name}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Real-time Updates:</strong> See all moves, AI conversations, and actions from all participants!
        </p>
      </div>
    </div>
  )
}

export default EventFeed
