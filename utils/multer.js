const multer = require('multer');

// limit file upload size to 25 mb
const upload = multer({ dest: 'uploads/', limits: { fileSize: 26214400 } });
module.exports = upload;
