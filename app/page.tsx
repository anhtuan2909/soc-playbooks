import { auth } from '@/auth'; 
import { getPlaybooks } from '@/app/lib/actions';
import DashboardClient from './components/DashboardClient';
import { redirect } from 'next/navigation'; // <--- Import quan trọng

export const revalidate = 0; 

export default async function Home() {
  // 1. Kiểm tra danh tính
  const session = await auth();
  
  // ⛔ CHẶN CỬA: Nếu chưa đăng nhập -> Về trang Login
  if (!session || !session.user) {
    redirect('/login');
  }

  // 2. Lấy quyền và email (để hiển thị)
  const userRole = (session.user as any).role || 'VIEWER'; 
  const userEmail = session.user.email || null;

  // 3. Lấy dữ liệu (Lúc này đã an toàn)
  const allPlaybooks = await getPlaybooks('');

  return (
    <DashboardClient 
      initialPlaybooks={allPlaybooks} 
      userRole={userRole}
      userEmail={userEmail}
    />
  );
}