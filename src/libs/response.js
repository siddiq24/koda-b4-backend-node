function sendResponse(res, statusCode, message = "", data = null, error = null) {
    console.log(error)
    res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message: message,
        data: data,
        error: error
    });
}

module.exports = { sendResponse };