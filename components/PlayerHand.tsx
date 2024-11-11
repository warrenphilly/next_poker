import { Card as CardType } from '@/libs/actions/deck.actions'
import Card from './Card'

interface PlayerHandProps {
  cards: CardType[]
  chips: number
}

export default function PlayerHand({ cards, chips }: PlayerHandProps) {
  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
      <div className="flex gap-3 transform hover:translate-y-[-8px] transition-transform">
        {cards.map((card, i) => (
          <div key={i} className="transform hover:rotate-2 transition-transform">
            <Card card={card} className="hover:shadow-xl" />
          </div>
        ))}
      </div>
      <div className="bg-slate-800/90 px-6 py-2 rounded-full text-white text-center shadow-lg">
        <p className="font-medium">Your Chips: <span className="text-green-400 font-bold">${chips}</span></p>
      </div>
    </div>
  )
}
