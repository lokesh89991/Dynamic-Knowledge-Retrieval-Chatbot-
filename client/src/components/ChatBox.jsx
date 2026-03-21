import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, Sparkles } from 'lucide-react';
import Message from './Message';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ChatBox = ({ sessionId }) => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hello! I am your RAG AI Assistant. Upload documents on the left, and ask me specific questions about their content!',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ask`, { question: userMessage.content, sessionId });
      setMessages((prev) => [...prev, { 
        role: 'bot', 
        content: response.data.answer,
        sources: response.data.sources
      }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Oops! I encountered an error. Make sure the server is running.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center gap-2.5 backdrop-blur-md">
        <Sparkles size={20} className="text-violet-400" />
        <h2 className="font-semibold text-gray-200">Chat Session</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} sources={msg.sources} />
        ))}
        {loading && (
          <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
              <Sparkles size={16} className="text-indigo-300 animate-pulse" />
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-sm inline-block shadow-md w-16">
              <div className="flex space-x-1.5 justify-center mt-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <div className="p-4 md:p-6 bg-black/10 border-t border-white/10 backdrop-blur-xl">
        <div className="relative max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message RAG AI..."
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-gray-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300 shadow-inner hover:border-white/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2.5 p-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:opacity-90 disabled:from-white/10 disabled:to-white/10 disabled:text-gray-500 disabled:border-white/5 border border-transparent text-white rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none focus:outline-none flex items-center justify-center h-11 w-11"
            >
              <Send size={18} className={input.trim() && !loading ? "translate-x-0.5" : ""} />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 font-medium tracking-wide">Retrieval-Augmented Generation matches your question to document sentences.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
