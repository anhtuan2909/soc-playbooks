'use server'

import { prisma } from './db';
import { auth, signOut, signIn } from '@/auth'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

// --- PHẦN 1: PLAYBOOK (Đọc dữ liệu - Đã thêm khóa bảo mật) ---

export async function getPlaybooks(query: string) {
  // 🛡️ CHỐT CHẶN 1: Phải đăng nhập mới được lấy danh sách
  const session = await auth();
  if (!session || !session.user) return []; 

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
  // 🛡️ CHỐT CHẶN 2: Phải đăng nhập mới xem được chi tiết
  const session = await auth();
  if (!session || !session.user) return null;

  try {
    return await prisma.playbook.findUnique({ 
        where: { playbookId: id } 
    });
  } catch (error) { return null; }
}

// --- PHẦN 2: PLAYBOOK (Ghi dữ liệu - Chỉ Admin) ---

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

// --- PHẦN 3: USER MANAGEMENT (Quản lý nhân sự) ---

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

// --- PHẦN 4: AUTHENTICATION (Xử lý Đăng nhập/Đăng xuất) ---

export async function handleSignOut() {
  await signOut();
}

export async function authenticate(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return '❌ Email hoặc mật khẩu không chính xác.';
        default:
          return '⚠️ Lỗi hệ thống. Vui lòng thử lại.';
      }
    }
    throw error;
  }
}