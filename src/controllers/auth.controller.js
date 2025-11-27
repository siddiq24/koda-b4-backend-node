const userModel = require('../models/user.model');
const { validationResult } = require('express-validator');
const { hashPassword, comparePassword } = require('../libs/hashPassword');
const jwt = require('jsonwebtoken');

/**
 * POST /auth/register
 * @summary Register a new user
 * @tags Auth
 * @param {object} request.body.required - User registration data
 * @example request - Example user data
 * {
 *   "email": "example@example.com",
 *   "password": "yourpassword"
 * }
 * @return {object} 201 - User registered successfully
 * @return {object} 400 - Email already exists
 */
async function register(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(400).json({
            success: false,
            message: "Invalid input",
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;

        const hashedPassword = await hashPassword(password);

        const existing = await userModel.findUserByEmail(email);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        const newUser = await userModel.register({
            email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({
        success: true,
        message: "Login successful",
        token: `Bearer ${token}`,
        data: user
    });
}


module.exports = { register, login };
