const multer = require('multer');
const path = require('path');

// Helper function to process filenames
const processFileName = (filename) => {
  return filename.replace(/\s+/g, '_'); // Replace spaces with underscores
};

// Profile storage
const storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/profiles'));
  },
  filename: function (req, file, cb) {
    const processedName = Date.now() + '_' + processFileName(file.originalname);
    cb(null, processedName);
  },
});

// Files storage
/*const storageFiles = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/files'));
  },
  filename: function (req, file, cb) {
    const processedName = Date.now() + '_' + processFileName(file.originalname);
    cb(null, processedName);
  },
});*/

// Combined upload fields
const upload = multer({
  storage: storageProfile,
}).fields([
  { name: 'profile_image', maxCount: 1 },
  { name: 'files', maxCount: 20 }, 
]);

// Separate middleware for profile images
const uploadProfileImage = multer({ storage: storageProfile }).single('profile_image');

// Separate middleware for multiple files
//const uploadFiles = multer({ storage: storageFiles }).array('files', 20); 

module.exports = {
  uploadProfileImage,
  //uploadFiles,
  upload,
};
