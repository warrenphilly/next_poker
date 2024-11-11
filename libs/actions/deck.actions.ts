'use server'

// Move types to a separate types file (create new file: types/deck.types.ts)
export type SuitSymbol = '♠' | '♣' | '♥' | '♦'
export type SuitName = 'Spades' | 'Clubs' | 'Hearts' | 'Diamonds'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export type Card = {
  suit: SuitSymbol
  suitName: SuitName
  rank: Rank
  value: number
}

// Move constants to a separate constants file (create new file: constants/deck.constants.ts)
const SUITS: [SuitSymbol, SuitName][] = [
  ['♠', 'Spades'],
  ['♣', 'Clubs'],
  ['♥', 'Hearts'],
  ['♦', 'Diamonds']
]

const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function getValue(rank: Rank): number {
  switch (rank) {
    case 'A': return 14
    case 'K': return 13
    case 'Q': return 12
    case 'J': return 11
    default: return parseInt(rank)
  }
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function generateDeck(): Promise<Card[]> {
  const deck: Card[] = []
  
  for (const [symbol, name] of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit: symbol,
        suitName: name,
        rank,
        value: getValue(rank)
      })
    }
  }
  
  console.log('Initial deck created:', deck)
  const shuffled = shuffleDeck(deck)
  console.log('Deck after shuffle:', shuffled)
  return shuffled
}

export async function dealCards(numPlayers: number, deck: Card[]): Promise<{ hands: Card[][], remainingDeck: Card[] }> {
  const hands: Card[][] = Array(numPlayers).fill([]).map(() => [])
  const remainingDeck = [...deck]
  
  // Deal 2 cards to each player, one at a time
  for (let round = 0; round < 2; round++) {
    for (let player = 0; player < numPlayers; player++) {
      const card = remainingDeck.pop()
      if (card) {
        hands[player] = [...hands[player], card]
        console.log(`Dealt ${card.rank}${card.suit} to player ${player + 1}. Remaining cards:`, remainingDeck.length)
      }
    }
  }
  
  return { hands, remainingDeck }
}

// Export an async function to get suits for use in other server components
export async function getSuits(): Promise<[SuitSymbol, SuitName][]> {
  return SUITS
}
