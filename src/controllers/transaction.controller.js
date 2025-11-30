import sendResponse from '../libs/response.js';
import transactionModel from '../models/transaction.model.js';

async function checkout(req, res) {
    try {
        const userId = req.user.id;
        const checkoutData = req.body;

        const order = await transactionModel.checkout(userId, checkoutData);

        return sendResponse(res, 200, "Checkout successfully", order);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

async function getOrderHistory(req, res) {
    try {
        const userId = req.user.id;
        const filters = req.query;

        const result = await transactionModel.getOrderHistory(userId, filters);

        return sendResponse(res, 200, "Orders history retrieved successfully", result);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

async function getOrderDetail(req, res) {
    try {
        const userId = req.user.id;
        const { invoice } = req.params;

        const order = await transactionModel.getOrderDetail(userId, invoice);

        if (!order) {
            return sendResponse(res, 404, "Order not found");
        }

        return sendResponse(res, 200, "Get Order Detail successfully", order);
    } catch (error) {
        return sendResponse(res, 500, "Server error", null, error.message);
    }
}

export default {
    checkout,
    getOrderHistory,
    getOrderDetail
};