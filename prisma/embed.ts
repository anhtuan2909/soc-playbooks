import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Hàm delay để tránh bị Google API Rate Limit (lỗi 429)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Bắt đầu nhúng (embedding) 50 Playbook...');
  
  const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
  const playbooks = await prisma.playbook.findMany();

  // TẠO MỘT MẢNG CHỨA CÁC LỜI HỨA (PROMISES)
  const embeddingPromises = [];

  for (const pb of playbooks) {
    // 1. Chuẩn hóa text
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
    
    // 2. Thêm "lời hứa" (Promise) vào mảng
    embeddingPromises.push(async () => {
      try {
        // 3. Gọi API Gemini
        const result = await model.embedContent(content);
        const embedding = result.embedding.values;
        const vectorString = `[${embedding.join(',')}]`;

        // 4. Ghi vào DB
        await prisma.$executeRaw`
          INSERT INTO "PlaybookEmbedding" ("playbookId", "content", "embedding")
          VALUES (${pb.playbookId}, ${content}, ${vectorString}::vector)
          ON CONFLICT ("playbookId") DO UPDATE
          SET "content" = ${content}, "embedding" = ${vectorString}::vector;
        `;
        console.log(`Đã nhúng thành công: ${pb.playbookId}`);
      } catch (error: any) {
        console.error(`Lỗi khi nhúng ${pb.playbookId}: ${error.message}`);
      }
      // Chờ 1 giây để tránh Rate Limit của Google
      await delay(1000); 
    });
  }

  // 5. CHẠY TUẦN TỰ TỪNG LỜI HỨA (Fix lỗi Race Condition)
  console.log(`\nBắt đầu chạy ${embeddingPromises.length} tác vụ nhúng... (Việc này sẽ mất khoảng 1-2 phút)`);
  for (const promiseFn of embeddingPromises) {
    await promiseFn(); // Chạy và chờ xong 1 cái mới làm cái tiếp
  }

  console.log('✅ Hoàn tất Embedding! Bộ não AI đã sẵn sàng.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());