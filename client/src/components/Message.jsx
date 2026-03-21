import ReactMarkdown from 'react-markdown';
import { User, Sparkles } from 'lucide-react';

const Message = ({ role, content, sources }) => {
  const isBot = role === 'bot';

  return (
    <div className={`group flex items-start gap-4 w-full ${!isBot ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border transition-transform duration-300 group-hover:scale-105 ${
        isBot 
          ? 'bg-white/10 border-white/20 text-indigo-300' 
          : 'bg-gradient-to-r from-purple-500 to-indigo-500 border-indigo-400/30 text-white'
      }`}>
        {isBot ? <Sparkles size={18} /> : <User size={18} />}
      </div>
      
      <div className={`flex flex-col ${!isBot ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className={`px-5 py-3.5 text-[15px] leading-relaxed transition-all duration-300 ease-in-out hover:-translate-y-0.5 ${
          isBot 
            ? 'bg-white/5 border border-white/10 text-gray-200 rounded-2xl rounded-tl-sm shadow-xl backdrop-blur-md' 
            : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl rounded-tr-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]'
        }`}>
          <div className={`prose prose-sm max-w-none 
                        prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/10
                        prose-li:marker:text-indigo-400 prose-a:text-indigo-400
                        prose-headings:font-semibold ${isBot ? 'prose-invert prose-headings:text-gray-100' : 'prose-headings:text-white'}
                        prose-strong:font-semibold ${isBot ? 'prose-strong:text-indigo-300' : 'prose-strong:text-white'}
                        ${!isBot && 'text-white'}`}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          
          {isBot && sources && sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-400">
              <details className="group cursor-pointer">
                <summary className="font-medium text-gray-400 list-none flex items-center gap-1.5 hover:text-indigo-300 transition-colors">
                  <svg className="w-3.5 h-3.5 transition-transform duration-300 group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  View Retrieved Sources ({sources.length})
                </summary>
                <div className="mt-3 space-y-2">
                  {sources.map((source, idx) => (
                    <div key={idx} className="p-2.5 bg-black/20 backdrop-blur-md rounded-xl border border-white/5 text-gray-400 break-words leading-snug">
                       {source}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
