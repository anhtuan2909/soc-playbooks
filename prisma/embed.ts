import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Không cần import extension vector

const prisma = new PrismaClient(); // Khởi tạo Client gốc
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function main() {
  console.log('🚀 Bắt đầu nhúng (embedding) 50 Playbook...');
  
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const playbooks = await prisma.playbook.findMany();

  for (const pb of playbooks) {
    // 1. Chuẩn hóa text (gộp tất cả thông tin lại)
    const content = `
      Playbook ID: ${pb.playbookId}
      Title: ${pb.title}
      Severity: ${pb.severity}
      Category: ${pb.category}
      Scenario: ${pb.scenario}
      Detection: ${pb.detection}
      MITRE: ${pb.mitre}
      Phases: ${JSON.stringify(pb.phases)}
    `;
    
    // 2. Gọi API Gemini để biến text thành vector (768 con số)
    const result = await model.embedContent(content);
    const embedding = result.embedding.values;

    // 3. Chuyển đổi mảng số [0.1, 0.2, ...] thành chuỗi '[0.1, 0.2, ...]'
    const vectorString = `[${embedding.join(',')}]`;

    // 4. Dùng SQL thô để GHI vector vào Bảng Embedding
    await prisma.$executeRaw`
      INSERT INTO "PlaybookEmbedding" ("playbookId", "content", "embedding")
      VALUES (${pb.playbookId}, ${content}, ${vectorString}::vector)
      ON CONFLICT ("playbookId") DO UPDATE
      SET "content" = ${content}, "embedding" = ${vectorString}::vector;
    `;
    console.log(`Đã nhúng: ${pb.playbookId}`);
  }
  console.log('✅ Hoàn tất Embedding! Bộ não AI đã sẵn sàng.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());