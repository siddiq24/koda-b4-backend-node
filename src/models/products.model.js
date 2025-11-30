import prisma from "../libs/prisma.config.js";

const ProductsModel = {
    // ============================
    createProduct: async ({ title, description, basePrice, stock, categoryId, sizes = [] }) => {
        return await prisma.products.create({
            data: {
                title,
                description,
                base_price: parseFloat(basePrice),
                stock: parseInt(stock),
                categories: categoryId
                    ? { connect: { id: parseInt(categoryId) } }
                    : undefined,
                products_sizes: Array.isArray(sizes) && sizes.length > 0
                    ? {
                        create: sizes.map(sizeId => ({ size_id: parseInt(sizeId) }))
                    }
                    : undefined
            },
            include: {
                products_sizes: true,
                categories: true
            }
        });
    },

    // ============================
    getAllProducts: async (filters = {}) => {
        try {
            const {
                page = 1,
                search = '',
                cat,
                minPrice = 0,
                maxPrice = 999999999,
                shortBy = 'id',
                asc = 'asc',
                limit = 10
            } = filters;

            const skip = (page - 1) * limit;
            const orderBy = { [shortBy]: asc };

            const where = {
                AND: [
                    { deleted_at: null },
                    {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } }
                        ]
                    },
                    {
                        base_price: {
                            gte: parseFloat(minPrice),
                            lte: parseFloat(maxPrice)
                        }
                    }
                ]
            };

            if (filters.cat) {
                where.AND.push({
                    category_id: parseFloat(cat)
                });
            }

            const [products, totalCount] = await Promise.all([
                prisma.products.findMany({
                    where,
                    include: {
                        categories: true,
                        products_images: true,
                        products_sizes: {
                            include: {
                                sizes: true
                            }
                        },
                        products_variants: {
                            include: {
                                variants: true
                            }
                        }
                    },
                    orderBy,
                    skip,
                    take: parseInt(limit)
                }),
                prisma.products.count({ where })
            ]);
            console.log(JSON.stringify(where, null, 2));

            return {
                products,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: parseInt(page)
            };
        } catch (error) {
            console.error(error)
        }
    },


    // ============================
    getProductById: async (id) => {
        const product = await prisma.products.findUnique({
            where: { id },
            include: {
                categories: { select: { name: true } },
                products_images: true,
                products_variants: true,
                products_sizes: {
                    include: {
                        sizes: true
                    }
                },
                products_tags: {
                    include: {
                        tags: true
                    }
                }
            }
        });

        const variants = await prisma.products_variants.findMany({
            where: { product_id: id },
            include: { variants: true }
        });
        console.log(product.products_sizes);

        if (!product) return null;
        product.sizes = product.products_sizes.map(ps => ({
            id: ps.sizes.id,
            name: ps.sizes.name,
            additionalPrice: ps.sizes.additional_price
        }))
        product.tags = product.products_tags.map(pt => ({
            id: pt.tags.id,
            name: pt.tags.name
        }))
        product.variants = variants.map(pv => ({
            id: pv.variants.id,
            name: pv.variants.name,
            additionalPrice: pv.variants.additional_price
        }))
        product.products_tags = undefined;
        product.products_sizes = undefined;

        return product;
    },

    async getFavoriteProducts(limit = 10) {
        return await prisma.products.findMany({
            where: {
                is_favorite: true,
                deleted_at: null
            },
            include: {
                categories: true,
                products_images: true,
                products_sizes: {
                    include: {
                        sizes: true
                    }
                }
            },
            take: parseInt(limit)
        });
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
        const productId = typeof id === "bigint" ? id : BigInt(id);

        const updateData = {
            ...data,
            updated_at: new Date()
        };
        console.log(updateData)

        if (data.categoryId !== undefined) {
            updateData.categories = data.categoryId
                ? { connect: { id: parseInt(data.categoryId) } }
                : { disconnect: true };
            delete updateData.categoryId;
        }

        return await prisma.products.update({
            where: { id: productId },
            data: updateData,
            include: {
                categories: true,
                products_sizes: { include: { sizes: true } },
                products_tags: { include: { tags: true } },
                products_variants: { include: { variants: true } },
            }
        });
    },


    // ============================
    addProductImage: async (productId, imageFilename) => {
        return await prisma.products_images.create({
            data: {
                product_id: productId,
                image: imageFilename,
            },
        });
    },

    deleteProductImage: async (productId, imageId) => {
        return await prisma.products_images.deleteMany({
            where: {
                id: imageId,
                product_id: productId
            },
        });
    },

    // ============================
    updateProductSizes: async (productId, sizeIds) => {
        console.log(productId, sizeIds);
        // Hapus semua size lama
        await prisma.products_sizes.deleteMany({
            where: { product_id: productId }
        });

        // Insert size baru (bulk)
        if (sizeIds.length > 0) {
            const data = sizeIds.map(sizeId => ({
                product_id: productId,
                size_id: sizeId
            }));

            await prisma.products_sizes.createMany({
                data
            });
        }
    },

    // ===========================
    updateProductVariants: async (productId, variantIds) => {
        console.log(variantIds);
        // Hapus semua variant lama
        await prisma.products_variants.deleteMany({
            where: { product_id: productId }
        });

        // Insert variant baru (bulk)
        if (variantIds.length > 0) {
            const data = variantIds.map(variantId => ({
                product_id: productId,
                variant_id: variantId
            }));

            await prisma.products_variants.createMany({
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

export default ProductsModel;