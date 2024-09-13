const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.loginGet = asyncHandler(async (req, res, next) => {
  res.render('login', { title: 'Log in', errors: req.session.messages });
});

exports.signupGet = asyncHandler(async (req, res, next) => {
  res.render('sign-up', { title: 'Sign up' });
});

exports.signupPost = [
  body('username')
    .trim()
    .isLength({ min: 1, max: 16 })
    .withMessage('The username must be between 1-16 characters.')
    .isAlphanumeric()
    .withMessage('The username must not contain any special characters.')
    .custom(async value => {
      // check if username exists
      const user = await prisma.user.findUnique({
        where: {
          username: value,
        },
      });
      if (user !== null) {
        throw new Error('This username is already in use.');
      }
    }),
  body('password', 'The password must be between 6-32 characters').isLength({
    min: 6,
    max: 32,
  }),
  body('confirm-password')
    // check if password and confirm password match
    .custom((value, { req }) => value === req.body.password)
    .withMessage('The password and password confirmation must match'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const { username, password } = req.body;

    if (!errors.isEmpty()) {
      res.render('sign-up', {
        title: 'Sign up',
        user: { username, password },
        errors: errors.array(),
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    res.redirect('/');
  }),
];

exports.loginPost = passport.authenticate('local', {
  successRedirect: '/root',
  failureRedirect: '/login',
  failureMessage: true,
});

exports.logoutGet = asyncHandler(async (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});
