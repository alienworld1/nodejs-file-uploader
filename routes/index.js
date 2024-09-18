const router = require('express').Router();

const auth = require('../controllers/auth');
const { isAuthenticatedAsUser } = require('../middleware/auth');

router.get('/', isAuthenticatedAsUser, (req, res) => {
  res.redirect('/folder');
});

router.get('/login', auth.loginGet);
router.post('/login', auth.loginPost);

router.get('/sign-up', auth.signupGet);
router.post('/sign-up', auth.signupPost);

router.get('/log-out', isAuthenticatedAsUser, auth.logoutGet);

module.exports = router;
