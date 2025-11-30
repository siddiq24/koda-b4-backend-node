import prisma from '../libs/prisma.config.js'

const transactionModel = {
    checkout: async (userId, checkoutData) => {
        const { address, phone, email, payment_method_id, delivery_id } = checkoutData;

        const order = await prisma.$transaction(async (tx) => {
            const cartItems = await tx.carts.findMany({
                where: { user_id: BigInt(userId) },
                include: {
                    products: true,
                    sizes: true,
                    variants: true
                }
            });

            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            const totalOrder = cartItems.reduce((total, item) => {
                return total + parseFloat(item.subtotal);
            }, 0);

            const invoice = `VIA-${Date.now()}-${userId}`;

            const order = await tx.orders.create({
                data: {
                    user_id: BigInt(userId),
                    email,
                    phone,
                    address,
                    payment_method_id: parseInt(payment_method_id),
                    delivery_id: parseInt(delivery_id),
                    total_order: totalOrder,
                    invoice,
                    status_id: 1
                }
            });

            const orderProductsData = cartItems.map(item => ({
                invoice,
                product_id: item.product_id,
                size_id: item.size_id,
                varian_id: item.varian_id,
                qty: item.qty,
                subtotal: item.subtotal,
                name: item.product_name
            }));

            await tx.orders_products.createMany({
                data: orderProductsData
            });

            await tx.carts.deleteMany({
                where: { user_id: BigInt(userId) }
            });

            return order
        });


        return await prisma.orders.findUnique({
            where: { id: order.id },
            include: {
                ordersProducts: {
                    include: {
                        products: {
                            include: {
                                products_images: true
                            }
                        },
                        sizes: true,
                        variants: true
                    }
                },
                payment_methods: true,
                deliveries: true,
                status: true
            }
        });
    },

    getOrderHistory: async (userId, filters = {}) => {
        const {
            limit = 10,
            page = 1,
            status = '',
            month = ''
        } = filters;

        const skip = (page - 1) * limit;

        const where = {
            user_id: BigInt(userId)
        };

        if (status) {
            where.status_id = parseInt(status);
        }

        if (month) {
            const year = new Date().getFullYear();
            where.created_at = {
                gte: new Date(year, parseInt(month) - 1, 1),
                lt: new Date(year, parseInt(month), 1)
            };
        }

        const [orders, totalCount] = await Promise.all([
            prisma.orders.findMany({
                where,
                include: {
                    ordersProducts: {
                        include: {
                            products: {
                                include: {
                                    products_images: true
                                }
                            }
                        }
                    },
                    payment_methods: true,
                    deliveries: true,
                    status: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.orders.count({ where })
        ]);

        return {
            orders,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page)
        };
    },

    getOrderDetail: async (userId, invoice) => {
        return await prisma.orders.findFirst({
            where: {
                invoice,
                user_id: BigInt(userId)
            },
            include: {
                ordersProducts: {
                    include: {
                        products: {
                            include: {
                                products_images: true
                            }
                        },
                        sizes: true,
                        variants: true
                    }
                },
                payment_methods: true,
                deliveries: true,
                status: true,
                users: {
                    include: {
                        profiles: true
                    }
                }
            }
        });
    }
}

export default transactionModel;