const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const main = async () => {
  console.log('Clearing database...');
  // Ordered this way to avoid any foreign key constraint issues
  await prisma.file.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.user.deleteMany();
  console.log('Successfully cleared database.');
};

main().catch(err => console.error(err));
