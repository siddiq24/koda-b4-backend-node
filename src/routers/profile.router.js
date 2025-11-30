import express from 'express';
const router = express.Router();
import { body } from 'express-validator';

import authenticate from '../middlewares/auth.middleware.js';
import profileController from '../controllers/profile.controller.js';
import upload from '../libs/upload.js';
router.use(authenticate)


//==============================
// GET PROFILE DETAILS
//==============================
router.get('/', profileController.getProfile);

//==============================
// UPDATE PROFILE
//==============================
router.patch('/', profileController.updateProfile);

//==============================
// UPDATE IMAGE PROFILE
//==============================
router.post('/image', upload.single('image'), profileController.updateProfileImage);


export default router