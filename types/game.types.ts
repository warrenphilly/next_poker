import { Card } from '@/libs/actions/deck.actions'

export type Stage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export type Player = {
  id: number
  isHuman: boolean
  hand: Card[]
  chips: number
  hasFolded: boolean
  timeoutAt: number | null
}

export interface GameState {
  players: Player[]
  communityCards: Card[]
  pot: number
  currentBet: number
  deck: Card[]
  stage: Stage
  dealer: number
  smallBlind: number
  bigBlind: number
  currentPlayer: number
  lastRaisePlayer: number | null
  roundBets: { [playerId: number]: number }
  lastAction: string
  bettingRoundComplete: boolean
  gameOver?: boolean
  winningHand?: {
    playerId: number
    rank: string
  }
}

export type ChatMessage = {
  text: string
  timestamp: Date
}
