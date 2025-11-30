import sendResponse from "../libs/response.js";
import cartModel from '../models/cart.model.js';

async function addToCart(req, res) {
    try {
        const userId = req.user.id;
        const cartData = req.body;

        const cartItem = await cartModel.addToCart(userId, cartData);

        return sendResponse(res, 200, "Products retrieved successfully", cartItem);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

async function getCartList(req, res) {
    try {
        const userId = req.user.id;
        const cartItems = await cartModel.getCartList(userId);

        return sendResponse(res, 200, "Products retrieved successfully", cartItems);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

async function getCartDetail(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const cartItem = await cartModel.getCartDetail(userId, id);

        if (!cartItem) {
            return sendResponse(res, 404, 'Cart item not found')
        }

        return sendResponse(res, 200, "Detail cart retrieved successfully", cartItem);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}



export default {
    addToCart,
    getCartDetail,
    getCartList
};