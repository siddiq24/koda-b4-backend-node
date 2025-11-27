const express = require('express');
const router = express.Router();
const authRouter = require('./auth.router');
const adminRouter = require('./admin.router');

router.use('/admin', adminRouter);
router.use('/auth', authRouter);

module.exports = router;