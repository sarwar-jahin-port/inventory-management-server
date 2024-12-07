const multer = require('multer');

// Set up multer storage for image uploads
const storage = multer.memoryStorage();

// Initialize multer with the specified storage configuration
const upload = multer({ storage: storage }).single('image');

// Export the upload middleware
module.exports = upload;
