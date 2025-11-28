import prisma from '../libs/prisma.config.js';

export const userModel = {
    register: async ({ username, email, password, role = 'user' }) => {
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    email: email,
                    password: password,
                    role: role,
                }
            });
            await tx.profiles.create({
                data: {
                    fullname: username,
                    user_id: user.id,
                }
            });
            return user;
        });

        return newUser;
    },

    findUserByEmail: async (email) => {
        return prisma.users.findUnique({
            where: { email }
        });
    }
};

