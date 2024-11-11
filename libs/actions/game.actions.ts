'use server'

import { Card, generateDeck, dealCards } from './deck.actions'
import { Player, GameState } from '@/types/game.types'

const SUITS = [
  ['♠', 'Spades'],
  ['♣', 'Clubs'],
  ['♥', 'Hearts'],
  ['♦', 'Diamonds']
] as const

export async function initializeGame(): Promise<GameState> {
  const deck = await generateDeck()
  const { hands, remainingDeck } = await dealCards(2, deck)
  
  const players: Player[] = hands.map((hand, index) => ({
    id: index,
    isHuman: index === 0,
    hand,
    chips: 1000,
    hasFolded: false,
    timeoutAt: index === 0 ? Date.now() + 30000 : null
  }))
  
  const smallBlind = 10
  const bigBlind = 20
  const dealer = 0
  
  players[0].chips -= smallBlind
  players[1].chips -= bigBlind
  
  return {
    players,
    communityCards: [],
    pot: smallBlind + bigBlind,
    currentBet: bigBlind,
    deck: remainingDeck,
    stage: 'preflop' as const,
    dealer,
    smallBlind,
    bigBlind,
    currentPlayer: 0,
    lastRaisePlayer: 1,
    roundBets: {
      0: smallBlind,
      1: bigBlind
    },
    lastAction: 'Game started. Blinds posted.',
    bettingRoundComplete: false
  }
}

export async function handleTimeout(gameState: GameState): Promise<GameState> {
  const newState = { ...gameState }
  const humanPlayer = newState.players[0]
  
  if (!humanPlayer.hasFolded) {
    const playerBet = newState.roundBets[0] || 0
    const toCall = newState.currentBet - playerBet
    const callAmount = Math.min(toCall, humanPlayer.chips)
    
    newState.pot += callAmount
    newState.roundBets[0] = (newState.roundBets[0] || 0) + callAmount
    humanPlayer.chips -= callAmount
    newState.lastAction = 'Player timed out - Auto-called'
  }
  
  newState.currentPlayer = 1
  return newState
}

export async function isRoundComplete(gameState: GameState): Promise<boolean> {
  const activePlayers = gameState.players.filter(p => !p.hasFolded)
  
  // If only one player remains, round is complete
  if (activePlayers.length === 1) return true
  
  // Check if all active players have matched the current bet
  const allMatched = activePlayers.every(player => {
    const playerBet = gameState.roundBets[player.id] || 0
    return playerBet === gameState.currentBet || player.hasFolded
  })

  // Round is complete if everyone has matched and we're back to the first player
  return allMatched && gameState.currentPlayer === 0
}

export async function aiAction(gameState: GameState): Promise<GameState> {
  const newState = { ...gameState }
  const aiPlayer = newState.players[1]
  const playerBet = newState.roundBets[1] || 0
  const toCall = newState.currentBet - playerBet

  await new Promise(resolve => setTimeout(resolve, 500))

  const handStrength = Math.random()
  let message = ''

  if (handStrength > 0.7 && newState.lastRaisePlayer !== 1) {
    // Raise
    const raiseAmount = Math.min(
      newState.currentBet * 2,
      aiPlayer.chips
    )
    newState.pot += raiseAmount - playerBet
    newState.currentBet = raiseAmount
    newState.roundBets[1] = raiseAmount
    aiPlayer.chips -= (raiseAmount - playerBet)
    newState.lastRaisePlayer = 1
    message = `AI raised to $${raiseAmount}`
  } else if (handStrength > 0.3) {
    // Call
    const callAmount = Math.min(toCall, aiPlayer.chips)
    newState.pot += callAmount
    newState.roundBets[1] = (newState.roundBets[1] || 0) + callAmount
    aiPlayer.chips -= callAmount
    message = toCall === 0 ? 'AI checked' : `AI called $${callAmount}`
  } else {
    // Fold
    aiPlayer.hasFolded = true
    message = 'AI folded'
  }

  newState.lastAction = message
  newState.currentPlayer = 0
  return newState
}

