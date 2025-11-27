const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');

router.post('/register',
    body('email').
        trim().
        notEmpty().withMessage('Email is required').
        isEmail().withMessage('Email is not valid'),
    body('password').
        trim().
        notEmpty().withMessage('Password is required').
        isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    authController.register);

router.post('/login',
    body('email').
        trim().
        notEmpty().withMessage('Email is required').
        isEmail().withMessage('Email is not valid'),
    body('password').
        trim().
        notEmpty().withMessage('Password is required'),
    authController.login);

module.exports = router;