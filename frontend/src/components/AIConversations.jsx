import React, { useMemo } from 'react'

function AIConversations({ events, gameId }) {
  // Process events to pair prompts with responses
  const conversations = useMemo(() => {
    const convos = []
    const promptMap = new Map() // event_id -> prompt event
    const responseMap = new Map() // parent_event_id -> response event
    
    // First pass: collect all prompts and responses
    events.forEach(event => {
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
  }, [events])

  if (conversations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">AI Conversations</h2>
          <p className="text-gray-500">No conversations yet. Ask the AI a question to get started!</p>
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
