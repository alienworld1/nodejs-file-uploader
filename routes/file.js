const router = require('express').Router();
const fileController = require('../controllers/file');

router.get('/:fileid', fileController.getFileDetails);
router.get('/:fileid/download', fileController.downloadFile);

router.get('/:fileid/rename', fileController.renameGet);
router.post('/:fileid/rename', fileController.renamePost);

module.exports = router;
