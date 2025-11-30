import { userModel } from '../models/user.model.js';
import { validationResult } from 'express-validator';
import hash from '../libs/hashPassword.js';
import jwt from 'jsonwebtoken';
import sendResponse from "../libs/response.js";
import serialize from '../libs/serialize.js';

/**
 * POST /auth/register
 * @summary Register a new user
 * @tags Auth
 * @param {object} request.body.required - User registration data
 * @example request - Example user data
 * {
 *   "username": "user1",
 *   "email": "user1@example.com",
 *   "password": "Password123"
 * }
 * @return {object} 201 - User registered successfully
 * @return {object} 400 - Email already exists
 */
async function register(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return sendResponse(res, 400, "Invalide input", null, errors)
    }

    try {
        const { username, email, password } = req.body;

        const hashedPassword = await hash.hashPassword(password);

        const existing = await userModel.findUserByEmail(email);
        if (existing) {
            return sendResponse(res, 400, "Email already exists");
        }

        const newUser = await userModel.register({
            username,
            email,
            password: hashedPassword,
        });

        return sendResponse(res, 201, "User registered successfully", newUser);
    } catch (error) {
        return sendResponse(res, 500, error.message,, error);
    }
}


/**
 * POST /auth/login
 * @summary Login a user
 * @tags Auth
 * @param {object} request.body.required - User login data
 * @example request - Example user login data
 * {
 *   "email": "example@example.com",
 *   "password": "yourpassword"
 * }
 * @return {object} 200 - User logged in successfully
 * @return {object} 401 - Invalid email or password
 */
async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);
    if (!user) {
        return sendResponse(res, 401, "Invalid email or password");
    }

    const isPasswordValid = await hash.comparePassword(password, user.password);
    if (!isPasswordValid) {
        return sendResponse(res, 401, "Invalid email or password");
    }

    const token = jwt.sign(
        { id: Number(user.id), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({
        success: true,
        message: "User logged in successfully",
        token: token,
        data: serialize(user),
    });
}


export default { register, login };
