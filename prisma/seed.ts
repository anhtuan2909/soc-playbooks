import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(process.cwd(), 'data/playbooks.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const playbooks = JSON.parse(rawData);

  console.log(`Dang nap ${playbooks.length} playbooks...`);

  for (const pb of playbooks) {
    await prisma.playbook.upsert({
      where: { playbookId: pb.playbookId },
      update: {},
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
  console.log('✅ Nap du lieu thanh cong!');
  // Tạo Admin mặc định
  const adminEmail = 'admin@soc.local';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: 'admin123', // Pass mặc định
      role: 'ADMIN'
    }
  });
  console.log('✅ Đã tạo Admin: admin@soc.local / admin123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect())
