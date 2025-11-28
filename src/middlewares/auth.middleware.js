import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing"
        });
    }

    const prefix = "Bearer ";

    if (!authHeader.startsWith(prefix)) {
        return res.status(401).json({
            success: false,
            message: "Invalid prefix"
        });
    }

    const token = authHeader.slice(prefix.length).trim();
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token missing"
        });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};