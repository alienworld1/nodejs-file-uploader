const asyncHandler = require('express-async-handler');
const { DateTime } = require('luxon');
const { PrismaClient } = require('@prisma/client');

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

  if (file.userId != req.user.id) {
    const err = new Error('Not authorized to view the file');
    err.status = 403;
    return next(err);
  }

  const formattedDate = DateTime.fromJSDate(file.createdAt).toLocaleString();
  res.render('file_view', { title: file.name, file, formattedDate });
});
