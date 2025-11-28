import express from 'express';
import authRouter from './auth.router.js';
import adminRouter from './admin.router.js';
import { connectToDatabase } from '../libs/prisma.config.js';

const router = express.Router();

router.use('/admin', adminRouter);
router.use('/auth', authRouter);

router.use('/', (req, res) => {
    res.json({
        message: 'Welcome to the Coffee Shop API',
        postgres: connectToDatabase() ? 'PostgreSQL connected' : 'PostgreSQL not connected'
    });
});

export default router;