const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const adminController = require('../controllers/products.controller');
const authenticate = require("../middlewares/auth.middleware");
router.use(authenticate);

//==============================
// GET ALL PRODUCTS
//==============================
router.get('/products', adminController.getAllProducts);

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

module.exports = router;