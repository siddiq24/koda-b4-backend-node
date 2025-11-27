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
        const products = await prisma.products.findMany({
            where: { deletedAt: null },
            include: {
                category: {
                    select: { id: true, name: true }
                },
                images: {
                    select: { id: true, image: true }
                },
                sizes: {
                    select: {
                        size: {
                            select: { id: true, name: true, additionalPrice: true }
                        }
                    }
                }
            }
        })

        return products;
    },


    // ============================
    getProductById: async (id) => {
        const product = await prisma.products.findUnique({
            where: { id },
            include: {
                category: {
                    select: { id: true, name: true }
                },
                images: {
                    select: { id: true, image: true }
                },
                sizes: {
                    select: {
                        size: {
                            select: { id: true, name: true, additionalPrice: true }
                        }
                    }
                }
            }
        });

        if (!product) return null;
        product.sizes = product.sizes.map(s => s.size);

        return product;
    },

    // ============================
    productIsExist: async (title) => {
        const product = await prisma.products.findFirst({
            where: { title },
            select: { id: true },
        });
        return !!product;
    },

    // ============================
    updateProduct: async (id, data) => {
        return await prisma.products.update({
            where: { id },
            data
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

    // ============================
    updateProductSizes: async (productId, sizeIds) => {
        // Hapus semua size lama
        await prisma.productsSizes.deleteMany({
            where: { productId }
        });

        // Insert size baru (bulk)
        if (sizeIds.length > 0) {
            const data = sizeIds.map(sizeId => ({
                productId,
                sizeId
            }));

            await prisma.productsSizes.createMany({
                data
            });
        }
    },

    // ===========================
    deleteProduct: async (id) => {
        return await prisma.products.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            }
        });
    },

};
