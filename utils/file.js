const path = require('path');
const fs = require('fs/promises');

const { PrismaClient } = require('@prisma/client');
const { getFilesWithLinks } = require('@prisma/client/sql');
const supabase = require('../utils/supabase');

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
  const { data, error } = await supabase.storage
    .from('file-storage')
    .remove(file.path);
  if (error) throw error;
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

exports.uploadFileToCloud = async file => {
  const fileBuffer = await fs.readFile(file.path);

  const { data, error } = await supabase.storage
    .from('file-storage')
    .upload(file.filename, fileBuffer);
  if (error) {
    throw error;
  }

  await fs.unlink(file.path);
  return data.path;
};

exports.downloadFileFromCloud = async file => {
  const { data, error } = await supabase.storage
    .from('file-storage')
    .download(file.path);

  if (error) {
    throw error;
  }
  return Buffer.from(await data.arrayBuffer());
};
