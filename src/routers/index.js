import express from 'express';
import authRouter from './auth.router.js';
import adminRouter from './admin.router.js';
import productRouter from './product.router.js';
import cartRouter from './cart.router.js'
import trxRouter from './transaction.router.js'
import profileRouter from './profile.router.js'
import { connectToDatabase } from '../libs/prisma.config.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/products', productRouter)
router.use('/cart', cartRouter)
router.use('/transactions', trxRouter)
router.use('/profile', profileRouter)

router.use('/', (req, res) => {
    res.json({
        message: 'Welcome to the Coffee Shop API',
        postgres: connectToDatabase() ? 'PostgreSQL connected' : 'PostgreSQL not connected'
    });
});

export default router;