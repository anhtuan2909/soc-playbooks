'use server'

import { prisma } from './db';
import { auth, signOut, signIn } from '@/auth'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';

// --- KHÔNG CẦN IMPORT SDK CỦA GEMINI NỮA ---
// (Vì chúng ta dùng REST API)

// --- PHẦN 1 & 2: PLAYBOOK (Giữ nguyên) ---
export async function getPlaybooks(query: string) {
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
  const session = await auth();
  if (!session || !session.user) return null;
  try {
    return await prisma.playbook.findUnique({ 
        where: { playbookId: id } 
    });
  } catch (error) { return null; }
}

// --- PHẦN 2, 3, 4: CRUD VÀ AUTH (Giữ nguyên) ---
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

// --- PHẦN 5: AI INTEGRATION (Bản REST API - Đã Sửa Lỗi Model Name) ---
export async function askGemini(question: string) {
  'use server';

  if (!process.env.GEMINI_API_KEY) {
    console.error("Vercel Lỗi: Không tìm thấy GEMINI_API_KEY.");
    throw new Error("Lỗi cấu hình: Thiếu API Key.");
  }

  try {
    console.log("AI Action (REST): Bắt đầu xử lý...");
    
    // 1) Tạo embedding bằng API REST
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          "content": {
            "parts": [{ "text": question }]
          }
        })
      }
    );

    if (!embedRes.ok) {
      const errorBody = await embedRes.json();
      console.error("Lỗi khi tạo Embedding:", errorBody);
      throw new Error(`Embedding API Error: ${embedRes.statusText}`);
    }
    
    const embedJson = await embedRes.json();
    const vector = embedJson.embedding?.values;
    if (!vector) throw new Error("Không tạo được embedding từ API response");
    console.log("AI Action (REST): Nhúng câu hỏi thành công.");

    // 2) Chuyển embedding thành vector PG
    const vectorString = `[${vector.join(",")}]`;

    // 3) Lấy context từ PGVector
    console.log("AI Action (REST): Đang tìm kiếm vector DB...");
    const docs: any[] = await prisma.$queryRaw`
      SELECT "content"
      FROM "PlaybookEmbedding"
      ORDER BY "embedding" <-> (${vectorString}::vector)
      LIMIT 3;
    `;
    console.log(`AI Action (REST): Tìm thấy ${docs.length} tài liệu.`);
    const context = docs.map(d => d.content).join("\n---\n");

    // 4) Gọi Gemini generate answer (REST)
    console.log("AI Action (REST): Đang gọi Gemini trả lời...");
    const answerRes = await fetch(
      // --- SỬA LỖI Ở ĐÂY: Đổi "gemini-1.5-pro-latest" thành "gemini-1.5-flash-001" ---
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `
CONTEXT:
${context}

QUESTION:
${question}

TRẢ LỜI BẰNG TIẾNG VIỆT
Nếu không có trong Context, trả lời: "Tôi không tìm thấy thông tin này trong Playbook."
            `}] }
          ]
        })
      }
    );

    if (!answerRes.ok) {
      const errorBody = await answerRes.json();
      console.error("Lỗi khi Generate Content:", errorBody);
      throw new Error(`Generate Content API Error: ${answerRes.statusText}`);
    }

    const answerJson = await answerRes.json();
    const text = answerJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Không nhận được nội dung trả lời từ AI.");
    
    console.log("AI Action (REST): Gemini trả lời thành công.");
    return text;

  } catch (err) {
    console.error("LỖI TẠI HÀM ASK_GEMINI (REST):", err);
    throw new Error("Server Error: " + (err as Error).message);
  }
}