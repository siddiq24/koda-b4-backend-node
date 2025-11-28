import express from 'express';
import { body, validationResult } from 'express-validator';
import authController from '../controllers/auth.controller.js';

const authRouter = express.Router();

// Middleware untuk menangani error validasi
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    next();
};

authRouter.post(
    '/register',
    [
        body('username')
            .trim()
            .notEmpty().withMessage('Username is required')
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email is not valid'),

        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    validate,
    authController.register
);

authRouter.post(
    '/login',
    [
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Email is not valid'),

        body('password')
            .trim()
            .notEmpty().withMessage('Password is required')
    ],
    validate,
    authController.login
);

export default authRouter;
