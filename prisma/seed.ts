import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(process.cwd(), 'data/playbooks.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const playbooks = JSON.parse(rawData);

  console.log(`🚀 Dang nap ${playbooks.length} playbooks...`);

  for (const pb of playbooks) {
    await prisma.playbook.upsert({
      where: { playbookId: pb.playbookId },
      
      // --- SỬA Ở ĐÂY: CẬP NHẬT DỮ LIỆU KHI ĐÃ TỒN TẠI ---
      update: {
        title: pb.title,
        category: pb.category,
        severity: pb.severity,
        scenario: pb.scenario,
        detection: pb.detection,
        mitre: pb.mitre,
        phases: pb.phases // Quan trọng: Cập nhật JSON các bước
      },
      // --------------------------------------------------

      create: {
        playbookId: pb.playbookId,
        title: pb.title,
        category: pb.category,
        severity: pb.severity,
        scenario: pb.scenario,
        detection: pb.detection,
        mitre: pb.mitre,
        phases: pb.phases || []
      }
    })
  }
  
  // Phần tạo Admin giữ nguyên (đã chuẩn)
  const adminEmail = 'admin@soc.local';
  await prisma.user.upsert({
    where: { email: adminEmail },
																		  
    update: { password: 'Soc@2025!' },
	
    create: {
      email: adminEmail,
      password: 'Soc@2025!',
      role: 'ADMIN'
    }
  });
  
  console.log('✅ Nap du lieu thanh cong!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect())
