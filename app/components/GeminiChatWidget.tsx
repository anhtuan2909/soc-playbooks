'use client';

// KHÔNG DÙNG useChat nữa
import { askGemini } from '@/app/lib/actions';
import { Bot, Send, Loader2, X as CloseIcon } from 'lucide-react';
import { useState } from 'react'; // Chỉ dùng React cơ bản

// Định nghĩa kiểu dữ liệu cho tin nhắn
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function GeminiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // --- LOGIC CHAT MỚI (Không dùng useChat) ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Viết hàm Submit thủ công
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || isLoading) return;

    const userMessageContent = input;
    
    // Xóa ô input
    setInput('');
    // Bật loading
    setIsLoading(true);

    // Thêm tin nhắn của User vào danh sách chat ngay lập tức
    setMessages(prevMessages => [
      ...prevMessages,
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
    } finally {
      // Tắt loading
      setIsLoading(false);
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