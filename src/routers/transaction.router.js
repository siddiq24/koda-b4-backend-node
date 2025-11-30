import express from 'express';
const router = express.Router();
import { body } from 'express-validator';

import trxController from '../controllers/transaction.controller.js'
import authenticate from '../middlewares/auth.middleware.js';
router.use(authenticate)

//==============================
// CHECKOUT
//==============================
router.post('/', trxController.checkout)

//==============================
// HISTORY
//==============================
router.get('/history', trxController.getOrderHistory)

//==============================
// HISTORY
//==============================
router.get('/history/:invoice', trxController.getOrderDetail)

export default router