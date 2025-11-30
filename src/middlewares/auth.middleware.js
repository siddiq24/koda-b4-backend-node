import jwt from "jsonwebtoken";
import sendResponse from "../libs/response.js";

export default function authenticate(req, res, next) {
    const authHeader = req?.headers?.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing"
        });
    }

    const prefix = "Bearer ";

    if (!authHeader.startsWith(prefix)) {
        return sendResponse(res, 401, "invalid previx")
    }

    const token = authHeader.slice(prefix.length).trim();
    if (!token) {
        return sendResponse(res, 401, "Token missing")
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, "Error ", null, error)
    }
};