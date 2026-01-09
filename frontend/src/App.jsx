import React, { useState, useEffect, useRef } from 'react'
import GameBoard from './components/GameBoard'
import PlayerSetup from './components/PlayerSetup'
import AIPanel from './components/AIPanel'
import EquilibriaDisplay from './components/EquilibriaDisplay'
import JoinGame from './components/JoinGame'
import ActiveSessions from './components/ActiveSessions'
import EventFeed from './components/EventFeed'
import ThreadConversations from './components/ThreadConversations'
import ConversationView from './components/ConversationView'
import AIConversations from './components/AIConversations'
import axios from 'axios'

// Use environment variable or default to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  const [gameId, setGameId] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [players, setPlayers] = useState([])
  const [equilibria, setEquilibria] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Multi-user state
  const [userName, setUserName] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [events, setEvents] = useState([])
  const [lastUpdateTime, setLastUpdateTime] = useState(null)
  const pollingIntervalRef = useRef(null)
  const [replyingToThread, setReplyingToThread] = useState(null)

  // Generate a unique session ID for this user
  useEffect(() => {
    if (!sessionId) {
      // Generate a unique session ID (in production, this would come from auth)
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
    }
  }, [sessionId])

  // Test backend connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        let response
        try {
          response = await fetch(`${API_BASE}/`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit',
          })
        } catch (fetchErr) {
          console.log('Fetch failed, trying axios...', fetchErr)
          const axiosResponse = await axios.get(`${API_BASE}/`, {
            headers: { 'Accept': 'application/json' },
            timeout: 5000
          })
          console.log('✓ Backend connected (via axios):', axiosResponse.data)
          setError(null)
          return
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('✓ Backend connected (via fetch):', data)
        setError(null)
      } catch (err) {
        console.error('✗ Backend connection error:', err)
        const errorMsg = err.message || err.toString() || 'Unknown error'
        
        if (err.message?.includes('Failed to fetch') || 
            err.message?.includes('NetworkError') || 
            err.name === 'TypeError' ||
            err.message?.includes('Network request failed') ||
            err.code === 'ECONNREFUSED') {
          setError(`Cannot connect to backend at ${API_BASE}. Make sure the backend server is running: cd backend && python -m src`)
        } else {
          setError(`Backend connection error: ${errorMsg}`)
        }
      }
    }
    testConnection()
  }, [])

  const createGame = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.post(
        `${API_BASE}/game/create?game_type=prisoner_dilemma`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${sessionId || 'anonymous'}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )
      const newGameId = response.data.game_id
      setGameId(newGameId)
      
      // If user has a name, join the game automatically
      if (userName && sessionId) {
        await joinGame(newGameId, userName)
      }
      
      await fetchGameState(newGameId)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create game'
      console.error('Create game error:', err)
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError(`Cannot connect to backend at ${API_BASE}. Make sure backend is running: cd backend && python -m src`)
      } else {
        setError(`Error creating game: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const joinGame = async (gameIdToJoin, name) => {
    try {
      setLoading(true)
      setError(null)
      
      // If no gameId provided, create a new game first
      let finalGameId = gameIdToJoin
      if (!finalGameId) {
        const createResponse = await axios.post(
          `${API_BASE}/game/create?game_type=prisoner_dilemma`,
          {},
          {
            headers: { 
              'Authorization': `Bearer ${sessionId || 'anonymous'}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        )
        finalGameId = createResponse.data.game_id
      }
      
      // Join the game - send user_name in request body
      const response = await axios.post(
        `${API_BASE}/game/${finalGameId}/join`,
        { user_name: name },
        {
          headers: { 
            'Authorization': `Bearer ${sessionId || 'anonymous'}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )
      setGameId(finalGameId)
      setUserName(name)
      // Clear events from previous game before loading new ones
      setEvents([])
      setLastUpdateTime(null)
      await fetchGameState(finalGameId)
      await fetchSessions(finalGameId)
      // Load all existing events first
      await fetchUpdates(finalGameId, null)
      // Start polling for updates
      startPolling(finalGameId)
    } catch (err) {
      console.error('Join game error:', err)
      let errorMsg = 'Failed to join game'
      
      if (err.response) {
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMsg = err.response.data
          } else if (err.response.data.detail) {
            errorMsg = err.response.data.detail
          } else if (err.response.data.message) {
            errorMsg = err.response.data.message
          }
        }
      } else if (err.message) {
        errorMsg = err.message
      }
      
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError(`Cannot connect to backend at ${API_BASE}. Make sure backend is running: cd backend && python -m src`)
      } else {
        setError(`Error joining game: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/game/${id}/sessions`, {
        headers: { 'Authorization': `Bearer ${sessionId || 'anonymous'}` },
        timeout: 10000
      })
      setSessions(response.data.sessions || [])
    } catch (err) {
      console.error('Fetch sessions error:', err)
      setSessions([])
    }
  }

  const fetchUpdates = async (id, since = null) => {
    try {
      const url = since 
        ? `${API_BASE}/game/${id}/updates?since=${encodeURIComponent(since)}`
        : `${API_BASE}/game/${id}/updates`
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${sessionId || 'anonymous'}` },
        timeout: 10000
      })
      
      if (response.data.events && response.data.events.length > 0) {
        // Filter events to only include those for the current game_id
        const gameEvents = response.data.events.filter(e => e.game_id === id)
        
        // Deduplicate events by event_id and keep only new ones
        setEvents(prev => {
          // If since is null (initial fetch), replace all events with new ones for this game
          if (since === null) {
            return gameEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          }
          
          // Otherwise, append new events
          const existingIds = new Set(prev.map(e => e.event_id))
          const newEvents = gameEvents.filter(e => !existingIds.has(e.event_id))
          const combined = [...prev, ...newEvents]
          // Sort by timestamp - keep all events (not just last 100) so all threads are visible
          return combined
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        })
        // Refresh game state if there are new moves
        const hasMoves = gameEvents.some(e => e.event_type === 'MOVE' || e.event_type === 'ROUND_RESOLVED')
        if (hasMoves) {
          await fetchGameState(id)
        }
      } else {
        // If no events returned and this is initial fetch, clear events
        if (since === null) {
          setEvents([])
        }
      }
      
      if (response.data.latest_timestamp) {
        setLastUpdateTime(response.data.latest_timestamp)
      }
    } catch (err) {
      console.error('Fetch updates error:', err)
    }
  }

  const startPolling = (id) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    
    // Initial fetch
    fetchUpdates(id, lastUpdateTime)
    fetchSessions(id)
    
    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (id) {
        fetchUpdates(id, lastUpdateTime)
        fetchSessions(id)
      }
    }, 2000)
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const fetchGameState = async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/game/${id}/state`, {
        headers: { 'Authorization': `Bearer ${sessionId || 'anonymous'}` },
        timeout: 10000
      })
      setGameState(response.data.game_state)
      setPlayers(Object.values(response.data.game_state.players))
      setError(null)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch game state'
      setError(`Error fetching game state: ${errorMsg}`)
      console.error('Fetch game state error:', err)
    }
  }

  const addPlayer = async (playerData) => {
    try {
      setLoading(true)
      setError(null)
      await axios.post(
        `${API_BASE}/game/${gameId}/add-player`,
        playerData,
        { 
          headers: { 
            'Authorization': `Bearer ${sessionId || 'anonymous'}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )
      await fetchGameState(gameId)
      await fetchUpdates(gameId, lastUpdateTime)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to add player'
      console.error('Add player error:', err)
      if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
        setError(`Cannot connect to backend at ${API_BASE}. Make sure backend is running: cd backend && python -m src`)
      } else {
        setError(`Error adding player: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const submitMove = async (playerId, moveType) => {
    try {
      setLoading(true)
      await axios.post(
        `${API_BASE}/game/${gameId}/submit-move?player_id=${playerId}&move_type=${moveType}`,
        {},
        {
          headers: { 
            'Authorization': `Bearer ${sessionId || 'anonymous'}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )
      await fetchGameState(gameId)
      await fetchUpdates(gameId, lastUpdateTime)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to submit move'
      setError(`Error submitting move: ${errorMsg}`)
      console.error('Submit move error:', err)
    } finally {
      setLoading(false)
    }
  }

  const resolveRound = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${API_BASE}/game/${gameId}/resolve-round`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${sessionId || 'anonymous'}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )
      await fetchGameState(gameId)
      await fetchUpdates(gameId, lastUpdateTime)
      return response.data
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to resolve round'
      setError(`Error resolving round: ${errorMsg}`)
      console.error('Resolve round error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchEquilibria = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${API_BASE}/game/${gameId}/equilibria`,
        { 
          headers: { 'Authorization': `Bearer ${sessionId || 'anonymous'}` },
          timeout: 10000
        }
      )
      setEquilibria(response.data.equilibria)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch equilibria'
      setError(`Error fetching equilibria: ${errorMsg}`)
      console.error('Fetch equilibria error:', err)
    } finally {
      setLoading(false)
    }
  }

  const askAI = async (promptData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.post(
        `${API_BASE}/game/ask-ai`,
        {
          ...promptData,
          game_id: gameId,
          triggered_by: sessionId || 'anonymous',
          context: {
            general_analysis: promptData.general_analysis || false
          }
        },
        { 
          headers: { 
            'Authorization': `Bearer ${sessionId || 'anonymous'}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )
      await fetchUpdates(gameId, lastUpdateTime)
      return response.data
    } catch (err) {
      let errorMsg = 'Failed to get AI response'
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMsg = 'AI request timed out after 60 seconds. The AI service may be slow or unavailable. Please try again.'
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail
      } else if (err.message) {
        errorMsg = err.message
      }
      
      setError(`Error asking AI: ${errorMsg}`)
      console.error('Ask AI error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Show join game form if user hasn't joined yet
  if (!userName || !gameId) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">Game-Theoretic Platform</h1>
          <p className="text-sm">Multi-User Nash Equilibrium & AI Decision Making</p>
        </header>

        <main className="container mx-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
              <div className="mt-2 text-sm">
                <p>Backend URL: <code>{API_BASE}</code></p>
                <p className="mt-1">Make sure the backend is running:</p>
                <code className="block mt-1 p-2 bg-red-200 rounded">cd backend && python -m src</code>
              </div>
            </div>
          )}

          <JoinGame
            onJoin={joinGame}
            gameId={gameId}
            userName={userName}
            onUserNameChange={setUserName}
          />

          <div className="bg-white p-6 rounded shadow mt-6">
            <h3 className="text-lg font-semibold mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Option 1: Create a New Game</strong></p>
              <p>Enter your name and leave the Game ID field empty. A new game will be created and you can share the Game ID with others.</p>
              <p className="mt-4"><strong>Option 2: Join an Existing Game</strong></p>
              <p>Enter your name and the Game ID from someone who created a game. You'll see their moves in real-time!</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (loading && !gameId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">Game-Theoretic Platform</h1>
        <p className="text-sm">Multi-User Nash Equilibrium & AI Decision Making</p>
      </header>

      <main className="container mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
            <div className="mt-2 text-sm">
              <p>Backend URL: <code>{API_BASE}</code></p>
              <p className="mt-1">Make sure the backend is running:</p>
              <code className="block mt-1 p-2 bg-red-200 rounded">cd backend && python -m src</code>
            </div>
          </div>
        )}

        {gameId && (
          <>
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg border-2 border-blue-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <span className="text-2xl">🎮</span>
                    Game ID: <code className="bg-white px-3 py-1 rounded border-2 border-blue-400 font-mono text-lg">{gameId}</code>
                  </h2>
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>👥 Multi-Participant Mode:</strong> Share this Game ID with others to let them join! 
                    {sessions.length > 0 && (
                      <span className="ml-2 text-blue-600 font-semibold">
                        ({sessions.length} participant{sessions.length !== 1 ? 's' : ''} active)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createGame}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    New Game
                  </button>
                  <button
                    onClick={() => {
                      setUserName(null)
                      setGameId(null)
                      setEvents([])
                      setSessions([])
                      if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current)
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Leave Game
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PlayerSetup
                  players={players}
                  onAddPlayer={addPlayer}
                  gameState={gameState}
                />
                <GameBoard
                  gameState={gameState}
                  players={players}
                  onSubmitMove={submitMove}
                  onResolveRound={resolveRound}
                  loading={loading}
                />
              </div>

              <div className="lg:col-span-1 space-y-6">
                <ActiveSessions sessions={sessions} currentSessionId={sessionId} />
                {/* Clean AI Conversations - shows prompts and responses in clear boxes */}
                <div className="bg-red-500 p-4 mb-4 text-white font-bold border-4 border-red-700">
                  🔴 DEBUG: About to render AIConversations with {events?.length || 0} events | gameId: {gameId || 'none'}
                </div>
                {/* Test: Simple div to verify location */}
                <div className="bg-yellow-400 p-4 mb-4 border-4 border-yellow-600">
                  🟡 TEST: This should be visible. If you see this but not AIConversations, component is failing.
                </div>
                <AIConversations events={events} gameId={gameId} />
                {/* Test: Another div after to verify component rendered */}
                <div className="bg-green-400 p-4 mt-4 border-4 border-green-600">
                  🟢 TEST: This appears after AIConversations. If you see this but not the component above, component returned null/undefined.
                </div>
                <AIPanel
                  gameId={gameId}
                  onAskAI={askAI}
                  gameState={gameState}
                  replyingToThread={replyingToThread}
                  onReplyComplete={() => setReplyingToThread(null)}
                />
                <EquilibriaDisplay
                  equilibria={equilibria}
                  onFetchEquilibria={fetchEquilibria}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
