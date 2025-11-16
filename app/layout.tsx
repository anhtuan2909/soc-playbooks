// app/layout.tsx (Đã sửa cho Final Deploy)
import type { Metadata } from "next";
import "./globals.css"; // Giữ lại import CSS

// metadata đã sửa tiêu đề
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
      </body>
    </html>
  );
}