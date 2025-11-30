import prisma from '../libs/prisma.config.js';

const cartModel = {
    addToCart: async (userId, cartData) => {
        const { productId, sizeId, quantity, varianId } = cartData;

        // Get product details
        const product = await prisma.products.findUnique({
            where: { id: BigInt(productId) },
            include: {
                products_sizes: {
                    where: { size_id: sizeId },
                    include: { sizes: true }
                },
                products_variants: {
                    where: { variant_id: varianId },
                    include: { variants: true }
                }
            }
        });

        if (!product) {
            throw new Error('Product not found');
        }

        // Calculate subtotal
        let subtotal = parseFloat(product.base_price);

        // Add size additional price
        if (product.products_sizes[0]) {
            subtotal += parseFloat(product.products_sizes[0].sizes.additional_price);
        }

        // Add variant additional price
        if (varianId && product.products_variants[0]) {
            subtotal += parseFloat(product.products_variants[0].variants.additional_price);
        }

        subtotal *= quantity;

        // Check if item already in cart
        const existingCart = await prisma.carts.findFirst({
            where: {
                user_id: BigInt(userId),
                product_id: BigInt(productId),
                size_id: sizeId,
                varian_id: varianId
            }
        });

        if (existingCart) {
            // Update existing cart item
            return await prisma.carts.update({
                where: { id: existingCart.id },
                data: {
                    qty: existingCart.qty + quantity,
                    subtotal: existingCart.subtotal + subtotal
                },
                include: {
                    products: {
                        include: {
                            products_images: true
                        }
                    },
                    sizes: true,
                    variants: true
                }
            });
        } else {
            // Create new cart item
            return await prisma.carts.create({
                data: {
                    user_id: BigInt(userId),
                    product_id: BigInt(productId),
                    size_id: sizeId,
                    varian_id: varianId,
                    qty: quantity,
                    subtotal: subtotal,
                    product_name: product.title
                },
                include: {
                    products: {
                        include: {
                            products_images: true
                        }
                    },
                    sizes: true,
                    variants: true
                }
            });
        }
    },
    getCartList: async (userId) => {
        return await prisma.carts.findMany({
            where: {
                user_id: BigInt(userId)
            },
            include: {
                products: {
                    include: {
                        products_images: true
                    }
                },
                sizes: true,
                variants: true
            },
            orderBy: {
                id: 'desc'
            }
        })
    },

    getCartDetail: async (userId, cartId) => {
        return await prisma.carts.findFirst({
            where: {
                id: BigInt(cartId),
                user_id: BigInt(userId)
            },
            include: {
                products: {
                    include: {
                        products_images: true,
                        categories: true,
                        products_sizes: {
                            include: { sizes: true }
                        },
                        products_variants: {
                            include: { variants: true }
                        }
                    }
                },
                sizes: true,
                variants: true
            }
        });
    }
}


export default cartModel;