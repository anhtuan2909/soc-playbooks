import { getPlaybooks } from './lib/actions';
import DashboardClient from './components/DashboardClient';

// Tắt cache để luôn lấy dữ liệu mới nhất từ Database
export const revalidate = 0; 

export default async function Home() {
  // Bước 1: Lấy TOÀN BỘ danh sách từ Database
  // Truyền chuỗi rỗng '' để hàm getPlaybooks trả về tất cả
  const allPlaybooks = await getPlaybooks('');

  // Bước 2: Đẩy toàn bộ dữ liệu sang DashboardClient để hiển thị và lọc
  return <DashboardClient initialPlaybooks={allPlaybooks} />;
}