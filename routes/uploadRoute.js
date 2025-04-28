const express = require('express');
const router = express.Router();
const uploadCtrl = require('../controllers/uploadControllers');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), uploadCtrl.uploadImg);

module.exports = router;