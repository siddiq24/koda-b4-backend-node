import serialize from './serialize.js';

function sendResponse(res, statusCode, message, data = null, error = null) {
    console.log(error);
    res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        data: serialize(data),
        error: serialize(error),
    });
}

export default sendResponse;