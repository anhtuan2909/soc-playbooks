'use server'

import { prisma } from './db';
import { auth, signOut, signIn } from '@/auth'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
// --- TÍCH HỢP AI (RAG) ---
import { GoogleGenerativeAI } from '@google/generative-ai';

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

// --- PHẦN 5: AI INTEGRATION (Bản có Log lỗi chi tiết) ---
import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo 1 lần
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function askGemini(question: string) {
  'use server'; 

  // 1. Kiểm tra Key ngay lập tức
  if (!process.env.GEMINI_API_KEY) {
    console.error("Vercel Lỗi: Không tìm thấy GEMINI_API_KEY.");
    throw new Error("Lỗi cấu hình: Thiếu API Key.");
  }

  try {
    console.log("AI Action: Bắt đầu xử lý câu hỏi...");
    // 2. Khởi tạo model
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Nhúng câu hỏi
    console.log("AI Action: Đang nhúng câu hỏi...");
    const questionEmbedding = (await embedModel.embedContent(question)).embedding.values;
    const vectorString = `[${questionEmbedding.join(',')}]`;
    console.log("AI Action: Nhúng câu hỏi thành công.");

    // 4. Tìm kiếm Database
    console.log("AI Action: Đang tìm kiếm vector...");
    const relevantDocs: any[] = await prisma.$queryRaw`
      SELECT "content"
      FROM "PlaybookEmbedding"
      ORDER BY "embedding" <-> (${vectorString}::vector)
      LIMIT 3; 
    `;
    console.log(`AI Action: Tìm thấy ${relevantDocs.length} tài liệu liên quan.`);
    
    const context = relevantDocs.map(doc => doc.content).join("\n\n---\n\n");

    // 5. Tạo Prompt
    const prompt = `
      CONTEXT: ${context}
      QUESTION: ${question}
      INSTRUCTION: Dựa CHỈ vào Context, trả lời câu hỏi bằng Tiếng Việt. Nếu không tìm thấy, nói "Tôi không tìm thấy thông tin này trong Playbook."
    `;

    // 6. Gọi Gemini trả lời
    console.log("AI Action: Đang gọi Gemini...");
    const result = await chatModel.generateContent(prompt);
    console.log("AI Action: Gemini trả lời thành công.");
    return result.response.text();

  } catch (error) {
    // 7. GHI LẠI LỖI CHI TIẾT (Đây là mấu chốt)
    console.error("LỖI TẠI HÀM ASK_GEMINI:", error); 
    
    // Ném lỗi này ra Giao diện
    throw new Error("Lỗi Server: " + (error as Error).message);
  }
}