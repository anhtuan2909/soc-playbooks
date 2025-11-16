import { auth } from '@/auth'; 
import { getPlaybooks } from '@/app/lib/actions';
import DashboardClient from './components/DashboardClient';

export const revalidate = 0; 

export default async function Home() {
  // 1. Lấy thông tin session
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'VIEWER'; 
  const userEmail = session?.user?.email || null; // <--- Lấy thêm Email

  // 2. Lấy dữ liệu
  const allPlaybooks = await getPlaybooks('');

  // 3. Truyền xuống Client
  return (
    <DashboardClient 
      initialPlaybooks={allPlaybooks} 
      userRole={userRole}
      userEmail={userEmail} // <--- Truyền Email xuống
    />
  );
}