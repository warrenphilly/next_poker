import { Card as CardType } from '@/libs/actions/deck.actions'
import React from 'react'

interface CardProps {
  card?: CardType
  hidden?: boolean
  className?: string
  isHighlighted?: boolean
}

export default function Card({ card, hidden = false, className = '', isHighlighted = false }: CardProps) {
  const isRed = card?.suit === '♥' || card?.suit === '♦'
  
  return (
    <div 
      className={`
        relative w-16 h-24 rounded-xl 
        transform transition-all duration-300
        ${hidden 
          ? 'bg-gradient-to-br from-blue-800 to-blue-900 shadow-lg border border-blue-700/30' 
          : 'bg-gradient-to-br from-white to-gray-100 shadow-lg border border-gray-200'
        }
        ${isHighlighted && 'ring-4 ring-yellow-400 ring-opacity-75 scale-110'}
        ${className}
      `}
    >
      {!hidden && card && (
        <>
          {/* Top left rank and suit */}
          <div className={`absolute top-2 left-2 flex flex-col items-center ${isRed ? 'text-red-500' : 'text-gray-800'}`}>
            <div className="text-lg font-bold">{card.rank}</div>
            <div className="text-xl -mt-1">{card.suit}</div>
          </div>
          
          {/* Center suit */}
          <div className={`
            absolute inset-0 
            flex items-center justify-center 
            text-4xl opacity-25 ${isRed ? 'text-red-500' : 'text-gray-800'}
          `}>
            {card.suit}
          </div>
          
          {/* Bottom right rank and suit (inverted) */}
          <div className={`
            absolute bottom-2 right-2 
            flex flex-col items-center
            rotate-180
            ${isRed ? 'text-red-500' : 'text-gray-800'}
          `}>
            <div className="text-lg font-bold">{card.rank}</div>
            <div className="text-xl -mt-1">{card.suit}</div>
          </div>
        </>
      )}
    </div>
  )
}
