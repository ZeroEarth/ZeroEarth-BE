const express = require('express');
const router = express.Router();

const authRouter = require('./authRoutes');
const communityMgtRoutes = require('./communityMgtRoutes');
const manufactureRoutes = require('./manufactureRoutes');
const adminRoutes = require('./adminRoutes');


const {authenticate} = require('../../middlewares');
const fileUploadController = require("../../controllers/fileUploadController");

router.use('/auth', authRouter);
router.use('/community', [authenticate], communityMgtRoutes);
router.use('/manufacturers', [authenticate], manufactureRoutes);
router.use('/admin', [authenticate], adminRoutes);


//generate upload url
router.post('/generate-upload-url', fileUploadController.generateUploadUrl);


module.exports = router;