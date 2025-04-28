const express = require('express');
const router = express.Router();
const uploadCtrl = require('../controllers/uploadControllers');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), uploadCtrl.uploadImg);

module.exports = router;