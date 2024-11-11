'use client'

import { useState } from 'react'
import { ChatMessage, GameState } from '@/types/game.types'
import ChatLog from '@/components/ChatLog'
import GameContainer from '@/components/GameContainer'
import { initializeGame } from '@/libs/actions/game.actions'

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <main className="relative w-full max-w-6xl mx-auto">
        <GameContainer 
          messages={messages} 
          setMessages={setMessages}
          gameState={gameState}
          setGameState={setGameState}
        />
        
        <div className="fixed top-4 right-4">
          <ChatLog messages={messages} />
        </div>

        {/* Game Over Modal */}
        {gameState?.gameOver && (
        
            <div className="bg-slate-800 p-8 rounded-lg text-white text-center max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-2">{gameState.lastAction}</h2>
              {gameState.winningHand && (
                <p className="text-lg mb-4">
                  Winning Hand: {gameState.winningHand.rank}
                </p>
              )}
              <button
                onClick={async () => {
                  const newGame = await initializeGame()
                  setGameState(newGame)
                  setMessages(prev => [...prev, { text: 'New game started!', timestamp: new Date() }])
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 
                          transition-colors duration-200"
              >
                Play Again
              </button>
            </div>
         
        )}
      </main>
    </div>
  )
}
