
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// ADD INVENTORY
router.post("/", async (req, res) => {
    try {
        const { warehouse_id, product_id, quantity, reorder_level } = req.body;

        if (
            warehouse_id == null ||
            product_id == null ||
            quantity == null
        ) {
            return res.status(400).json({
                message: "warehouse_id, product_id and quantity are required"
            });
        }

        const { data, error } = await supabase
            .from("inventory")
            .insert([{
                warehouse_id,
                product_id,
                quantity,
                reorder_level: reorder_level ?? 10
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Inventory added successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL INVENTORY
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("inventory")
            .select(`
                *,
                warehouses(name, factory_id),
                products(name, category, unit)
            `)
            .order("inventory_id");

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET INVENTORY BY WAREHOUSE
router.get("/warehouse/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("inventory")
            .select(`
                *,
                products(name, category, unit)
            `)
            .eq("warehouse_id", req.params.id);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET INVENTORY BY FACTORY
router.get("/factory/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("inventory")
            .select(`
                *,
                warehouses!inner(factory_id, name),
                products(name, category, unit)
            `)
            .eq("warehouses.factory_id", req.params.id);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET LOW STOCK
router.get("/low-stock", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("low_stock_view")
            .select("*");

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE INVENTORY
router.put("/:id", async (req, res) => {
    try {
        const { quantity, reorder_level } = req.body;

        const { data, error } = await supabase
            .from("inventory")
            .update({ quantity, reorder_level })
            .eq("inventory_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Inventory record not found"
            });
        }

        res.json({
            message: "Inventory updated successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
