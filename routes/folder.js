const router = require('express').Router();

const root = require('../controllers/root');
const { isAuthenticatedAsUser } = require('../middleware/auth');

router.get('/', isAuthenticatedAsUser, root.rootGet);

module.exports = router;
