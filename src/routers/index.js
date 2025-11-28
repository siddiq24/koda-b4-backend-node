import express from 'express';
import authRouter from './auth.router.js';
import adminRouter from './admin.router.js';

const router = express.Router();

router.use('/admin', adminRouter);
router.use('/auth', authRouter);

export default router;