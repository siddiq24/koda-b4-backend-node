import express from 'express';
const router = express.Router();
import { body } from 'express-validator';

import productController from '../controllers/products.controller.js'

//==============================
// GET ALL PRODUCTS
//==============================
router.get('', productController.getAllProducts)

//==============================
// GET FAVORITE PRODUCTS
//==============================
router.get('/favorites', productController.getFavoriteProducts)

//==============================
// GET PRODUCT BY ID
//==============================
router.get('/:id', productController.getProductById);


export default router;