// Temporarily uses a local folder to store files
// Later, a cloud storage platform will be implemented
// ! Do not store file data in Postgres directly

const path = require('path');
const fs = require('fs/promises');

const { PrismaClient } = require('@prisma/client');
const { getFilesWithLinks } = require('@prisma/client/sql');

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
  const files = await prisma.$queryRawTyped(getFilesWithLinks(folderid));
  return files;
};

exports.generateFolderUrl = folderid => `/folder/${folderid}/`;
exports.generateFileUrl = fileid => `/file/${fileid}`;

const deleteFileFromCloud = async file => {
  const filePath = path.resolve(__dirname, '..', file.path);
  await fs.unlink(filePath);
};

const deleteFolder = async folder => {
  const currentFolder = await prisma.folder.findUnique({
    where: {
      id: folder.id,
    },
    include: {
      files: true,
      subfolder: true,
    },
  });

  if (!currentFolder) return;

  await Promise.all([
    currentFolder.files.map(async file => {
      await Promise.all([
        deleteFileFromCloud(file),
        prisma.file.delete({
          where: {
            id: file.id,
          },
        }),
      ]);
    }),
  ]);
  await Promise.all([
    currentFolder.subfolder.map(folder => deleteFolder(folder)),
  ]);
  await prisma.folder.delete({
    where: {
      id: currentFolder.id,
    },
  });
};

exports.deleteFileFromCloud = deleteFileFromCloud;
exports.deleteFolder = deleteFolder;
