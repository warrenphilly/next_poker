interface GameOverProps {
  winner: string
  amount: number
  onRestart: () => void
}

export default function GameOver({ winner, amount, onRestart }: GameOverProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-lg text-white text-center">
        <h2 className="text-2xl font-bold mb-4">{winner} wins ${amount}!</h2>
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Play Again
        </button>
      </div>
    </div>
  )
} 