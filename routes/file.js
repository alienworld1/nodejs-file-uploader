const router = require('express').Router();
const fileController = require('../controllers/file');

router.get('/:fileid', fileController.getFileDetails);

module.exports = router;
