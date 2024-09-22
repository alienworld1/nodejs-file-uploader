const router = require('express').Router();

const folderController = require('../controllers/folder');
const fileRouter = require('./file');

const { isAuthenticatedAsUser } = require('../middleware/auth');
const { generateFolderUrl } = require('../utils/file');

router.get('/', isAuthenticatedAsUser, folderController.rootGet);

router.use('/:folderid', (req, res, next) => {
  res.locals.folderUrl = generateFolderUrl(req.params.folderid);
  next();
});

router.get('/:folderid', folderController.folderGetById);

router.use('/:folderid/file', fileRouter);

router.get('/:folderid/upload-file', folderController.fileUploadGet);
router.post('/:folderid/upload-file', folderController.fileUploadPost);

module.exports = router;
