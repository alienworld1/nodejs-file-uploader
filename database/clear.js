const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const main = async () => {
  console.log('Clearing database...');
  await prisma.user.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.file.deleteMany();
  console.log('Successfully cleared database.');
};

main().catch(err => console.error(err));
