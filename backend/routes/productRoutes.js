
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// CREATE PRODUCT
router.post("/", async (req, res) => {
    try {
        const { name, category, unit } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Product name is required"
            });
        }

        const { data, error } = await supabase
            .from("products")
            .insert([{ name, category, unit }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Product created successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("product_id");

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET PRODUCT BY ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("product_id", req.params.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(404).json({
            message: "Product not found"
        });
    }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
    try {
        const { name, category, unit } = req.body;

        const { data, error } = await supabase
            .from("products")
            .update({ name, category, unit })
            .eq("product_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .delete()
            .eq("product_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
