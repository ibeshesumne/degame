import React, { useState, useMemo } from 'react'

function ConversationView({ events, gameId }) {
  // Group prompts and responses together
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
    
    // Add any responses that don't have a matching prompt (shouldn't happen, but handle it)
    responseMap.forEach((responseEvent, parentId) => {
      if (!promptMap.has(parentId)) {
        convos.push({
          id: `response_${responseEvent.event_id}`,
          prompt: null,
          response: responseEvent,
          timestamp: responseEvent.timestamp,
          threadId: responseEvent.data?.thread_id
        })
      }
    })
    
    // Sort by timestamp (most recent first)
    return convos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [events])

  const [expandedThreads, setExpandedThreads] = useState(new Set())

  const toggleThread = (threadId) => {
    const newExpanded = new Set(expandedThreads)
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId)
    } else {
      newExpanded.add(threadId)
    }
    setExpandedThreads(newExpanded)
  }

  // Group by thread if there are threads
  const groupedByThread = useMemo(() => {
    const threads = {}
    const noThread = []
    
    conversations.forEach(conv => {
      if (conv.threadId && conv.threadId !== 'no-thread') {
        if (!threads[conv.threadId]) {
          threads[conv.threadId] = []
        }
        threads[conv.threadId].push(conv)
      } else {
        noThread.push(conv)
      }
    })
    
    // Sort threads by most recent conversation
    const sortedThreads = Object.entries(threads).sort((a, b) => {
      const aLatest = a[1][0]?.timestamp || ''
      const bLatest = b[1][0]?.timestamp || ''
      return new Date(bLatest) - new Date(aLatest)
    })
    
    return { threads: sortedThreads, noThread }
  }, [conversations])

  if (conversations.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          AI Conversations
        </h3>
        <p className="text-sm text-gray-500">No conversations yet</p>
        <p className="text-xs text-gray-400 mt-2">Ask the AI a question to start a conversation!</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow border-2 border-purple-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">💬</span>
        AI Conversations
        <span className="bg-purple-500 text-white text-sm px-2 py-1 rounded-full">{conversations.length}</span>
      </h3>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {/* Show threaded conversations */}
        {groupedByThread.threads.map(([threadId, threadConvos]) => {
          const isExpanded = expandedThreads.has(threadId)
          const firstConvo = threadConvos[threadConvos.length - 1] // Oldest in thread
          
          return (
            <div key={threadId} className="border-2 border-purple-300 rounded-lg overflow-hidden">
              {/* Thread Header */}
              <div
                className="bg-purple-50 p-3 cursor-pointer hover:bg-purple-100"
                onClick={() => toggleThread(threadId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-700">
                      Thread {threadId.substring(0, 8)}... • {threadConvos.length} conversation{threadConvos.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Started by {firstConvo.prompt?.actor_name || 'Someone'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{isExpanded ? '▼' : '▶'}</div>
                </div>
              </div>

              {/* Thread Conversations */}
              {isExpanded && (
                <div className="p-3 space-y-4 bg-white">
                  {threadConvos.map((conv) => (
                    <ConversationItem key={conv.id} conversation={conv} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Show non-threaded conversations */}
        {groupedByThread.noThread.map((conv) => (
          <ConversationItem key={conv.id} conversation={conv} />
        ))}
      </div>
    </div>
  )
}

function ConversationItem({ conversation }) {
  const { prompt, response } = conversation

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
      {/* Prompt Section */}
      {prompt && (
        <div className="bg-purple-50 border-b-2 border-purple-200 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💬</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-purple-700">
                  {prompt.actor_name || 'Someone'}
                </span>
                <span className="text-xs text-gray-500">asked:</span>
                <span className="text-xs text-gray-400">
                  {new Date(prompt.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-3 rounded border border-purple-200">
                <div className="text-gray-800 whitespace-pre-wrap">
                  {prompt.data?.prompt_text || '(No prompt text)'}
                </div>
              </div>
              {(prompt.data?.role || prompt.data?.model) && (
                <div className="text-xs text-gray-500 mt-2">
                  Role: {prompt.data?.role || 'analyst'} • Model: {prompt.data?.model || 'unknown'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response Section */}
      {response ? (
        <div className="bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-green-700">AI Response</span>
                <span className="text-xs text-gray-400">
                  {new Date(response.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <div className="text-gray-800 whitespace-pre-wrap">
                  {response.data?.response_text || (
                    <span className="text-yellow-600 italic">
                      ⚠️ Response text not available. Event data: {JSON.stringify(response.data || {}).substring(0, 100)}
                    </span>
                  )}
                </div>
              </div>
              {(response.data?.role || response.data?.model) && (
                <div className="text-xs text-gray-500 mt-2">
                  Role: {response.data?.role || 'analyst'} • Model: {response.data?.model || 'unknown'}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 border-t-2 border-yellow-200">
          <div className="text-sm text-yellow-700 italic">
            ⏳ Waiting for AI response...
          </div>
        </div>
      )}
    </div>
  )
}

export default ConversationView
