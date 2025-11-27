const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const adminController = require('../controllers/admin.controller');

router.get('/products', adminController.getAllProducts);

router.post('/products',
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('basePrice').isNumeric(),
    body('stock').isInt({ gt: 0 }),
    adminController.createProduct
);

router.post('/products/:id/images',
    adminController.uploadPictureProduct
);

router.patch('/products/:id',
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('basePrice').optional().isNumeric(),
    body('stock').optional().isInt({ gt: 0 }),
    body('categoryId').optional().isInt(),
    adminController.updateProduct
);

module.exports = router;