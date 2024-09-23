const router = require('express').Router();
const fileController = require('../controllers/file');

router.get('/:fileid', fileController.getFileDetails);
router.get('/:fileid/download', fileController.downloadFile);

module.exports = router;
