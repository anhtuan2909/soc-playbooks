'use server'

// Import biến prisma từ file db.ts vừa tạo
import { prisma } from './db'; 

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