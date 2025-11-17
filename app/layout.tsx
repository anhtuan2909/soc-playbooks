import type { Metadata } from "next";
import "./globals.css";
import { GeminiChatWidget } from "@/app/components/GeminiChatWidget"; // 1. IMPORT

export const metadata: Metadata = {
  title: "SOC Playbook Portal | Dashboard",
  description: "Internal Security Operations Center Knowledge Base and Playbook Repository",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-200">
        {children}
        <GeminiChatWidget /> {/* 2. ĐẶT VÀO ĐÂY (Ngay trước </body>) */}
      </body>
    </html>
  );
}



