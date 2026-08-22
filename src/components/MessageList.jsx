import AnswerCard from './AnswerCard';

export default function MessageList({ messages, onSend }) {
  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => {
        // If message has a `data` field (structured answer), render AnswerCard
        if (msg.data) {
          return (
            <div key={idx} className="flex justify-start">
              <AnswerCard data={msg.data} onSend={onSend} />
            </div>
          );
        }
        // Otherwise render as plain text (user or assistant)
        return (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-[#161616] text-white'
                  : 'bg-[#0A0A0A] border border-[#232323] text-[#F2F2F0]'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}