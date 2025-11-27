const adminModel = require('../models/admin.model');
const { validationResult } = require('express-validator');
const sendResponse = require('../libs/response').sendResponse;
const upload = require('../libs/upload');

/**
 * GET /admin/products
 * @summary Retrieve all products
 * @tags Admin
 */
async function getAllProducts(req, res) {
    try {
        const products = await adminModel.getAllProducts();
        return sendResponse(res, 200, "Products retrieved successfully", products);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

/**
 * POST /admin/products
 * @summary Create a new product
 * @tags Admin
 * @param {string} title.formData.required - Product title
 * @param {string} description.formData.required - Product description
 * @param {number} basePrice.formData.required - Product base price
 * @param {number} stock.formData.required - Product stock quantity
 * @return {object} 201 - Product created successfully
 * @return {object} 400 - Invalid input
 */
async function createProduct(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return sendResponse(res, 400, "Invalid input", null, errors.array());
    }

    try {
        const { title, description, basePrice, stock, picture } = req.body;

        if (await adminModel.productIsExist(title)) {
            return sendResponse(res, 400, "Product with this title already exists");
        }

        const newProduct = await adminModel.createProduct({
            title,
            description,
            basePrice,
            stock,
            picture
        });

        sendResponse(res, 201, "Product created successfully", newProduct);
    } catch (error) {
        sendResponse(res, 500, "Server error", null, error.message);
    }
}

/**
 * Product
 * @typedef {object} Upload
 * @property {string} picture - image cover - binary
 */

/**
 * POST /admin/products/{id}/upload
 * @summary Upload a picture for a product
 * @tags Products
 * @param {string} id.path.required - Product ID
 * @param {Upload} request.body.required - Picture file to upload - multipart/form-data
 * @return {object} 200 - Picture uploaded successfully
 */
async function uploadPictureProduct(req, res) {
    try {
        const id = parseInt(req.params.id);
        const product = await adminModel.getProductById(id);

        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }

        upload.single("image")(req, res, async function (err) {
            if (err) {
                return sendResponse(res, 500, "File upload error", null, err.message);
            }

            if (!req.file) {
                return sendResponse(res, 400, "No file uploaded");
            }

            const updatedProduct = await adminModel.uploadPictureProduct(id, req.file.filename);

            return sendResponse(res, 200, "Picture uploaded successfully", updatedProduct);
        });
    } catch (err) {
        return sendResponse(res, 500, "Server error", null, err.message);
    }
}

/**
 * PATCH /admin/products/{id}
 * @summary Update an existing product
 * @tags Admin
 * @param {number} id.path.required - Product ID
 * @param {string} title.formData - Product title
 * @param {string} description.formData - Product description
 * @param {number} basePrice.formData - Base price
 * @param {number} stock.formData - Stock quantity
 * @param {number} categoryId.formData - Category ID
 * @return {object} 200 - Product updated successfully
 * @return {object} 404 - Product not found
 */
async function updateProduct(req, res) {
    try {
        const id = parseInt(req.params.id);

        const product = await adminModel.getProductById(id);
        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }

        const { title, description, basePrice, stock, categoryId } = req.body;

        const updateData = {
            updatedAt: new Date(),
        };

        if (title !== undefined) {
            if (await adminModel.productIsExist(title)) {
                return sendResponse(res, 400, "Product with this title already exists");
            }
            updateData.title = title;
        }
        if (description !== undefined) updateData.description = description;
        if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
        if (stock !== undefined) updateData.stock = parseInt(stock);
        if (categoryId !== undefined) {
            updateData.categoryId = categoryId ? parseInt(categoryId) : null;
        }

        // Update produk
        const updated = await adminModel.updateProduct(id, updateData);

        return sendResponse(res, 200, "Product updated successfully", updated);

    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}



module.exports = {
    createProduct,
    uploadPictureProduct,
    updateProduct,
    getAllProducts
};