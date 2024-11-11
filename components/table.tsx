import React from 'react'
import Card from './Card'
import { Player, GameState } from '@/types/game.types'
import { Card as CardType } from '@/libs/actions/deck.actions'

interface PokerTableProps {
  communityCards?: CardType[]
  playerHands?: CardType[][]
  activePlayer?: number
  players: Player[]
  gameState: GameState
}

export default function PokerTable({ communityCards = [], playerHands = [], activePlayer, players, gameState }: PokerTableProps) {
  const isWinningCard = (card: CardType, index: number, isPlayerCard: boolean, playerId?: number) => {
    if (gameState?.stage !== 'showdown' || !gameState?.winningHand) return false
    
    if (isPlayerCard) {
      return playerId === gameState.winningHand.playerId
    }
    
    const rank = gameState.winningHand.rank
    if (rank === 'Pair' || rank === 'Two Pair' || rank === 'Three of a Kind') {
      const winningPlayerHand = playerHands[gameState.winningHand.playerId]
      if (!winningPlayerHand) return false
      
      return winningPlayerHand.some(playerCard => 
        playerCard.rank === card.rank
      )
    }
    
    return true
  }

  const renderPlayerHand = (playerId: number) => {
    const hand = playerHands[playerId]
    if (!hand) return null

    const isAI = playerId === 1
    const shouldReveal = gameState?.stage === 'showdown' || !isAI

    return (
      <div className="relative">
        <div className="absolute flex gap-2 transform-style-3d translate-z-4">
          {hand.map((card, i) => (
            <Card 
              key={i}
              card={card}
              hidden={!shouldReveal}
              isHighlighted={shouldReveal && isWinningCard(card, i, true, playerId)}
              className="shadow-xl transform hover:translate-z-4 hover:rotate-y-5"
            />
          ))}
        </div>
        
        {/* Winning hand indicator */}
        {gameState?.stage === 'showdown' && gameState?.winningHand?.playerId === playerId && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                        bg-green-600/90 text-white px-3 py-1 rounded-full text-sm
                        shadow-lg transform-gpu animate-bounce">
            {gameState.winningHand.rank}
          </div>
        )}
      </div>
    )
  }

  const renderCommunityCards = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  flex gap-3 transform-style-3d translate-z-4
                  w-fit mx-auto">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className={`
            transform-style-3d transition-all duration-300
            ${communityCards[i] 
              ? 'translate-z-2 translate-y-0 opacity-100 rotate-y-0' 
              : 'translate-z-0 translate-y-4 opacity-0 rotate-y-180'}
          `}
        >
          <Card 
            card={communityCards[i]} 
            hidden={!communityCards[i]}
            isHighlighted={communityCards[i] && isWinningCard(communityCards[i], i, false)}
            className="shadow-xl transform hover:translate-z-4 hover:rotate-y-5"
          />
        </div>
      ))}
    </div>
  )

  if (!gameState) return null

  return (
    <div className="relative w-full max-w-[1000px] aspect-[2/1] perspective-[1000px]">
      {/* Pot Display */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-slate-800/90 px-4 py-2 rounded-full text-white font-bold shadow-lg">
          Pot: ${gameState.pot}
        </div>
      </div>

      <div className="relative w-full h-full transform-style-3d rotate-x-12">
        {/* Outer table border/shadow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a472a] to-[#0f2b19] rounded-[50%] shadow-2xl">
          {/* Table edge with 3D effect */}
          <div className="absolute inset-0 rounded-[50%] bg-[#5c3a21] transform-style-3d">
            {/* Edge highlights */}
            <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-[#7d4f2d]/30 to-transparent" />
            
            {/* Inner felt with depth */}
            <div className="absolute inset-[20px] bg-gradient-to-br from-[#35654d] to-[#2a5c3f] rounded-[50%] transform translate-z-[-10px]">
              {/* Felt texture */}
              <div className="absolute inset-0 felt-texture rounded-[50%] mix-blend-overlay" />
              
              {/* Inner shadow for depth */}
              <div className="absolute inset-0 rounded-[50%] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />
              
              {/* Player positions with hands */}
              <div className="absolute inset-0">
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className={`
                      absolute w-14 h-14
                      ${getPositionClasses(index)}
                    `}
                  >
                    {renderPlayerHand(index)}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 
                                  bg-slate-800/90 px-3 py-1 rounded-full text-white text-sm">
                      ${players[index]?.chips || 0}
                    </div>
                  </div>
                ))}
                
                {renderCommunityCards()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getPositionClasses(index: number): string {
  const positions = {
    0: 'bottom-[5%] right-1/4',
    1: 'top-[5%] left-1/4',
    2: 'top-[5%] right-1/4',
    3: 'top-1/2 -translate-y-1/2 left-[5%]',
    4: 'top-1/2 -translate-y-1/2 right-[5%]',
    5: 'bottom-[5%] left-1/4'
  }
  return positions[index as keyof typeof positions] || ''
}
