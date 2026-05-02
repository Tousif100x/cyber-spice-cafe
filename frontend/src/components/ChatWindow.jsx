import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, MessageCircle, X } from 'lucide-react';

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! What can I do for you today? Welcome to The Cyber Spice Cafe!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat`, {
        messages: newMessages.map(m => ({ role: m.role, content: m.content }))
      });
      
      const botMessage = {
        role: 'assistant',
        content: response.data.content
      };
      
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { role: 'assistant', content: '⚠️ Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gradient-to-br from-[#df466a] via-[#753a6e] to-[#2c224b] p-4">
      {/* Centered Chat Card (Max width 420px) */}
      <div className="w-full max-w-[400px] h-[80vh] min-h-[500px] max-h-[800px] bg-[#f8f9fb] rounded-[24px] shadow-2xl flex flex-col overflow-hidden border-2 border-white/10">
        
        {/* 1. HEADER (Fixed at top) */}
        <div className="bg-[#9B2677] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full p-2 relative shadow-sm">
              <MessageCircle className="h-5 w-5 text-[#9B2677] fill-current" />
            </div>
            <span className="font-semibold text-lg tracking-wide">Cyber Spice Cafe</span>
          </div>
          <button className="p-1 hover:bg-white/20 rounded-full transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. MESSAGE AREA (Scrollable, Flex-1) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-xs text-gray-400 mb-6 font-medium uppercase tracking-wider">Today</div>
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-opacity duration-300
                ${msg.role === 'user' 
                  ? 'bg-[#9B2677] text-white rounded-[20px] rounded-tr-[4px]' // User: Solid Purple on Right
                  : 'bg-white text-gray-800 rounded-[20px] rounded-tl-[4px] border border-gray-100' // Bot: Light on Left
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i !== msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex w-full justify-start">
              <div className="bg-white px-5 py-4 rounded-[20px] rounded-tl-[4px] border border-gray-100 shadow-sm flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. INPUT AREA (Fixed at bottom) */}
        <div className="bg-white p-4 shrink-0 border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type..."
              disabled={isLoading}
              className="flex-1 bg-[#f3f4f6] text-gray-800 border-none rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#9B2677] text-sm placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#9B2677] text-white rounded-full h-11 w-11 flex items-center justify-center hover:bg-[#831e64] transition-colors disabled:opacity-50 disabled:hover:bg-[#9B2677] shrink-0 shadow-md"
            >
              <Send className="h-5 w-5 ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
