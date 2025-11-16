'use server'
import { prisma } from './db';
import { auth, signOut } from '@/auth'; // <--- Gộp chung vào 1 dòng duy nhất
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- PHẦN 1: PLAYBOOK (Đã bảo mật) ---

export async function getPlaybooks(query: string) {
  try {
    return await prisma.playbook.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { playbookId: { contains: query, mode: 'insensitive' } },
          { scenario: { contains: query, mode: 'insensitive' } },
          { mitre: { contains: query, mode: 'insensitive' } },
          { detection: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { playbookId: 'asc' }
    });
  } catch (error) { return []; }
}

export async function getPlaybookById(id: string) {
  return await prisma.playbook.findUnique({ where: { playbookId: id } });
}

export async function createPlaybook(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error("Access Denied");

  const phasesRaw = formData.get('phases') as string;
  await prisma.playbook.create({
    data: {
      playbookId: formData.get('playbookId') as string,
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      severity: formData.get('severity') as string,
      scenario: formData.get('scenario') as string,
      detection: formData.get('detection') as string,
      mitre: formData.get('mitre') as string,
      phases: JSON.parse(phasesRaw),
    }
  });
  revalidatePath('/');
  redirect('/');
}

export async function updatePlaybook(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error("Access Denied");

  const id = formData.get('playbookId') as string;
  const phasesRaw = formData.get('phases') as string;

  await prisma.playbook.update({
    where: { playbookId: id },
    data: {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      severity: formData.get('severity') as string,
      scenario: formData.get('scenario') as string,
      detection: formData.get('detection') as string,
      mitre: formData.get('mitre') as string,
      phases: JSON.parse(phasesRaw),
    }
  });
  revalidatePath(`/playbook/${id}`);
  redirect(`/playbook/${id}`);
}

// --- PHẦN 2: USER MANAGEMENT (Mới) ---

export async function getUsers() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return [];

  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return;

  await prisma.user.create({
    data: {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as string,
    }
  });
  revalidatePath('/admin/users');
}

export async function deleteUser(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') return;

  await prisma.user.delete({
    where: { id: parseInt(formData.get('userId') as string) }
  });
  revalidatePath('/admin/users');
}

// --- PHẦN 3: ĐĂNG XUẤT ---
export async function handleSignOut() {
  await signOut();
}