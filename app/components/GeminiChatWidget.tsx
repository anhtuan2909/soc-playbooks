'use client';
// Import 'useChat' từ gói lõi
import { useChat } from '@ai-sdk/react'; 
import { askGemini } from '@/app/lib/actions';
import { Bot, Send, Loader2, X as CloseIcon } from 'lucide-react';
import { useState } from 'react';

export function GeminiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // --- SỬA LỖI LOGIC TẠI ĐÂY ---

  // 1. Chỉ dùng useChat để lấy danh sách messages, setMessages và isLoading
  const { messages, setMessages, isLoading } = useChat({
    // Bỏ thuộc tính 'action' đi, chúng ta sẽ gọi thủ công
  });

  // 2. Tự quản lý ô input
  const [input, setInput] = useState('');

  // 3. Viết hàm Submit thủ công
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    // Lấy nội dung gõ
    const userMessageContent = input;
    
    // Xóa ô input ngay lập tức
    setInput('');

    // (UX) Thêm tin nhắn của User vào danh sách chat ngay
    setMessages([
      ...messages,
      { id: Date.now().toString(), role: 'user', content: userMessageContent }
    ]);

    // Gọi Server Action (askGemini)
    try {
      const aiResponseContent = await askGemini(userMessageContent);

      // Thêm tin nhắn của AI vào danh sách
      setMessages(prevMessages => [
        ...prevMessages,
        { id: Date.now().toString(), role: 'assistant', content: aiResponseContent }
      ]);
    } catch (error) {
      // Xử lý nếu Server Action bị lỗi
      setMessages(prevMessages => [
        ...prevMessages,
        { id: Date.now().toString(), role: 'assistant', content: 'Lỗi: Không thể kết nối tới AI. Vui lòng thử lại.' }
      ]);
    }
  };
  // --------------------------------

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
      
      {/* Khung chat (Dùng messages từ useChat) */}
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
      
      {/* Khung nhập liệu (Dùng state 'input' và 'setInput' thủ công) */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
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