interface ChatMessage {
  text: string
  timestamp: Date
}

interface ChatLogProps {
  messages: ChatMessage[]
}

export default function ChatLog({ messages }: ChatLogProps) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 w-64 h-96 bg-slate-800/90 rounded-lg p-4 overflow-hidden">
      <h3 className="text-white font-bold mb-2">Game Log</h3>
      <div className="overflow-y-auto h-full">
        {messages.map((msg, i) => (
          <div key={i} className="text-white/80 text-sm mb-2">
            <span className="text-xs text-white/50">
              {msg.timestamp.toLocaleTimeString()} -{' '}
            </span>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  )
} 