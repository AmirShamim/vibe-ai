
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession } from './services/geminiService';
import type { Message } from './types';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import { PaperPlaneIcon, SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on component mount
  useEffect(() => {
    const initChat = () => {
      const chatSession = createChatSession();
      setChat(chatSession);
      setMessages([
        {
          id: 'initial-ai-message',
          sender: 'ai',
          text: "wsg bestie! what's the tea? ✨",
        },
      ]);
    };
    initChat();
  }, []);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !chat) return;

    const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: inputValue };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = inputValue;
    setInputValue('');

    try {
      const stream = await chat.sendMessageStream({ message: currentInput });
      
      let aiResponseText = '';
      let firstChunk = true;
      const aiMessageId = `ai-${Date.now()}`;

      for await (const chunk of stream) {
        aiResponseText += chunk.text;
        if (firstChunk) {
          setIsLoading(false); // Hide typing indicator and show the AI message bubble
          setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: aiResponseText }]);
          firstChunk = false;
        } else {
          // Update the text of the last message (the AI's response)
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg
          ));
        }
      }
      if (firstChunk) { // Handle cases where the stream is empty
          setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: "omg my brain just glitched, lowkey embarrassing. try again? 🤔",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chat, inputValue]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="flex items-center justify-center p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <SparklesIcon className="w-8 h-8 text-pink-400 mr-3"/>
        <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-pink-400 to-purple-500 text-transparent bg-clip-text">
          Vibe Check AI
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="w-full flex justify-start">
               <div className="bg-gray-700 text-gray-100 self-start px-4 py-3 rounded-2xl shadow-md">
                 <TypingIndicator />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 md:p-6 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3 sm:space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Spill the tea..."
              disabled={isLoading || !chat}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || !chat}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full p-3 transition-transform duration-200 ease-in-out active:scale-95 flex items-center justify-center shadow-lg hover:shadow-purple-500/50"
              aria-label="Send message"
            >
              <PaperPlaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default App;
