const asyncHandler = require('express-async-handler');
const { PrismaClient } = require('@prisma/client');

const FileManager = require('../utils/file');
const upload = require('../utils/multer');
const { body, validationResult } = require('express-validator');

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
      isRoot: true,
      parentId: true,
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
  const [files, folders] = await Promise.all([
    FileManager.fetchFilesInFolder(folderId),
    prisma.folder.findMany({
      where: {
        parentId: folderId,
      },
    }),
  ]);
  res.render('folder_view', {
    title: folder.name,
    files,
    folders,
    isRoot: folder.isRoot,
    parentId: folder.parentId,
  });
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

exports.folderCreateGet = asyncHandler(async (req, res, next) => {
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

  res.render('folder_create', { title: 'Create Folder' });
});

exports.folderCreatePost = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage('Folder name must be 1-32 characters long')
    .matches(/^[\w\-. ]+$/)
    .withMessage('A valid folder name is required'),

  asyncHandler(async (req, res, next) => {
    const { folderid } = req.params;
    const folderId = parseInt(folderid);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('folder_create', {
        title: 'Create Folder',
        error: errors.array().at(0),
      });
      return;
    }

    const folder = await prisma.folder.create({
      data: {
        name: req.body.name,
        isRoot: false,
        userId: req.user.id,
        parentId: folderId,
      },
    });

    res.redirect(`/folder/${folder.id}`);
  }),
];

exports.renameGet = asyncHandler(async (req, res, next) => {
  const { folderid } = req.params;
  const folderId = parseInt(folderid);

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    const err = new Error('folder not found');
    err.status = 404;
    return next(err);
  }

  if (folder.userId !== req.user.id) {
    const err = new Error('Not authorized to access this folder');
    err.status = 403;
    return next(err);
  }

  if (folder.isRoot) {
    const err = new Error('Cannot rename this folder');
    err.status = 400;
    return next(err);
  }

  res.render('folder_rename', { title: 'Rename', folder });
});

exports.renamePost = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage(
      "The length of the folder's name should be between 1-32 characters",
    )
    .matches(/^[\w\-. ]+$/)
    .withMessage('A valid name is required'),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { folderid } = req.params;
    const folderId = parseInt(folderid);

    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
    });

    if (!folder) {
      const err = new Error('folder not found');
      err.status = 404;
      return next(err);
    }

    if (folder.userId !== req.user.id) {
      const err = new Error('Not authorized to access this folder');
      err.status = 403;
      return next(err);
    }

    if (folder.isRoot) {
      const err = new Error('Cannot rename this folder');
      err.status = 400;
      return next(err);
    }

    if (!errors.isEmpty()) {
      res.render('folder_rename', {
        title: 'Rename',
        folder,
        error: errors.array()[0],
      });
      return;
    }

    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        name: req.body.name,
      },
    });

    res.redirect('/');
  }),
];

exports.deleteGet = asyncHandler(async (req, res, next) => {
  const { folderid } = req.params;
  const folderId = parseInt(folderid);

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    const err = new Error('File not found');
    err.status = 404;
    return next(err);
  }

  if (folder.userId !== req.user.id) {
    const err = new Error('Not authorized to view the file');
    err.status = 403;
    return next(err);
  }

  if (folder.isRoot) {
    const err = new Error('Cannot delete this folder');
    err.status = 400;
    return next(err);
  }

  res.render('folder_delete', { title: 'Delete', folder });
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  const { folderid } = req.params;
  const folderId = parseInt(folderid);

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
  });

  if (!folder) {
    const err = new Error('File not found');
    err.status = 404;
    return next(err);
  }

  if (folder.userId !== req.user.id) {
    const err = new Error('Not authorized to view the file');
    err.status = 403;
    return next(err);
  }

  if (folder.isRoot) {
    const err = new Error('Cannot delete this folder');
    err.status = 400;
    return next(err);
  }

  await FileManager.deleteFolder(folder);

  res.redirect('/');
});
