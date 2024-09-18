const asyncHandler = require('express-async-handler');

const FileManager = require('../utils/file');

exports.rootGet = asyncHandler(async (req, res, next) => {
  const root = await FileManager.getRootFolder(req.user.id);
  res.redirect(`/folder/${root.id}`);
});

exports.folderGetById = asyncHandler(async (req, res, next) => {
  const { folderid } = req.params;
  const folderId = parseInt(folderid);

  const userid = await FileManager.getFolderOwner(folderId);
  if (userid != req.user.id) {
    const err = new Error('Not authorized to access this folder');
    err.status = 403;
    return next(err);
  }

  const files = await FileManager.fetchFilesInFolder(folderId);
  res.render('folder_view', { files });
});
