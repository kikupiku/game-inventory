const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'kikupiku',
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'demo',
    formats: async (req, file) => ['jpg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const parser = multer({ storage: storage });

module.exports = parser;
