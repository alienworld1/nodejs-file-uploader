const asyncHandler = require('express-async-handler');

exports.rootGet = asyncHandler(async (req, res, next) => {
  res.render('root', { title: 'Root' });
});
