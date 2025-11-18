'use server'

import { prisma } from './db';
import { auth, signOut, signIn } from '@/auth'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
// Import SDK của Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Khởi tạo AI 1 lần ---
let genAI: GoogleGenerativeAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.error("Vercel Lỗi nghiêm trọng: Biến môi trường GEMINI_API_KEY không được tìm thấy.");
}

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

// --- PHẦN 5: AI INTEGRATION (Bản SDK - Đã Sửa Lỗi Tên Model) ---
export async function askGemini(question: string) {
  'use server'; 

  if (!process.env.GEMINI_API_KEY || !genAI) {
    console.error("Vercel Lỗi: Không tìm thấy GEMINI_API_KEY.");
    throw new Error("Lỗi cấu hình: Thiếu API Key.");
  }

  try {
    console.log("AI Action (SDK): Bắt đầu xử lý...");
    
    // 1. Khởi tạo Model (DÙNG TÊN CHUẨN TỪ JSON CỦA ANH)
    const embedModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
    const chatModel = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" }); // <--- SỬA LỖI Ở ĐÂY

    // 2. Nhúng câu hỏi
    console.log("AI Action (SDK): Đang nhúng câu hỏi...");
    const questionEmbedding = (await embedModel.embedContent(question)).embedding.values;
    const vectorString = `[${questionEmbedding.join(',')}]`;

    // 3. Tìm kiếm Database
    console.log("AI Action (SDK): Đang tìm kiếm vector DB...");
    const relevantDocs: any[] = await prisma.$queryRaw`
      SELECT "content"
      FROM "PlaybookEmbedding"
      ORDER BY "embedding" <-> (${vectorString}::vector)
      LIMIT 3; 
    `;
    const context = relevantDocs.map(doc => doc.content).join("\n\n---\n\n");
    console.log(`AI Action (SDK): Tìm thấy ${relevantDocs.length} tài liệu.`);

    // 4. Tạo Prompt
    const prompt = `
      CONTEXT: ${context}
      QUESTION: ${question}
      INSTRUCTION: Dựa CHỈ vào Context, trả lời câu hỏi bằng Tiếng Việt. Nếu không tìm thấy, nói "Tôi không tìm thấy thông tin này trong Playbook."
    `;

    // 5. Gọi Gemini trả lời
    console.log("AI Action (SDK): Đang gọi Gemini trả lời...");
    const result = await chatModel.generateContent(prompt);
    console.log("AI Action (SDK): Gemini trả lời thành công.");
    return result.response.text();

  } catch (error) {
    console.error("LỖI TẠI HÀM ASK_GEMINI (SDK):", error); 
    throw new Error("Server Error: " + (error as Error).message);
  }
}