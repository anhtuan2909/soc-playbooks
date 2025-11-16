'use client';

import { useState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { AlertCircle, CheckCircle, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Thêm trạng thái thành công
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Gọi server action
      const error = await authenticate(formData);
      
      if (error) {
        setErrorMessage(error);
        setIsPending(false);
      } else {
        // Nếu không có lỗi trả về -> Thành công!
        // Hiển thị thông báo xanh và giữ nguyên loading để chuyển trang
        setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      }
    } catch (e) {
      // Lỗi redirect của Next.js là bình thường, không cần xử lý ở đây
      // setIsPending(false); // Không tắt loading để tạo cảm giác mượt
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <form
        action={handleSubmit}
        autoComplete="off" // 1. Tắt gợi ý điền tự động toàn bộ form
        className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-md space-y-6 shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">SOC Portal</h1>
          <p className="text-slate-400 text-sm">Đăng nhập quản trị hệ thống</p>
        </div>

        {/* 2. Thông báo Lỗi (Màu đỏ) */}
        {errorMessage && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3. Thông báo Thành công (Màu xanh) - MỚI */}
        {successMessage && (
          <div className="bg-green-950/50 border border-green-900 text-green-400 p-3 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1 font-medium">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              autoComplete="off" // Tắt gợi ý email
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
              autoComplete="new-password" // Mẹo: Dùng 'new-password' để trình duyệt không tự điền mật khẩu cũ
              placeholder="••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
            />
          </div>
        </div>

        <button 
          disabled={isPending}
          className={`w-full p-3 rounded-lg font-bold mt-4 transition flex items-center justify-center gap-2 text-white
            ${successMessage ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'} 
            disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {isPending ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {successMessage ? 'Redirecting...' : 'Checking...'}
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