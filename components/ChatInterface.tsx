import React, { useState, useRef, useEffect } from 'react';
import { Theme, ChatMessage } from '../types';
import { getChatSession } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { GenerateContentResponse } from '@google/genai';

interface ChatInterfaceProps {
  theme: Theme;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ theme }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Greetings. I am Ophion. How may I assist in optimizing your timeline today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isStreaming: true
    }]);

    try {
      const chat = getChatSession();
      const streamResult = await chat.sendMessageStream({ message: userMsg.text });
      
      let fullText = '';
      
      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullText += text;
        
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, text: fullText }
            : msg
        ));
      }

      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, text: "I apologize, but I'm having trouble connecting to the neural network right now. Please check your API configuration.", isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen w-full max-w-5xl mx-auto p-4 md:p-8">
       <header className="mb-4">
          <h2 className={`text-3xl font-serif font-bold ${theme.textPrimary}`}>Ophion Chat</h2>
          <p className={theme.textSecondary}>Neural Interface Active.</p>
        </header>

      <div className={`flex-1 overflow-y-auto rounded-2xl border ${theme.borderClass} ${theme.cardClass} p-4 mb-4 no-scrollbar`}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                  ${msg.role === 'user' ? 'bg-gray-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>

                <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user' 
                    ? `${theme.buttonClass} rounded-tr-none` 
                    : `bg-white/10 ${theme.textPrimary} rounded-tl-none border ${theme.borderClass}`
                  }
                `}>
                  {msg.text}
                  {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"/>}
                </div>

              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={`p-2 rounded-xl border ${theme.borderClass} ${theme.cardClass} flex items-center gap-2`}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for guidance, analysis, or just talk..."
          className={`flex-1 bg-transparent border-none outline-none px-4 py-3 ${theme.textPrimary} placeholder-opacity-50 placeholder-gray-400`}
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className={`p-3 rounded-lg transition-all ${theme.buttonClass} disabled:opacity-50`}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
