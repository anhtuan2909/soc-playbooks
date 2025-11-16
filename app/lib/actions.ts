'use server'

// Import biến prisma từ file db.ts vừa tạo
import { prisma } from './db'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getPlaybooks(query: string) {
  try {
    const playbooks = await prisma.playbook.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { playbookId: { contains: query, mode: 'insensitive' } },
          { scenario: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ]
      },
      orderBy: { playbookId: 'asc' }
    });
    return playbooks;
  } catch (error) {
    console.error("Lỗi lấy danh sách:", error);
    return [];
  }
}

export async function getPlaybookById(id: string) {
  try {
    const playbook = await prisma.playbook.findUnique({
      where: { playbookId: id }
    });
    return playbook;
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    return null;
  }
}
export async function updatePlaybook(formData: FormData) {
  const id = formData.get('playbookId') as string;
  
  // Lấy dữ liệu JSON từ form (Phần quy trình Phases)
  const phasesRaw = formData.get('phases') as string;
  let phasesData = [];
  try {
    phasesData = JSON.parse(phasesRaw);
  } catch (e) {
    throw new Error("Lỗi định dạng JSON ở phần Phases");
  }

  try {
    await prisma.playbook.update({
      where: { playbookId: id },
      data: {
        title: formData.get('title') as string,
        category: formData.get('category') as string,
        severity: formData.get('severity') as string,
        scenario: formData.get('scenario') as string,
        detection: formData.get('detection') as string,
        mitre: formData.get('mitre') as string,
        phases: phasesData,
      }
    });
  } catch (error) {
    console.error("Update Error:", error);
    throw new Error("Failed to update playbook");
  }

  // Xóa cache để Web hiển thị dữ liệu mới ngay lập tức
  revalidatePath(`/playbook/${id}`);
  revalidatePath('/');
  
  // Chuyển hướng về trang chi tiết
  redirect(`/playbook/${id}`);
}