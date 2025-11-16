import { auth } from '@/auth'; 
import { getPlaybooks } from '@/app/lib/actions'; // <-- Đã sửa đường dẫn chuẩn
import DashboardClient from './components/DashboardClient';

export const revalidate = 0; 

export default async function Home() {
  // 1. Lấy thông tin người dùng hiện tại
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'VIEWER'; 

  // 2. Lấy TOÀN BỘ danh sách Playbook
  const allPlaybooks = await getPlaybooks('');

  // 3. Truyền dữ liệu và quyền xuống component Client
  return (
    <DashboardClient 
      initialPlaybooks={allPlaybooks} 
      userRole={userRole} 
    />
  );
}