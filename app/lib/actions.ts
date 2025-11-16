'use server'

// Import biến prisma từ file db.ts
import { prisma } from './db'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getPlaybooks(query: string) {
  try {
    const playbooks = await prisma.playbook.findMany({
      where: {
        OR: [
          // Tìm theo Tiêu đề
          { title: { contains: query, mode: 'insensitive' } },
          // Tìm theo ID (PB-01)
          { playbookId: { contains: query, mode: 'insensitive' } },
          // Tìm theo Kịch bản (Scenario)
          { scenario: { contains: query, mode: 'insensitive' } },
          // Tìm theo Nhóm (Category)
          { category: { contains: query, mode: 'insensitive' } },
          
          // --- MỚI THÊM: Tìm theo MITRE ATT&CK (T1528...) ---
          { mitre: { contains: query, mode: 'insensitive' } },
          
          // --- MỚI THÊM: Tìm theo Nguồn phát hiện (SIEM, EDR...) ---
          { detection: { contains: query, mode: 'insensitive' } }
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

																		 
  revalidatePath(`/playbook/${id}`);
  revalidatePath('/');
  
											
  redirect(`/playbook/${id}`);
}

export async function createPlaybook(formData: FormData) {
									 
  const phasesRaw = formData.get('phases') as string;
  let phasesData = [];
  try {
    phasesData = JSON.parse(phasesRaw);
  } catch (e) {
    throw new Error("Lỗi định dạng JSON ở phần Phases");
  }

  try {
    await prisma.playbook.create({
      data: {
        playbookId: formData.get('playbookId') as string,
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
    console.error("Create Error:", error);
    throw new Error("Failed to create playbook. ID might already exist.");
  }

  revalidatePath('/');
  redirect('/');
}