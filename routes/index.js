const router = require('express').Router();

const auth = require('../controllers/auth-controller');

router.get('/', (req, res) => {
  res.redirect('/login');
});

router.get('/login', auth.loginGet);

router.get('/sign-up', auth.signupGet);

module.exports = router;
