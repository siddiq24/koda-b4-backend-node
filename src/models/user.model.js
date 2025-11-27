const prisma = require('../libs/prisma');

module.exports = {
    register: async ({ email, password }) => {
        const newUser = await prisma.users.create({
            data: {
                email: email,
                password: password,
                role: 'user',
                created_at: new Date(),
            }
        });
        return newUser;
    },

    findUserByEmail: async (email) => {
        return prisma.users.findUnique({
            where: { email }
        });
    }
};

