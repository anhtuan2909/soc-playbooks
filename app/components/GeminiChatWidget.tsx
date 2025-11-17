'use client';
// --- SỬA LỖI Ở ĐÂY: IMPORT TRỰC TIẾP TỪ GÓI LÕI ---
import { useChat } from '@ai-sdk/react'; 
// --------------------------------------------------

import { askGemini } from '@/app/lib/actions';
import { Bot, Send, Loader2, X as CloseIcon } from 'lucide-react';
import { useState } from 'react';

export function GeminiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    async action({ messages }) {
      const lastMessage = messages[messages.length - 1];
      const content = lastMessage.content;
      return await askGemini(content);
    }
  });

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-500 transition animate-pulse"
        title="Hỏi Trợ lý AI"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col font-sans z-50">
      {/* Header của Widget */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800 rounded-t-xl">
        <h3 className="font-bold text-white flex items-center gap-2"><Bot size={18} /> SOC AI Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <CloseIcon size={20} />
        </button>
      </div>
      
      {/* Khung chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-10">
            Hỏi bất cứ điều gì về 50 Playbook...<br/>
            (VD: Các bước ngăn chặn cho PB-14?)
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span 
              className={`block px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}
              style={{ overflowWrap: 'break-word' }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      
      {/* Khung nhập liệu */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Hỏi AI về playbook..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white outline-none focus:border-blue-500"
        />
        <button disabled={isLoading} className="bg-blue-600 text-white p-2 rounded-lg disabled:bg-slate-600">
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
        </button>
      </form>
    </div>
  );
}