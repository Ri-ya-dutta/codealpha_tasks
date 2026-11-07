
const mongoose = require("mongoose");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Inventory = require("../models/Inventory");

const createOrder = async (req, res) => {
    try {
        const { items, table } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "An order must contain at least one item"
            });
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const requestedItem of items) {
            const menuItem = await MenuItem.findById(requestedItem.menuItem);
            const quantity = Number(requestedItem.quantity);

            if (!menuItem || !menuItem.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: "A requested menu item is unavailable"
                });
            }

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Item quantities must be positive integers"
                });
            }

            const lineTotal = menuItem.price * quantity;
            totalAmount += lineTotal;

            orderItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                quantity,
                unitPrice: menuItem.price,
                lineTotal
            });
        }

        const order = await Order.create({
            orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            table: table || undefined,
            items: orderItems,
            totalAmount
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully. Awaiting confirmation.",
            order
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("table", "tableNumber")
            .populate("items.menuItem", "name category")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const confirmOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        let confirmedOrder;

        await session.withTransaction(async () => {
            const order = await Order.findById(req.params.id)
                .session(session)
                .populate({
                    path: "items.menuItem",
                    populate: {
                        path: "ingredients.inventoryItem"
                    }
                });

            if (!order) {
                throw new Error("Order not found");
            }

            if (order.status !== "pending" || order.inventoryDeducted) {
                throw new Error("Order cannot be confirmed in its current state");
            }

            for (const orderItem of order.items) {
                const menuItem = orderItem.menuItem;

                if (!menuItem) {
                    throw new Error("A menu item in this order no longer exists");
                }

                for (const ingredient of menuItem.ingredients) {
                    const requiredQuantity =
                        ingredient.quantity * orderItem.quantity;

                    const inventoryItem = await Inventory.findOneAndUpdate(
                        {
                            _id: ingredient.inventoryItem?._id,
                            quantity: { $gte: requiredQuantity }
                        },
                        {
                            $inc: { quantity: -requiredQuantity }
                        },
                        {
                            new: true,
                            session
                        }
                    );

                    if (!inventoryItem) {
                        throw new Error(
                            `Insufficient stock for ${ingredient.inventoryItem?.name || "an ingredient"}`
                        );
                    }
                }
            }

            order.status = "confirmed";
            order.inventoryDeducted = true;
            await order.save({ session });

            confirmedOrder = order;
        });

        res.json({
            success: true,
            message: "Order confirmed and inventory updated",
            order: confirmedOrder
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    } finally {
        await session.endSession();
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const allowedStatuses = ["preparing", "ready", "served"];
        const { status, paymentStatus } = req.body;

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        if (paymentStatus && !["unpaid", "paid"].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status"
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (status) {
            if (order.status === "pending" || order.status === "cancelled") {
                return res.status(400).json({
                    success: false,
                    message: "Confirm the order before changing its processing status"
                });
            }

            if (order.status === "served") {
                return res.status(400).json({
                    success: false,
                    message: "A served order cannot be changed"
                });
            }

            order.status = status;
        }

        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        res.json({
            success: true,
            message: "Order updated",
            order
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    confirmOrder,
    updateOrderStatus
};
