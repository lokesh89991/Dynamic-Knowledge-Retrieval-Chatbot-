import { useState } from 'react';
import ChatBox from './components/ChatBox';
import UploadBox from './components/UploadBox';
import { Bot, PlusCircle } from 'lucide-react';

function App() {
  const [sessionId, setSessionId] = useState(Date.now().toString());

  const startNewChat = () => {
    setSessionId(Date.now().toString());
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#0B0F19] to-[#111827] text-gray-200">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl px-6 py-4 fixed top-0 w-full z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Bot size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-gray-100">
            RAG<span className="text-indigo-400">AI</span>
          </h1>
        </div>
        
        <button 
          onClick={startNewChat}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 rounded-lg text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
        >
          <PlusCircle size={16} className="text-indigo-400" />
          New Chat
        </button>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full pt-28 px-6 pb-6 gap-6 overflow-hidden">
        {/* Left Sidebar: Document Upload */}
        <div className="w-full md:w-1/3 flex flex-col h-full shrink-0">
          <UploadBox sessionId={sessionId} />
        </div>

        {/* Right Section: Chat Interface */}
        <div className="flex-1 overflow-hidden h-full">
          <ChatBox key={sessionId} sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}

export default App;
