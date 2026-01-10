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
import AIConversations from './components/AIConversations.jsx'
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
  const [isCreator, setIsCreator] = useState(false)
  const [showWipeConfirm, setShowWipeConfirm] = useState(false)

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
      } else {
        // Still check creator status even if not joined yet
        await checkCreator(newGameId)
        await fetchGameState(newGameId)
      }
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
      await checkCreator(finalGameId)
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

  const handleGameWiped = () => {
    // Game has been wiped - clear all state and show prominent message
    const wipedGameId = gameId // Save before clearing
    
    setGameId(null)
    setGameState(null)
    setPlayers([])
    setEvents([])
    setSessions([])
    setIsCreator(false)
    
    // Stop polling immediately
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    // Show prominent alert
    alert(`⚠️ Game Deleted\n\nThe game "${wipedGameId}" has been permanently deleted by its creator.\n\nAll game data, events, and sessions have been removed.`)
    
    // Also set error message for display
    setError(`This game (${wipedGameId}) has been permanently deleted by its creator.`)
  }

  const fetchSessions = async (id) => {
    // Don't fetch if no game ID provided
    if (!id) {
      return
    }
    
    // Only prevent fetch if gameId was explicitly cleared (set to null) - not if it's just different
    // This allows joining a game where gameId state hasn't updated yet
    if (gameId === null) {
      return
    }
    
    try {
      const response = await axios.get(`${API_BASE}/game/${id}/sessions`, {
        headers: { 'Authorization': `Bearer ${sessionId || 'anonymous'}` },
        timeout: 10000
      })
      setSessions(response.data.sessions || [])
    } catch (err) {
      console.error('Fetch sessions error:', err)
      // Check if game was wiped (404 or game not found)
      const is404 = err.response?.status === 404
      const isNotFound = err.response?.data?.detail?.toLowerCase().includes('not found') || 
                        err.response?.data?.detail?.toLowerCase().includes('wiped')
      
      if (is404 || isNotFound) {
        console.log('Game appears to be wiped (from sessions fetch), handling...')
        handleGameWiped()
        return
      }
      setSessions([])
    }
  }

  const checkCreator = async (id) => {
    // Don't fetch if no game ID provided
    if (!id) {
      return
    }
    
    // Only prevent fetch if gameId was explicitly cleared (set to null) - not if it's just different
    // This allows joining a game where gameId state hasn't updated yet
    if (gameId === null) {
      return
    }
    
    try {
      const response = await axios.get(`${API_BASE}/game/${id}/creator`, {
        headers: { 'Authorization': `Bearer ${sessionId || 'anonymous'}` },
        timeout: 10000
      })
      setIsCreator(response.data.is_creator || false)
    } catch (err) {
      console.error('Check creator error:', err)
      // Check if game was wiped (404 or game not found)
      const is404 = err.response?.status === 404
      const isNotFound = err.response?.data?.detail?.toLowerCase().includes('not found') || 
                        err.response?.data?.detail?.toLowerCase().includes('wiped')
      
      if (is404 || isNotFound) {
        console.log('Game appears to be wiped (from creator check), handling...')
        handleGameWiped()
        return
      }
      setIsCreator(false)
    }
  }

  const wipeGame = async () => {
    if (!gameId) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await axios.delete(
        `${API_BASE}/game/${gameId}/wipe`,
        {
          headers: { 
            'Authorization': `Bearer ${sessionId || 'anonymous'}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )
      
      // Clear all game state
      setUserName(null)
      setGameId(null)
      setEvents([])
      setSessions([])
      setIsCreator(false)
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      
      alert(`Game wiped successfully. ${response.data.warning}`)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to wipe game'
      setError(`Error wiping game: ${errorMsg}`)
      console.error('Wipe game error:', err)
    } finally {
      setLoading(false)
      setShowWipeConfirm(false)
    }
  }

  const fetchUpdates = async (id, since = null) => {
    // Don't fetch if no game ID provided
    if (!id) {
      return
    }
    
    // Only prevent fetch if gameId was explicitly cleared (set to null) - not if it's just different
    // This allows joining a game where gameId state hasn't updated yet
    if (gameId === null) {
      return
    }
    
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
      // Check if game was wiped (404 or game not found)
      const is404 = err.response?.status === 404
      const isNotFound = err.response?.data?.detail?.toLowerCase().includes('not found') || 
                        err.response?.data?.detail?.toLowerCase().includes('wiped')
      
      if (is404 || isNotFound) {
        console.log('Game appears to be wiped, handling...')
        handleGameWiped()
        return
      }
      // For other errors, just log but don't break the polling
    }
  }

  const startPolling = (id) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    // Don't start polling if no game ID
    if (!id) {
      return
    }
    
    // Initial fetch
    fetchUpdates(id, lastUpdateTime)
    fetchSessions(id)
    
    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      // Check if game was wiped (gameId set to null) before polling
      // Allow polling if gameId matches OR if gameId hasn't been set yet (during join)
      if (id && gameId !== null) {
        fetchUpdates(id, lastUpdateTime)
        fetchSessions(id)
      } else {
        // Game was wiped (gameId is null), stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
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
    // Don't fetch if no game ID provided
    if (!id) {
      return
    }
    
    // Only prevent fetch if gameId was explicitly cleared (set to null) - not if it's just different
    // This allows joining a game where gameId state hasn't updated yet
    if (gameId === null) {
      return
    }
    
    try {
      const response = await axios.get(`${API_BASE}/game/${id}/state`, {
        headers: { 'Authorization': `Bearer ${sessionId || 'anonymous'}` },
        timeout: 10000
      })
      setGameState(response.data.game_state)
      setPlayers(Object.values(response.data.game_state.players))
      setError(null)
    } catch (err) {
      // Check if game was wiped (404 or game not found)
      const is404 = err.response?.status === 404
      const isNotFound = err.response?.data?.detail?.toLowerCase().includes('not found') || 
                        err.response?.data?.detail?.toLowerCase().includes('wiped')
      
      if (is404 || isNotFound) {
        console.log('Game appears to be wiped (from state fetch), handling...')
        handleGameWiped()
        return
      }
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

        {showWipeConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Wipe Game?</h3>
              <p className="mb-4 text-gray-700">
                Are you sure you want to <strong>permanently delete</strong> this game? This action cannot be undone.
              </p>
              <p className="mb-4 text-sm text-gray-600">
                This will delete:
                <ul className="list-disc list-inside mt-2">
                  <li>All game data</li>
                  <li>All events and history</li>
                  <li>All participant sessions</li>
                </ul>
              </p>
              <p className="mb-4 text-sm font-semibold text-red-700">
                The game will be completely removed and cannot be reopened by anyone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowWipeConfirm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={wipeGame}
                  className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 font-semibold"
                >
                  Yes, Wipe Game
                </button>
              </div>
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
                      setIsCreator(false)
                      if (pollingIntervalRef.current) {
                        clearInterval(pollingIntervalRef.current)
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Leave Game
                  </button>
                  {isCreator && (
                    <button
                      onClick={() => setShowWipeConfirm(true)}
                      className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 font-semibold"
                      title="Permanently delete this game and all its data"
                    >
                      🗑️ Wipe Game
                    </button>
                  )}
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
                
                {/* AI Conversations - shows prompts and responses in clean boxes */}
                <AIConversations events={events} gameId={gameId} />
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