export async function progressGame(gameState: GameState): Promise<GameState> {
  const newState = { ...gameState }
  
  // Check for fold win condition first
  if (newState.players.some(p => p.hasFolded)) {
    const winner = newState.players[0].hasFolded ? 1 : 0
    newState.stage = 'showdown'
    newState.players[winner].chips += newState.pot
    newState.winningHand = {
      playerId: winner,
      rank: 'Win by fold'
    }
    newState.lastAction = `${winner === 0 ? 'Player' : 'AI'} wins $${newState.pot} (opponent folded)`
    newState.gameOver = true
    newState.pot = 0
    return newState
  }

  // Reset betting for new round
  newState.currentBet = 0
  newState.roundBets = {}
  newState.lastRaisePlayer = null
  newState.currentPlayer = 0
  
  switch (gameState.stage) {
    case 'preflop':
      newState.communityCards = newState.deck.splice(0, 3)
      newState.stage = 'flop'
      newState.lastAction = 'Dealing the flop'
      break
      
    case 'flop':
      newState.communityCards = [...newState.communityCards, newState.deck.splice(0, 1)[0]]
      newState.stage = 'turn'
      newState.lastAction = 'Dealing the turn'
      break
      
    case 'turn':
      newState.communityCards = [...newState.communityCards, newState.deck.splice(0, 1)[0]]
      newState.stage = 'river'
      newState.lastAction = 'Dealing the river'
      break
      
    case 'river':
      newState.stage = 'showdown'
      const { winnerId, rank } = await determineWinner(newState.players, newState.communityCards)
      newState.players[winnerId].chips += newState.pot
      newState.winningHand = {
        playerId: winnerId,
        rank: rank
      }
      newState.lastAction = `${winnerId === 0 ? 'Player' : 'AI'} wins $${newState.pot} with ${rank}!`
      newState.gameOver = true
      newState.pot = 0
      break
  }
  
  return newState
}

function determineRank(score: number): HandRank {
  if (score >= 0.9) return 'Royal Flush'
  if (score >= 0.8) return 'Flush'
  if (score >= 0.7) return 'Straight'
  if (score >= 0.6) return 'Pair'
  if (score >= 0.5) return 'Three of a Kind'
  if (score >= 0.4) return 'Two Pair'
  return 'High Card'
}

async function determineWinner(players: Player[], communityCards: Card[]): Promise<{winnerId: number, rank: HandRank}> {
  let bestScore = -1
  let winnerId = 0
  let winningRank: HandRank = 'High Card'
  
  players.forEach((player, id) => {
    if (!player.hasFolded) {
      const evaluation = evaluateHand(player.hand, communityCards)
      if (evaluation > bestScore) {
        bestScore = evaluation
        winnerId = id
      }
    }
  })
  
  return { winnerId, rank: determineRank(bestScore) }
}

function evaluateHand(hand: Card[], communityCards: Card[]): number {
  const allCards = [...hand, ...communityCards]
  
  // Simple evaluation for now - can be expanded for more accurate poker hand rankings
  const hasPair = allCards.some((card1, i) => 
    allCards.some((card2, j) => i !== j && card1.rank === card2.rank)
  )
  
  const hasFlush = allCards.length >= 5 && SUITS.some(([suitSymbol]) => 
    allCards.filter(card => card.suit === suitSymbol).length >= 5
  )
  
  const hasThreeOfAKind = allCards.some((card1, i) => 
    allCards.filter((card2, j) => i !== j && card1.rank === card2.rank).length >= 2
  )
  
  const hasTwoPair = (() => {
    let pairs = 0
    const seenRanks = new Set()
    
    allCards.forEach((card1, i) => {
      if (!seenRanks.has(card1.rank)) {
        const hasPair = allCards.some((card2, j) => i !== j && card1.rank === card2.rank)
        if (hasPair) {
          pairs++
          seenRanks.add(card1.rank)
        }
      }
    })
    
    return pairs >= 2
  })()
  
  if (hasFlush) return 0.8
  if (hasThreeOfAKind) return 0.5
  if (hasTwoPair) return 0.4
  if (hasPair) return 0.6
  return 0.3
}

export async function canPlayerRaise(gameState: GameState): Promise<boolean> {
  const humanPlayer = gameState.players[0]
  const playerBet = gameState.roundBets[0] || 0
  const toCall = gameState.currentBet - playerBet
  return toCall > 0 && humanPlayer.chips > toCall
}

export type HandRank = 
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'Pair'
  | 'High Card'

export interface HandEvaluation {
  rank: HandRank
  score: number
}

