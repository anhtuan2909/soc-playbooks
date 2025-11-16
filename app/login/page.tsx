'use client';

import { useState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { AlertCircle, CheckCircle, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Gọi Server Action
      const errorMsg = await authenticate(formData);
      
      // Nếu hàm trả về chuỗi -> Nghĩa là có lỗi (Sai pass/Email)
      if (errorMsg) {
        setErrorMessage(errorMsg);
        setIsPending(false);
      }     																				
	   
    } catch (e) {
      // 💡 MẤU CHỐT Ở ĐÂY:
      // Nếu Server Action thành công, nó sẽ ném ra lỗi "NEXT_REDIRECT".
      // Chúng ta bắt lấy nó và hiển thị thông báo Thành Công.
      
      setSuccessMessage('Đăng nhập thành công! Đang vào hệ thống...');
      
      // Tự động chuyển trang sau 1 giây để người dùng kịp đọc thông báo
      setTimeout(() => {
        window.location.href = "/"; 
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <form
        action={handleSubmit}
        autoComplete="off"
        className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-full max-w-md space-y-6 shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">SOC Portal</h1>
          <p className="text-slate-400 text-sm">Đăng nhập quản trị hệ thống</p>
        </div>

        {/* Thông báo Lỗi (Đỏ) */}
        {errorMessage && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Thông báo Thành công (Xanh) */}
        {successMessage && (
          <div className="bg-green-950/50 border border-green-900 text-green-400 p-3 rounded-lg flex items-center gap-2 text-sm animate-bounce">
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
              autoComplete="off"
              placeholder="Nhập địa chỉ Email"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-600" 
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1 font-medium">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              autoComplete="new-password"
              placeholder="Nhập mật khẩu"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-slate-600" 
            />
          </div>
        </div>

        <button 
          disabled={isPending || !!successMessage}
          className={`w-full p-3 rounded-lg font-bold mt-4 transition flex items-center justify-center gap-2 text-white
            ${successMessage ? 'bg-green-600 cursor-default' : 'bg-blue-600 hover:bg-blue-500'} 
            disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {successMessage ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Đang chuyển hướng...
            </>
          ) : isPending ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Đăng nhập
            </>
          )}
        </button>
      </form>
    </div>
  );
}