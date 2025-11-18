'use server'

import { prisma } from './db';
import { auth, signOut, signIn } from '@/auth'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import SDK

// --- Khởi tạo AI 1 lần ---
let genAI: GoogleGenerativeAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.error("Vercel Lỗi nghiêm trọng: Biến môi trường GEMINI_API_KEY không được tìm thấy.");
}

// --- HÀM TRỢ GIÚP MỚI: "DẠY" AI CHO 1 PLAYBOOK ---
async function embedAndSavePlaybook(playbook: any) {
  if (!genAI) {
    console.error("AI Sync: Bỏ qua vì GEMINI_API_KEY bị thiếu.");
    return; // Nếu AI chưa khởi tạo, bỏ qua
  }

  console.log(`AI Sync: Đang nhúng (embedding) cho ${playbook.playbookId}...`);
  try {
    const embedModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

    // 1. Chuẩn hóa text
    const content = `
      Playbook ID: ${playbook.playbookId}
      Title: ${playbook.title}
      Severity: ${playbook.severity}
      Category: ${playbook.category}
      Scenario: ${playbook.scenario}
      Detection: ${playbook.detection}
      MITRE: ${playbook.mitre}
      Phases: ${JSON.stringify(playbook.phases)}
    `;
    
    // 2. Gọi API Gemini
    const result = await embedModel.embedContent(content);
    const embedding = result.embedding.values;
    const vectorString = `[${embedding.join(',')}]`;

    // 3. Ghi vào "Bộ não" AI (Bảng Embedding)
    await prisma.$executeRaw`
      INSERT INTO "PlaybookEmbedding" ("playbookId", "content", "embedding")
      VALUES (${playbook.playbookId}, ${content}, ${vectorString}::vector)
      ON CONFLICT ("playbookId") DO UPDATE
      SET "content" = ${content}, "embedding" = ${vectorString}::vector;
    `;
    console.log(`AI Sync: Nhúng thành công ${playbook.playbookId}.`);
  } catch (error) {
    console.error(`LỖI AI SYNC (embedAndSavePlaybook) cho ${playbook.playbookId}:`, error);
  }
}

// --- PHẦN 1 & 2: PLAYBOOK (Đã khóa bảo mật) ---
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

// --- PHẦN 3: CRUD (ĐÃ NÂNG CẤP ĐỒNG BỘ AI) ---
export async function createPlaybook(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error("Access Denied");
  
  const phasesRaw = formData.get('phases') as string;
  const playbookData = {
    playbookId: formData.get('playbookId') as string,
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    severity: formData.get('severity') as string,
    scenario: formData.get('scenario') as string,
    detection: formData.get('detection') as string,
    mitre: formData.get('mitre') as string,
    phases: JSON.parse(phasesRaw),
  };

  // 1. Lưu vào Bảng Playbook (Cho UI)
  const newPlaybook = await prisma.playbook.create({
    data: playbookData
  });

  // 2. NÂNG CẤP: "Dạy" AI ngay lập tức (Không chờ đợi)
  embedAndSavePlaybook(newPlaybook);

  revalidatePath('/');
  redirect('/');
}

export async function updatePlaybook(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') throw new Error("Access Denied");

  const id = formData.get('playbookId') as string;
  const phasesRaw = formData.get('phases') as string;
  
  const playbookData = {
    title: formData.get('title') as string,
    category: formData.get('category') as string,
    severity: formData.get('severity') as string,
    scenario: formData.get('scenario') as string,
    detection: formData.get('detection') as string,
    mitre: formData.get('mitre') as string,
    phases: JSON.parse(phasesRaw),
  };

  // 1. Lưu vào Bảng Playbook (Cho UI)
  const updatedPlaybook = await prisma.playbook.update({
    where: { playbookId: id },
    data: playbookData
  });
  
  // 2. NÂNG CẤP: "Dạy" (Cập nhật) AI ngay lập tức (Không chờ đợi)
  embedAndSavePlaybook({ ...updatedPlaybook, playbookId: id });

  revalidatePath(`/playbook/${id}`);
  redirect(`/playbook/${id}`);
}

// --- PHẦN 4: USER & AUTH (Giữ nguyên) ---
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

// --- PHẦN 5: AI (RAG) (Giữ nguyên) ---
export async function askGemini(question: string) {
  'use server'; 

  if (!process.env.GEMINI_API_KEY || !genAI) {
    console.error("Vercel Lỗi: Không tìm thấy GEMINI_API_KEY.");
    throw new Error("Lỗi cấu hình: Thiếu API Key.");
  }

  try {
    console.log("AI Action (SDK): Bắt đầu xử lý...");
    
    const embedModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
    const chatModel = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" }); 

    const questionEmbedding = (await embedModel.embedContent(question)).embedding.values;
    const vectorString = `[${questionEmbedding.join(',')}]`;

    const playbookIdMatch = question.match(/(PB-?|PB\s?)(\d{1,2})/i);
    let contextDocs: any[] = [];

    if (playbookIdMatch) {
      const numberPart = playbookIdMatch[2];
      const normalizedNumber = numberPart.padStart(2, '0');
      const foundId = `PB-${normalizedNumber}`; 

      console.log(`AI Action (HYBRID): Phát hiện ID: ${foundId}. Đang chạy Keyword Search...`);
      
      contextDocs = await prisma.$queryRaw`
        SELECT "content" FROM "PlaybookEmbedding" WHERE "playbookId" = ${foundId};
      `;
    } 
    
    if (contextDocs.length === 0) {
      console.log("AI Action (HYBRID): Không tìm thấy ID. Chuyển sang Vector Search...");
      
      contextDocs = await prisma.$queryRaw`
        SELECT "content"
        FROM "PlaybookEmbedding"
        ORDER BY "embedding" <-> (${vectorString}::vector)
        LIMIT 3;
      `;
    }

    console.log(`AI Action (SDK): Tìm thấy ${contextDocs.length} tài liệu.`);
    const context = contextDocs.map(doc => doc.content).join("\n\n---\n\n");

    const prompt = `
      CONTEXT: ${context}
      QUESTION: ${question}
      INSTRUCTION: Dựa CHỈ vào Context, trả lời câu hỏi bằng Tiếng Việt. Nếu không tìm thấy, nói "Tôi không tìm thấy thông tin này trong Playbook."
    `;

    console.log("AI Action (SDK): Đang gọi Gemini trả lời...");
    const result = await chatModel.generateContent(prompt);
    console.log("AI Action (SDK): Gemini trả lời thành công.");
    return result.response.text();

  } catch (error) {
    console.error("LỖI TẠI HÀM ASK_GEMINI (SDK):", error); 
    throw new Error("Server Error: " + (error as Error).message);
  }
}