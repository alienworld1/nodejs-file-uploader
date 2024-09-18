// Temporarily uses a local folder to store files
// Later, a cloud storage platform will be implemented
// ! Do not store file data in Postgres directly

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getRootFolder = async userid => {
  const root = await prisma.folder.findFirst({
    where: {
      userId: userid,
      isRoot: true,
    },
  });

  return root;
};

exports.fetchFilesInFolder = async folderid => {
  const files = await prisma.file.findMany({
    where: {
      parentId: folderid,
    },
  });

  return files;
};

exports.getFolderOwner = async folderId => {
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    select: {
      user: true,
    },
  });

  if (!folder) {
    throw new Error('Folder not found');
  }

  return folder.user.id;
};
