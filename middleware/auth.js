const asyncHandler = require('express-async-handler');

exports.isAuthenticatedAsUser = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
});
