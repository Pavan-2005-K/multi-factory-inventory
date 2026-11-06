
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// CREATE PURCHASE ORDER WITH ITEMS
router.post("/", async (req, res) => {
    try {
        const {
            supplier_id,
            warehouse_id,
            employee_id,
            items
        } = req.body;

        if (!supplier_id || !warehouse_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "supplier_id, warehouse_id and items are required"
            });
        }

        // Create purchase order
        const { data: order, error: orderError } = await supabase
            .from("purchase_orders")
            .insert([{
                supplier_id,
                warehouse_id,
                employee_id: employee_id ?? null,
                status: "Pending"
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // Create purchase order items
        const orderItems = items.map(item => ({
            po_id: order.po_id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }));

        const { data: insertedItems, error: itemsError } = await supabase
            .from("purchase_order_items")
            .insert(orderItems)
            .select();

        if (itemsError) {
            // Remove order if item insertion fails
            await supabase
                .from("purchase_orders")
                .delete()
                .eq("po_id", order.po_id);

            throw itemsError;
        }

        res.status(201).json({
            message: "Purchase order created successfully",
            order,
            items: insertedItems
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL PURCHASE ORDERS
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("purchase_order_summary")
            .select("*")
            .order("po_id", { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET PURCHASE ORDER DETAILS
router.get("/:id", async (req, res) => {
    try {
        const { data: order, error: orderError } = await supabase
            .from("purchase_orders")
            .select(`
                *,
                suppliers(name, phone, email),
                warehouses(name, factory_id),
                employees(name)
            `)
            .eq("po_id", req.params.id)
            .single();

        if (orderError) throw orderError;

        const { data: items, error: itemsError } = await supabase
            .from("purchase_order_items")
            .select(`
                *,
                products(name, category, unit)
            `)
            .eq("po_id", req.params.id);

        if (itemsError) throw itemsError;

        res.json({ order, items });
    } catch (error) {
        res.status(404).json({
            message: "Purchase order not found",
            error: error.message
        });
    }
});

// RECEIVE PURCHASE ORDER
router.patch("/:id/receive", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("purchase_orders")
            .update({ status: "Received" })
            .eq("po_id", req.params.id)
            .eq("status", "Pending")
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(400).json({
                message: "Order not found or already received"
            });
        }

        // PostgreSQL trigger updates inventory automatically
        res.json({
            message: "Purchase order received. Inventory updated automatically.",
            data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
