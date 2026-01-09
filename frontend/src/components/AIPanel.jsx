import React, { useState, useEffect } from 'react'

function AIPanel({ gameId, onAskAI, gameState, replyingToThread, onReplyComplete }) {
  const [prompt, setPrompt] = useState('')
  const [role, setRole] = useState('analyst')
  const [model, setModel] = useState('openai:gpt-4')
  const [generalAnalysis, setGeneralAnalysis] = useState(true)
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState(null)
  const [parentPromptId, setParentPromptId] = useState(null)

  // When replying to a thread, set the thread_id and parent_prompt_id
  useEffect(() => {
    if (replyingToThread) {
      setThreadId(replyingToThread)
      setParentPromptId(null) // Will be set by the backend based on thread
      // Focus the prompt textarea
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    } else {
      setThreadId(null)
      setParentPromptId(null)
    }
  }, [replyingToThread])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const promptPayload = {
        role: role,
        model: model,
        prompt_text: prompt,
        general_analysis: generalAnalysis
      }
      
      // If replying to a thread, include thread_id
      if (threadId) {
        promptPayload.thread_id = threadId
        console.log('Replying to thread:', threadId)
      }
      
      if (parentPromptId) {
        promptPayload.parent_prompt_id = parentPromptId
      }
      
      const result = await onAskAI(promptPayload)
      if (result) {
        setResponse(result.response)
        // Clear prompt after successful submission
        setPrompt('')
        // If replying to thread, notify parent
        if (replyingToThread && onReplyComplete) {
          onReplyComplete()
        }
        // Reset thread context
        setThreadId(null)
        setParentPromptId(null)
      }
    } catch (error) {
      console.error('Error asking AI:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">AI Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">AI Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="analyst">Analyst</option>
            <option value="player">Player</option>
            <option value="referee">Referee</option>
            <option value="ethical-reviewer">Ethical Reviewer</option>
            <option value="fast-simulation">Fast Simulation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">AI Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="openai:gpt-4">OpenAI GPT-4</option>
            <option value="openai:gpt-3.5-turbo">OpenAI GPT-3.5</option>
            <option value="anthropic:claude">Anthropic Claude</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Analysis Mode</label>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="generalAnalysis"
              checked={generalAnalysis}
              onChange={(e) => setGeneralAnalysis(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="generalAnalysis" className="text-sm">
              General Game Theory Analysis (analyze any topic through Nash equilibrium lens)
            </label>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {generalAnalysis 
              ? "✓ You can ask about ANY topic (politics, economics, business, etc.) and get game-theoretic analysis"
              : "Analysis will focus on the current game session"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {threadId ? 'Reply to Thread' : 'Prompt'}
            {threadId && (
              <span className="ml-2 text-xs text-purple-600">(Thread: {threadId.substring(0, 8)}...)</span>
            )}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows="4"
            placeholder={threadId
              ? "Continue the conversation in this thread..."
              : generalAnalysis 
                ? "Ask about any topic: 'What would happen if the US captured Venezuela's Maduro?', 'How should oil companies respond to market volatility?', etc. The AI will analyze it through game theory and Nash equilibrium."
                : "Ask AI to analyze the current game state, suggest moves, or evaluate strategies..."}
          />
          {threadId && (
            <button
              type="button"
              onClick={() => {
                setThreadId(null)
                setParentPromptId(null)
                if (onReplyComplete) {
                  onReplyComplete()
                }
              }}
              className="mt-2 text-xs text-purple-600 hover:text-purple-800"
            >
              Cancel reply
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Ask AI'}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-4 bg-purple-50 rounded border border-purple-200">
          <h3 className="font-semibold mb-2">AI Response:</h3>
          <div className="text-sm whitespace-pre-wrap">{response.response_text}</div>
          <div className="mt-2 text-xs text-gray-600">
            Model: {response.model} | Role: {response.role}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIPanel
