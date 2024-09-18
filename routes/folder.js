const router = require('express').Router();

const folderController = require('../controllers/folder');
const { isAuthenticatedAsUser } = require('../middleware/auth');

router.get('/', isAuthenticatedAsUser, folderController.rootGet);
router.get('/:folderid', folderController.folderGetById);

module.exports = router;
