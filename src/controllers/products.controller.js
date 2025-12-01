import ProductsModel from '../models/products.model.js';
import { validationResult } from 'express-validator';
import sendResponse from '../libs/response.js';
import upload from '../libs/upload.js';
import { getRedisClient } from '../libs/redis.config.js';

const redis = getRedisClient()

/**
 * GET /admin/products
 * @summary Retrieve all products
 * @tags Admin
 * @security BearerAuth
 * @param {string} search.query - Search
 * @param {number} page.query - Page
 * @param {number} cat.query - Category Id
 * @param {number} minPrice.query - Minimum price
 * @param {number} maxPrize.query - Maximum Prize
 * @param {string} shortBy.query - Short By [ id , title] 
 * @param {string} asc.query - Ascending or Descending
 * @param {number} limit.query - Limit per page
 * @return {object} 200 - User logged in successfully
 * @return {object} 401 - Invalid email or password
 */
async function getAllProducts(req, res) {
    try {
        let products = {}
        const filters = req.query
        if (Object.keys(req.query).length === 0) {
            products = await redis.get('products');
            if (products) products = JSON.parse(products);
            if (!products) {
                products = await ProductsModel.getAllProducts(filters)
                await redis.set('products', JSON.stringify(products, (_, value) =>
                    typeof value === 'bigint' ? value.toString() : value
                ), { EX: 60 * 60 });
            }
        } else {
            products = await ProductsModel.getAllProducts(req.query)
        }

        return sendResponse(res, 200, "Products retrieved successfully", products);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

async function getFavoriteProducts(req, res) {
    try {
        const { limit } = req.query;
        const products = await ProductsModel.getFavoriteProducts(limit || 6)
        return sendResponse(res, 200, "Favorites products retrieved successfully", products);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}


/**
 * GET /admin/products/{id}
 * @summary Retrieve a product by ID
 * @tags Admin
 * @param {string} id.path.required - Product ID
 * @return {object} 200 - Product retrieved successfully
 * @return {object} 404 - Product not found
 */
async function getProductById(req, res) {
    const id = parseInt(req.params.id);
    try {
        const product = await ProductsModel.getProductById(id);
        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }
        return sendResponse(res, 200, "Product retrieved successfully", product);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}


/**
 * POST /admin/products
 * @summary Create a new product
 * @tags Admin
 * @param {string} title.formData.required - Product title
 * @param {string} description.formData - Product description
 * @param {number} basePrice.formData.required - Product base price
 * @param {number} stock.formData.required - Product stock quantity
 * @param {number} categoryId.formData - Product category ID
 * @param {Array.<number>} sizes.formData - Array of size IDs to associate with the product
 * @return {object} 201 - Product created successfully
 * @return {object} 400 - Invalid input
 * @return {object} 500 - Internal server error
 */
export const createProduct = async (req, res) => {
    try {
        const { title, description, basePrice, stock, categoryId, sizes } = req.body;

        if (!title || !basePrice || stock === undefined) {
            return sendResponse(res, 400, "Title, basePrice, and stock are required fields.");
        }

        const newProduct = await ProductsModel.createProduct({
            title,
            description,
            basePrice: parseFloat(basePrice),
            stock: parseInt(stock),
            categoryId: categoryId ? parseInt(categoryId) : null,
            sizes: sizes || []
        });
        return sendResponse(res, 201, "Product created successfully", newProduct);
    } catch (error) {
        console.error("Error creating product:", error);

        if (error.code === "P2002") {
            return sendResponse(res, 400, "A product with the same title already exists.");
        }

        return sendResponse(res, 500, "Internal server error", null, error.message);
    }
}; //===============================================================================




/**
 * Product
 * @typedef {object} Upload
 * @property {string} picture - image cover - binary
*/

/**
 * POST /admin/products/{id}/images
 * @summary Upload a picture for a product
 * @tags Admin
 * @param {string} id.path.required - Product ID
 * @param {Upload} request.body.required - Picture file to upload - multipart/form-data
 * @return {object} 200 - Picture uploaded successfully
 */
async function uploadPictureProduct(req, res) {
    try {
        const id = parseInt(req.params.id);
        const product = await ProductsModel.getProductById(id);

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

            const updatedProduct = await ProductsModel.addProductImage(id, req.file.filename);
            const product = await ProductsModel.getProductById(id);

            return sendResponse(res, 200, "Picture uploaded successfully", product);
        });
    } catch (err) {
        return sendResponse(res, 500, "Server error", null, err.message);
    }
} //===============================================================================

/**
 * DELETE /admin/{id}/images/{imgId}
 * @summary Delete a picture for a product
 * @tags Admin
 * @param {string} id.path.required - Product ID
 * @param {string} imgId.path.required - Image ID
 * @returns {object} 200 - Image deleted successfully
 * 
 */
async function deleteImageProducts(req, res) {
    try {
        const productId = parseInt(req.params.id);
        const imageId = parseInt(req.params.imgId);

        const product = await ProductsModel.getProductById(productId);
        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }

        await ProductsModel.deleteProductImage(productId, imageId);
        const updateProduct = await ProductsModel.getProductById(productId)
        return sendResponse(res, 200, "Image deleted successfully", updateProduct);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
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
 * @param {Array.<number>} sizes.formData - Array of size IDs
 * @return {object} 200 - Product updated successfully
 * @return {object} 404 - Product not found
 * @return {object} 500 - Server error
*/
async function updateProduct(req, res) {
    try {
        const id = BigInt(req.params.id);

        const product = await ProductsModel.getProductById(id);
        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }

        const { title, description, basePrice, stock, categoryId, sizes, variants } = req.body;

        const updateData = { updated_at: new Date() };

        if (title !== undefined && title !== "") updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (basePrice !== undefined) updateData.base_price = parseFloat(basePrice);
        if (stock !== undefined) updateData.stock = parseInt(stock);

        if (categoryId !== undefined) {
            updateData.categories = categoryId
                ? { connect: { id: parseInt(categoryId) } }
                : { disconnect: true };
        }

        if (Array.isArray(sizes)) {
            await ProductsModel.updateProductSizes(id, sizes);
        }

        if (Array.isArray(variants)) {
            console.log(variants);
            await ProductsModel.updateProductVariants(id, variants);
        }

        await ProductsModel.updateProduct(id, updateData);

        const newProduct = await ProductsModel.getProductById(id);
        return sendResponse(res, 200, "Product updated successfully", newProduct);

    } catch (error) {
        console.error("Error updating product:", error);
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

//===============================================================================


async function deleteProduct(req, res) {
    try {
        const id = parseInt(req.params.id);

        const product = await ProductsModel.getProductById(id);
        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }

        await ProductsModel.deleteProduct(id);

        return sendResponse(res, 200, "Product deleted successfully");
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
} //===============================================================================



export default {
    createProduct,
    uploadPictureProduct,
    updateProduct,
    getAllProducts,
    deleteProduct,
    getProductById,
    deleteImageProducts,
    getFavoriteProducts
};