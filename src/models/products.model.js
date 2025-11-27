const prisma = require("../libs/prisma");

module.exports = {
    // ============================
    createProduct: async ({ title, description, basePrice, stock, categoryId }) => {
        return await prisma.products.create({
            data: {
                title,
                description,
                basePrice,
                stock,
                categoryId,
            },
        });
    },

    // ============================
    getAllProducts: async () => {
        return await prisma.products.findMany();
    },

    // ============================
    getProductById: async (id) => {
        return await prisma.products.findUnique({
            where: { id },
            include: {
                category: true,
                sizes: {
                    include: { size: true }
                },
                images: true,
            },
        });
    },

    // ============================
    productIsExist: async (title) => {
        const product = await prisma.products.findUnique({
            where: { title },
            select: { id: true },
        });
        return !!product;
    },

    // ============================
    updateProduct: async (id, data) => {
        return await prisma.products.update({
            where: { id },
            data: data,
        });
    },

    // ============================
    addProductImage: async (productId, imageFilename) => {
        return await prisma.productsImages.create({
            data: {
                productId,
                image: imageFilename,
            },
        });
    },
};
