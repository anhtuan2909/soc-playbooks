import type { Metadata } from "next";
import "./globals.css";
import { GeminiChatWidget } from "@/app/components/GeminiChatWidget"; //
import { auth } from "@/auth"; //

export const metadata: Metadata = {
  title: "SOC Playbook Portal | Dashboard", // Sửa lỗi "Create Next App"
  description: "Internal Security Operations Center Knowledge Base",
};

// 1. Thêm "async" để cho phép "await"
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 2. Lấy thông tin phiên đăng nhập
  const session = await auth();

  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-200">
        {children}
        
        {/* 3. Logic: Chỉ "vẽ" AI Widget nếu session tồn tại (đã đăng nhập) */}
        {session && <GeminiChatWidget />} 

      </body>
    </html>
  );
}