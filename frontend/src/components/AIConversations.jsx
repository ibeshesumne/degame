import React, { useMemo } from 'react'

function AIConversations({ events, gameId }) {
  // CRITICAL DEBUG: Log immediately to confirm component is being called
  console.log('🔍🔍🔍 AIConversations COMPONENT CALLED:', { 
    eventsCount: events?.length || 0, 
    gameId,
    eventsType: typeof events,
    isArray: Array.isArray(events),
    events: events 
  })
  
  // Wrap in try-catch to prevent silent failures in production
  try {
    // Ensure events is an array
    const safeEvents = Array.isArray(events) ? events : []
    
    // Process events to pair prompts with responses
    const conversations = useMemo(() => {
    const convos = []
    const promptMap = new Map() // event_id -> prompt event
    const responseMap = new Map() // parent_event_id -> response event
    
    // First pass: collect all prompts and responses
    safeEvents.forEach(event => {
      if (event.event_type === 'PROMPT' && event.data?.prompt_text) {
        promptMap.set(event.event_id, event)
      } else if (event.event_type === 'RESPONSE') {
        // Responses are linked via parent_event_id (which points to the prompt event)
        const parentId = event.parent_event_id
        if (parentId) {
          responseMap.set(parentId, event)
        }
      }
    })
    
    // Second pass: pair prompts with their responses
    promptMap.forEach((promptEvent, promptEventId) => {
      const responseEvent = responseMap.get(promptEventId)
      convos.push({
        id: `conv_${promptEventId}`,
        prompt: promptEvent,
        response: responseEvent || null,
        timestamp: promptEvent.timestamp,
        threadId: promptEvent.data?.thread_id || responseEvent?.data?.thread_id
      })
    })
    
    // Sort by timestamp (oldest first for chronological reading)
    return convos.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [safeEvents])
  
  console.log('🔍 AIConversations processed:', {
    conversationsCount: conversations.length,
    conversations: conversations
  })

    // Always show the component, even if empty
    const promptEvents = safeEvents.filter(e => e.event_type === 'PROMPT')
    const responseEvents = safeEvents.filter(e => e.event_type === 'RESPONSE')
    
    if (conversations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-blue-400" style={{ minHeight: '200px' }}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-3xl">💬</span>
            AI Conversations
            <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">0</span>
          </h2>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4 font-semibold">No conversations yet. Ask the AI a question to get started!</p>
          <div className="bg-gray-100 p-4 rounded border-2 border-gray-300 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">Debug Information:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Total events received: <strong>{safeEvents.length}</strong></li>
              <li>• PROMPT events: <strong>{promptEvents.length}</strong></li>
              <li>• RESPONSE events: <strong>{responseEvents.length}</strong></li>
              <li>• Conversations found: <strong>{conversations.length}</strong></li>
            </ul>
            {promptEvents.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs font-semibold text-purple-700 mb-1">Sample PROMPT events:</p>
                {promptEvents.slice(0, 2).map((e, i) => (
                  <div key={i} className="text-xs text-gray-600 mb-1">
                    • Event ID: {e.event_id} | Has prompt_text: {e.data?.prompt_text ? 'YES' : 'NO'}
                  </div>
                ))}
              </div>
            )}
            {responseEvents.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs font-semibold text-green-700 mb-1">Sample RESPONSE events:</p>
                {responseEvents.slice(0, 2).map((e, i) => (
                  <div key={i} className="text-xs text-gray-600 mb-1">
                    • Event ID: {e.event_id} | parent_event_id: {e.parent_event_id || 'NONE'} | Has response_text: {e.data?.response_text ? 'YES' : 'NO'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="text-3xl">💬</span>
          AI Conversations
          <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full">
            {conversations.length}
          </span>
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          All prompts and responses from all participants in this game
        </p>
      </div>

      <div className="space-y-6">
        {conversations.map((conv) => (
          <ConversationCard key={conv.id} conversation={conv} />
        ))}
      </div>
    </div>
    )
  } catch (error) {
    // Always render something, even if there's an error
    console.error('❌ AIConversations ERROR:', error)
    return (
      <div className="bg-red-100 p-6 rounded-lg shadow-lg border-4 border-red-500" style={{ minHeight: '200px' }}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-red-800 flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            AI Conversations - Error
          </h2>
        </div>
        <div className="text-center py-4">
          <p className="text-red-700 mb-4 font-semibold">Component encountered an error</p>
          <div className="bg-white p-4 rounded border-2 border-red-300 text-left">
            <p className="text-sm font-semibold text-red-700 mb-2">Error Details:</p>
            <pre className="text-xs text-red-600 overflow-auto max-h-40">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
            <p className="text-xs text-gray-600 mt-3">
              Events count: {events?.length || 0} | Game ID: {gameId || 'none'}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

function ConversationCard({ conversation }) {
  const { prompt, response } = conversation
  const participantName = prompt?.actor_name || 'Unknown Participant'
  const promptTime = prompt ? new Date(prompt.timestamp).toLocaleString() : null
  const responseTime = response ? new Date(response.timestamp).toLocaleString() : null

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Prompt Box */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-300 p-5">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">💬</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-lg text-purple-800">
                {participantName}
              </span>
              <span className="text-sm text-gray-600">asked:</span>
              {promptTime && (
                <span className="text-xs text-gray-500 ml-auto">
                  🕐 {promptTime}
                </span>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-purple-200 shadow-sm">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {prompt?.data?.prompt_text || '(No prompt text available)'}
              </div>
            </div>
            {(prompt?.data?.role || prompt?.data?.model) && (
              <div className="text-xs text-gray-500 mt-2 flex gap-3">
                {prompt?.data?.role && (
                  <span>Role: <strong>{prompt.data.role}</strong></span>
                )}
                {prompt?.data?.model && (
                  <span>Model: <strong>{prompt.data.model}</strong></span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Response Box */}
      {response ? (
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl flex-shrink-0">🤖</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-lg text-green-800">AI Response</span>
                {responseTime && (
                  <span className="text-xs text-gray-500 ml-auto">
                    🕐 {responseTime}
                  </span>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-sm">
                {response.data?.response_text ? (
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {response.data.response_text}
                  </div>
                ) : (
                  <div className="text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-300">
                    <div className="font-semibold mb-2">⚠️ Response text not available</div>
                    <details className="text-xs">
                      <summary className="cursor-pointer hover:text-yellow-900 mb-1">
                        Click to see event data
                      </summary>
                      <pre className="mt-2 p-2 bg-yellow-100 rounded overflow-auto max-h-40 text-xs">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
              {(response.data?.role || response.data?.model) && (
                <div className="text-xs text-gray-500 mt-2 flex gap-3">
                  {response.data?.role && (
                    <span>Role: <strong>{response.data.role}</strong></span>
                  )}
                  {response.data?.model && (
                    <span>Model: <strong>{response.data.model}</strong></span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-t-2 border-yellow-300 p-5">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⏳</div>
            <div className="text-yellow-800 font-semibold">
              Waiting for AI response...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIConversations
