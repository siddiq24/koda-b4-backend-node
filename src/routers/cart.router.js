import express from 'express';
const router = express.Router();
import { body } from 'express-validator';

import cartController from '../controllers/cart.controller.js'
import authenticate from '../middlewares/auth.middleware.js';
router.use(authenticate)

//==============================
// ADD TO CART
//==============================
router.post('/', cartController.addToCart)

//==============================
// LIST CART
//==============================
router.get('/list', cartController.getCartList)

//==============================
// DETAIL CART
//==============================
router.get('/:id', cartController.getCartDetail)


export default router