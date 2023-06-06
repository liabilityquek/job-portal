const multer = require('multer')

const storageImage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/images/'); // Here './uploads/images/' is the path where the images will be saved. Make sure this directory exists.
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname); // This gives a unique name to each file.
    },
});

const storageResume = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/resumes/'); // Here './uploads/resumes/' is the path where the resumes will be saved. Make sure this directory exists.
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname); // This gives a unique name to each file.
    },
});

const storageCover = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/cover/'); // Here './uploads/resumes/' is the path where the resumes will be saved. Make sure this directory exists.
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname); // This gives a unique name to each file.
    },
});
const uploadImage = multer({ storage: storageImage }).single('imageUrl');
const uploadResume = multer({ storage: storageResume }).single('resumeUrl');
const uploadCover = multer({ storage: storageCover }).single('coverLetterUrl');

module.exports = {
  uploadImage,
  uploadResume,
  uploadCover
};
