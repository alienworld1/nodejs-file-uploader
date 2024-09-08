const asyncHandler = require('express-async-handler');

exports.loginGet = asyncHandler(async (req, res, next) => {
  res.render('login');
});

exports.signupGet = asyncHandler(async (req, res, next) => {
  res.render('sign-up');
});
