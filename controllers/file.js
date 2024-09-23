const asyncHandler = require('express-async-handler');
const path = require('path');
const { DateTime } = require('luxon');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.getFileDetails = asyncHandler(async (req, res, next) => {
  const { fileid } = req.params;
  const fileId = parseInt(fileid);

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    const err = new Error('File not found');
    err.status = 404;
    return next(err);
  }

  if (file.userId !== req.user.id) {
    const err = new Error('Not authorized to view the file');
    err.status = 403;
    return next(err);
  }

  const formattedDate = DateTime.fromJSDate(file.createdAt).toLocaleString();
  res.render('file_view', { title: file.name, file, formattedDate });
});

exports.downloadFile = asyncHandler(async (req, res, next) => {
  const { fileid } = req.params;
  const fileId = parseInt(fileid);

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
  });

  if (!file) {
    const err = new Error('File not found');
    err.status = 404;
    return next(err);
  }

  if (file.userId !== req.user.id) {
    const err = new Error('Not authorized to view the file');
    err.status = 403;
    return next(err);
  }

  // This header is used to determine the filename that is downloaded
  res.set('Content-Disposition', `attachment; filename="${file.name}"`);
  res.sendFile(path.resolve(__dirname, '..', file.path));
});

exports.renameGet = asyncHandler(async (req, res, next) => {
  const { fileid } = req.params;
  const fileId = parseInt(fileid);

  const file = await prisma.file.findUnique({
    where: {
      id: fileId,
    },
    select: {
      name: true,
      userId: true,
    },
  });

  if (!file) {
    const err = new Error('File not found');
    err.status = 404;
    return next(err);
  }

  if (file.userId !== req.user.id) {
    const err = new Error('Not authorized to view the file');
    err.status = 403;
    return next(err);
  }

  res.render('file_rename', { title: 'Rename File', file });
});

exports.renamePost = [
  body('filename')
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage('Filename length should be between 1-32 characters')
    .matches(/^[\w\-. ]+$/)
    .withMessage('A valid filename is required'),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { fileid, folderid } = req.params;
    const fileId = parseInt(fileid);

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        name: true,
        userId: true,
      },
    });

    if (!file) {
      const err = new Error('File not found');
      err.status = 404;
      return next(err);
    }

    if (file.userId !== req.user.id) {
      const err = new Error('Not authorized to view the file');
      err.status = 403;
      return next(err);
    }

    if (!errors.isEmpty()) {
      res.render('file_rename', {
        title: 'Rename File',
        file,
        error: errors.array()[0],
      });
      return;
    }

    await prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        name: req.body.filename,
      },
    });

    res.redirect('/');
  }),
];
