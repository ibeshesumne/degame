import React, { useState, useMemo } from 'react'

function ThreadConversations({ events, onReplyToThread, currentSessionId }) {
  // Group events by thread_id
  const threads = useMemo(() => {
    const threadMap = {}
    
    // Filter only PROMPT and RESPONSE events
    // Make sure we're getting events from all participants
    const aiEvents = events.filter(e => {
      if (e.event_type !== 'PROMPT' && e.event_type !== 'RESPONSE') {
        return false
      }
      if (!e.data) {
        return false
      }
      // For PROMPT events, check for prompt_text
      if (e.event_type === 'PROMPT' && !e.data.prompt_text) {
        return false
      }
      // For RESPONSE events, check for response_text
      if (e.event_type === 'RESPONSE' && !e.data.response_text) {
        return false
      }
      return true
    })
    
    console.log('ThreadConversations: Total events:', events.length, 'AI events:', aiEvents.length)
    
    // Group by thread_id
    aiEvents.forEach(event => {
      const threadId = event.data?.thread_id || 'no-thread'
      if (!threadMap[threadId]) {
        threadMap[threadId] = []
      }
      threadMap[threadId].push(event)
    })
    
    // Sort events within each thread by timestamp
    Object.keys(threadMap).forEach(threadId => {
      threadMap[threadId].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      )
    })
    
    // Sort threads by most recent event
    return Object.entries(threadMap).sort((a, b) => {
      const aLatest = a[1][a[1].length - 1]?.timestamp || ''
      const bLatest = b[1][b[1].length - 1]?.timestamp || ''
      return new Date(bLatest) - new Date(aLatest)
    })
  }, [events])

  const [expandedThreads, setExpandedThreads] = useState(new Set())
  const [replyingToThread, setReplyingToThread] = useState(null)

  const toggleThread = (threadId) => {
    const newExpanded = new Set(expandedThreads)
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId)
    } else {
      newExpanded.add(threadId)
    }
    setExpandedThreads(newExpanded)
  }

  const handleReply = (threadId) => {
    setReplyingToThread(threadId)
    if (onReplyToThread) {
      onReplyToThread(threadId)
    }
  }

  if (threads.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          AI Conversations
        </h3>
        <p className="text-sm text-gray-500">No conversations yet</p>
        <p className="text-xs text-gray-400 mt-2">Start a conversation by asking the AI a question!</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow border-2 border-purple-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <span className="text-2xl">💬</span>
        AI Conversations
        <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded-full">{threads.length}</span>
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {threads.map(([threadId, threadEvents]) => {
          const isExpanded = expandedThreads.has(threadId)
          const firstPrompt = threadEvents.find(e => e.event_type === 'PROMPT')
          const previewText = firstPrompt?.data?.prompt_text?.substring(0, 80) || '...'
          
          return (
            <div
              key={threadId}
              className="border-2 border-purple-300 rounded-lg overflow-hidden"
            >
              {/* Thread Header */}
              <div
                className="bg-purple-50 p-3 cursor-pointer hover:bg-purple-100"
                onClick={() => toggleThread(threadId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-700">
                      Thread {threadId.substring(0, 8)}...
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Started by {firstPrompt?.actor_name || 'Someone'} • {threadEvents.length} message{threadEvents.length !== 1 ? 's' : ''}
                    </div>
                    {!isExpanded && (
                      <div className="text-sm text-gray-700 mt-1 italic">
                        "{previewText}..."
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              {/* Thread Messages */}
              {isExpanded && (
                <div className="p-3 space-y-3 bg-white">
                  {threadEvents.map((event, idx) => {
                    if (event.event_type === 'PROMPT') {
                      return (
                        <div
                          key={event.event_id}
                          className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">💬</span>
                            <div className="flex-1">
                              <div className="font-semibold text-purple-700 text-sm mb-1">
                                {event.actor_name || 'Someone'} asked:
                              </div>
                              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                {event.data?.prompt_text || '...'}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {new Date(event.timestamp).toLocaleString()} • 
                                Role: {event.data?.role || 'analyst'} • 
                                Model: {event.data?.model || 'unknown'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    } else if (event.event_type === 'RESPONSE') {
                      return (
                        <div
                          key={event.event_id}
                          className="bg-green-50 border-l-4 border-green-500 p-3 rounded ml-4"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">🤖</span>
                            <div className="flex-1">
                              <div className="font-semibold text-green-700 text-sm mb-1">
                                AI Response:
                              </div>
                              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                {event.data?.response_text || '...'}
                              </div>
                              <div className="text-xs text-gray-500 mt-2">
                                {new Date(event.timestamp).toLocaleString()} • 
                                Role: {event.data?.role || 'analyst'} • 
                                Model: {event.data?.model || 'unknown'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })}
                  
                  {/* Reply Button */}
                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleReply(threadId)}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
                    >
                      💬 Reply to this thread
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 <strong>Thread-based Conversations:</strong> All participants can see and continue any conversation thread!
        </p>
      </div>
    </div>
  )
}

export default ThreadConversations
