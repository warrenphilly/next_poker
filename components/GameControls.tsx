'use client'

import { GameState } from '@/types/game.types'
import { useState, useEffect } from 'react'
import { canPlayerRaise } from '@/libs/actions/game.actions'

interface GameControlsProps {
  gameState: GameState
  onCall: () => void
  onRaise: (amount: number) => void
  onFold: () => void
  onProgress: () => Promise<any>
   isPlayerTurn: boolean
   
}

export default function GameControls({ gameState, onCall, onRaise, onFold }: GameControlsProps) {
  const [raiseAmount, setRaiseAmount] = useState(gameState.currentBet * 2)
  const humanPlayer = gameState.players[0]
  const playerBet = gameState.roundBets[0] || 0
  const toCall = gameState.currentBet - playerBet
  const [canRaise, setCanRaise] = useState(false)
  
  useEffect(() => {
    const checkCanRaise = async () => {
      const result = await canPlayerRaise(gameState)
      setCanRaise(result)
    }
    checkCanRaise()
  }, [gameState])
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 p-4 rounded-lg shadow-xl ">
      <div className="flex gap-4">
        <button
          onClick={() => onCall()}
          disabled={humanPlayer.hasFolded || (toCall === 0 && gameState.stage === 'preflop')}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {toCall === 0 ? 'Check' : `Call $${toCall}`}
        </button>
        
        <div className="flex gap-2">
          <input
            type="number"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            min={gameState.currentBet > 0 ? gameState.currentBet * 2 : gameState.bigBlind}
            max={humanPlayer.chips}
            disabled={!canRaise}
            className="w-20 px-2 rounded disabled:opacity-50"
          />
          <button
            onClick={() => onRaise(raiseAmount)}
            disabled={!canRaise || humanPlayer.chips < (gameState.currentBet > 0 ? gameState.currentBet * 2 : gameState.bigBlind)}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Raise
          </button>
        </div>
      </div>
    </div>
  )
}
