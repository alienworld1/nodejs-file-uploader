// Temporarily uses a local folder to store files
// Later, a cloud storage platform will be implemented
// ! Do not store file data in Postgres directly

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
