import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === 'ai';

  const bubbleClasses = isAI
    ? 'bg-gray-700 text-gray-100 self-start'
    : 'bg-purple-600 text-white self-end';

  // Splitting by spaces and newlines to animate words.
  // The regex `(\s+)` captures spaces and newlines so they are preserved in the output array.
  const wordsAndSpaces = message.text.split(/(\s+)/);

  return (
    <div className={`w-full flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}>
        {isAI ? (
          <p className="text-base break-words whitespace-pre-wrap animate-text-generation">
            {wordsAndSpaces.map((chunk, index) => (
              <span
                key={index}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {chunk}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-base break-words whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
