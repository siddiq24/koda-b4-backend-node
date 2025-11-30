import sendResponse from "../libs/response.js";
import profileModel from "../models/profile.model.js";

async function getProfile(req, res) {
    try {
        const userId = req.user.id;

        const profile = await profileModel.getProfile(userId);

        if (!profile) {
            return sendResponse(res, 404, 'User not found');
        }

        sendResponse(res, 200, 'Profile retrieved successfully', profile);
    } catch (error) {
        sendResponse(res, 500, 'Failed to get profile', null, error.message);
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { full_name, phone, address } = req.body;

        if (!full_name && !phone && !address) {
            return sendResponse(res, 400, 'At least one field is required for update');
        }

        if (phone) {
            const phoneExists = await profileModel.checkPhoneExists(phone, userId);
            if (phoneExists) {
                return sendResponse(res, 400, 'Phone number already exists');
            }
        }

        const updatedProfile = await profileModel.updateProfile(userId, {
            full_name,
            phone,
            address
        });

        sendResponse(res, 200, 'Profile updated successfully', updatedProfile);
    } catch (error) {
        sendResponse(res, 500, 'Failed to update profile', null, error.message);
    }
}

async function updateProfileImage(req, res) {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return sendResponse(res, 400, 'No image file provided');
        }

        const imagePath = `/uploads/${req.file.filename}`;

        const updatedProfile = await profileModel.updateProfileImage(userId, imagePath);

        sendResponse(res, 200, 'Profile image updated successfully', updatedProfile);
    } catch (error) {
        sendResponse(res, 500, 'Failed to update profile image', null, error.message);
    }
}


export default {
    getProfile,
    updateProfile,
    updateProfileImage
};