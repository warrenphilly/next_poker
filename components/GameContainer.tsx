"use client"

import React from 'react'

import { useEffect, useState, useCallback } from 'react'
import PokerTable from '@/components/table'
import GameControls from '@/components/GameControls'
import { GameState, Player, ChatMessage } from '@/types/game.types'
import { initializeGame, progressGame, aiAction, isRoundComplete } from '@/libs/actions/game.actions'
import ChatLog from '@/components/ChatLog'
import PlayerHand from '@/components/PlayerHand'

interface GameContainerProps {
  messages: ChatMessage[]
  setMessages: (messages: ChatMessage[]) => void
  gameState: GameState | null
  setGameState: (gameState: GameState | null) => void
}

export default function GameContainer({ 
  messages, 
  setMessages, 
  gameState, 
  setGameState 
}: GameContainerProps) {
  const addMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {
      text,
      timestamp: new Date()
    }])
  }, [setMessages])

  const startNewGame = async () => {
    const newGame = await initializeGame()
    setGameState(newGame)
    addMessage('New game started!')
  }

  const handleCall = async () => {
    if (!gameState || gameState.currentPlayer !== 0) return
    
    const humanPlayer = gameState.players[0]
    const playerBet = gameState.roundBets[0] || 0
    const toCall = gameState.currentBet - playerBet
    const callAmount = Math.min(toCall, humanPlayer.chips)

    const newState: GameState = {
      ...gameState,
      pot: gameState.pot + callAmount,
      roundBets: {
        ...gameState.roundBets,
        0: (gameState.roundBets[0] || 0) + callAmount
      },
      players: gameState.players.map((p: Player) => 
        p.isHuman ? { ...p, chips: p.chips - callAmount } : p
      ),
      currentPlayer: 1,
      lastAction: toCall === 0 ? 'Player checked' : `Player called $${callAmount}`
    }
    
    addMessage(newState.lastAction)
    setGameState(newState)

    // Process AI turn
    const aiState = await aiAction(newState)
    addMessage(aiState.lastAction)
    setGameState(aiState)

    // Check if round is complete
    if (await isRoundComplete(aiState)) {
      const nextState = await progressGame(aiState)
      setGameState(nextState)
      addMessage(nextState.lastAction)
    }
  }

  const handleRaise = async (amount: number) => {
    if (!gameState || gameState.currentPlayer !== 0) return
    
    const humanPlayer = gameState.players[0]
    const currentBet = gameState.roundBets[0] || 0
    const raiseAmount = amount - currentBet

    const newState: GameState = {
      ...gameState,
      pot: gameState.pot + raiseAmount,
      currentBet: amount,
      roundBets: {
        ...gameState.roundBets,
        0: amount
      },
      players: gameState.players.map((p: Player) => 
        p.isHuman ? { ...p, chips: p.chips - raiseAmount } : p
      ),
      currentPlayer: 1,
      lastRaisePlayer: 0,
      lastAction: `Player raised to $${amount}`
    }
    
    addMessage(newState.lastAction)
    setGameState(newState)

    // Process AI turn
    const aiState = await aiAction(newState)
    addMessage(aiState.lastAction)
    setGameState(aiState)

    // Check if round is complete
    if (await isRoundComplete(aiState)) {
      const nextState = await progressGame(aiState)
      setGameState(nextState)
      addMessage(nextState.lastAction)
    }
  }

  const handleFold = async () => {
    if (!gameState || gameState.currentPlayer !== 0) return

    const newState: GameState = {
      ...gameState,
      players: gameState.players.map((p, i) => 
        i === 0 ? { ...p, hasFolded: true } : p
      ),
      currentPlayer: 1,
      lastAction: 'Player folded'
    }

    addMessage('You folded')
    setGameState(newState)

    // End game immediately on fold
    const finalState = await progressGame(newState)
    setGameState(finalState)
    addMessage(finalState.lastAction)
  }

  return (
    <div className="relative w-full">
      {!gameState && (
        <button
          onClick={startNewGame}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Start Game
        </button>
      )}

      {gameState && (
        <>
          <PokerTable 
            communityCards={gameState.communityCards}
            playerHands={gameState.players.map(p => p.hand)}
            activePlayer={gameState.currentPlayer}
            players={gameState.players}
            gameState={gameState}
          />
          
          {!gameState.gameOver && (
            <GameControls 
              gameState={gameState}
              onCall={handleCall}
              onRaise={handleRaise}
              onFold={handleFold}
              isPlayerTurn={gameState.currentPlayer === 0}
              onProgress={(state: GameState) => progressGame(state)}
            />
          )}
        </>
      )}
    </div>
  )
}