const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');

const FileManager = require('../utils/file');
const upload = require('../utils/multer');

const prisma = new PrismaClient();

exports.rootGet = asyncHandler(async (req, res, next) => {
  const root = await FileManager.getRootFolder(req.user.id);
  currentFolder = root.id;
  res.redirect(`/folder/${root.id}`);
});

exports.folderGetById = asyncHandler(async (req, res, next) => {
  const { folderid } = req.params;
  const folderId = parseInt(folderid);

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    select: {
      userId: true,
      name: true,
    },
  });

  if (!folder) {
    const err = new Error('Folder not found');
    err.status = 404;
    return next(err);
  }

  if (folder.userId != req.user.id) {
    const err = new Error('Not authorized to access this folder');
    err.status = 403;
    return next(err);
  }

  currentFolder = folderId;
  const files = await FileManager.fetchFilesInFolder(folderId);
  res.render('folder_view', { files, title: folder.name });
});

exports.fileUploadGet = asyncHandler(async (req, res, next) => {
  const { folderid } = req.params;
  const folderId = parseInt(folderid);

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    const err = new Error('Folder not found');
    err.status = 404;
    return next(err);
  }

  if (req.user.id !== folder.userId) {
    const err = new Error('Not authorized to access this folder');
    err.status = 403;
    return next(err);
  }
  res.render('file_upload', {
    title: 'Upload File',
    script: '/scripts/file-input.js',
  });
});

exports.fileUploadPost = [
  upload.single('file'),
  asyncHandler(async (req, res, next) => {
    const { folderid } = req.params;
    const folderId = parseInt(folderid);

    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
      select: {
        id: true,
      },
    });

    if (!folder) {
      const err = new Error('Folder not found');
      err.status = 404;
      return next(err);
    }

    if (!req.file) {
      res.render('file_upload', {
        title: 'Upload File',
        script: '/scripts/file-input.js',
        error: 'A file must be uploaded',
      });
    }

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        parentId: folderId,
        userId: req.user.id,
        path: req.file.path,
      },
    });

    res.redirect(`/folder/${folderid}`);
  }),
];
