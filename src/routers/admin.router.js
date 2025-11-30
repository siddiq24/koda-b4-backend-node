import express from 'express';
const router = express.Router();
import { body } from 'express-validator';

import adminController from '../controllers/products.controller.js';
import authenticate from "../middlewares/auth.middleware.js";
router.use(authenticate);

//==============================
// GET ALL PRODUCTS
//==============================
router.get('/products', adminController.getAllProducts);

//==============================
// GET PRODUCT BY ID
//==============================
router.get('/products/:id', adminController.getProductById);

//==============================
// CREATE NEW PRODUCT
//==============================
router.post('/products',
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('basePrice').isNumeric(),
    body('stock').isInt({ gt: 0 }),
    adminController.createProduct
);

//==============================
// UPLOAD PRODUCT IMAGES
//==============================
router.post('/products/:id/images',
    adminController.uploadPictureProduct
);

//==============================
// DELETE PRODUCT IMAGES
//==============================
router.delete('/products/:id/images/:imgId',
    adminController.deleteImageProducts
)

//==============================
// UPDATE PRODUCT
//==============================
router.patch('/products/:id',
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('basePrice').optional().isNumeric(),
    body('stock').optional().isInt({ gt: 0 }),
    body('categoryId').optional().isInt(),
    adminController.updateProduct
);

//==============================
// DELETE PRODUCT
//==============================
router.delete('/products/:id',
    adminController.deleteProduct
);

export default router;