'use client';

import { useState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setErrorMessage('');

    try {
      // Gọi hàm login bên server
      const error = await authenticate(formData);
      
      if (error) {
        setErrorMessage(error);
        setIsPending(false);
      } else {
        // Nếu không có lỗi trả về -> Thành công -> Đang redirect
        // Giữ nguyên trạng thái loading để người dùng biết
      }
    } catch (e) {
      // Lỗi khác
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <form
        action={handleSubmit}
        className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-md space-y-6 shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Đăng nhập vào SOC Portal</p>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {errorMessage && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1 font-medium">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="admin@soc.local"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1 font-medium">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              placeholder="••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            />
          </div>
        </div>

        <button 
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white p-3 rounded-lg font-bold mt-4 transition flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Running checks...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </button>
      </form>
    </div>
  );
}