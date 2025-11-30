import prisma from '../libs/prisma.config.js';
import fs from 'fs';
import path from 'path';

const profileModel = {
    getProfile: async (userId) => {
        return await prisma.users.findUnique({
            where: {
                id: BigInt(userId),
                deleted_at: null
            },
            select: {
                id: true,
                email: true,
                role: true,
                created_at: true,
                profiles: {
                    select: {
                        id: true,
                        fullname: true,
                        image: true,
                        phone: true,
                        address: true
                    }
                }
            }
        });
    },

    updateProfile: async (userId, profileData) => {
        const { full_name, phone, address } = profileData;

        const existingProfile = await prisma.profiles.findFirst({
            where: { user_id: BigInt(userId) }
        });

        if (existingProfile) {
            return await prisma.profiles.update({
                where: { id: existingProfile.id },
                data: {
                    fullname: full_name,
                    phone,
                    address
                },
                select: {
                    id: true,
                    fullname: true,
                    image: true,
                    phone: true,
                    address: true
                }
            });
        } else {
            return await prisma.profiles.create({
                data: {
                    user_id: BigInt(userId),
                    fullname: full_name,
                    phone,
                    address
                },
                select: {
                    id: true,
                    fullname: true,
                    image: true,
                    phone: true,
                    address: true
                }
            });
        }
    },

    updateProfileImage: async (userId, imagePath) => {
        const currentProfile = await prisma.profiles.findFirst({
            where: { user_id: BigInt(userId) }
        });

        if (currentProfile && currentProfile.image) {
            const oldImagePath = path.join('/tmp/uploads/', path.basename(currentProfile.image));
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        if (currentProfile) {
            return await prisma.profiles.update({
                where: { id: currentProfile.id },
                data: {
                    image: imagePath
                },
                select: {
                    id: true,
                    fullname: true,
                    image: true,
                    phone: true,
                    address: true
                }
            });
        } else {
            return await prisma.profiles.create({
                data: {
                    user_id: BigInt(userId),
                    image: imagePath
                },
                select: {
                    id: true,
                    fullname: true,
                    image: true,
                    phone: true,
                    address: true
                }
            });
        }
    },

    checkPhoneExists: async (phone, userId) => {
        return await prisma.profiles.findFirst({
            where: {
                phone,
                user_id: {
                    not: BigInt(userId)
                }
            }
        });
    }
}

export default profileModel;