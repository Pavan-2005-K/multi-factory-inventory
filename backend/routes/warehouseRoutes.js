
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// CREATE WAREHOUSE
router.post("/", async (req, res) => {
    try {
        const { name, location, factory_id } = req.body;

        if (!name || !factory_id) {
            return res.status(400).json({
                message: "Name and factory_id are required"
            });
        }

        const { data, error } = await supabase
            .from("warehouses")
            .insert([{ name, location, factory_id }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Warehouse created successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL WAREHOUSES
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("warehouses")
            .select("*")
            .order("warehouse_id");

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET WAREHOUSE BY ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("warehouses")
            .select("*")
            .eq("warehouse_id", req.params.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(404).json({
            message: "Warehouse not found"
        });
    }
});

// GET WAREHOUSES BY FACTORY
router.get("/factory/:factory_id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("warehouses")
            .select("*")
            .eq("factory_id", req.params.factory_id);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE WAREHOUSE
router.put("/:id", async (req, res) => {
    try {
        const { name, location, factory_id } = req.body;

        const { data, error } = await supabase
            .from("warehouses")
            .update({ name, location, factory_id })
            .eq("warehouse_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.json({
            message: "Warehouse updated successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE WAREHOUSE
router.delete("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("warehouses")
            .delete()
            .eq("warehouse_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Warehouse not found"
            });
        }

        res.json({
            message: "Warehouse deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
