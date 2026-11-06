
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// CREATE SUPPLIER
router.post("/", async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Supplier name is required"
            });
        }

        const { data, error } = await supabase
            .from("suppliers")
            .insert([{ name, phone, email, address }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Supplier created successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL SUPPLIERS
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("suppliers")
            .select("*")
            .order("supplier_id");

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET SUPPLIER BY ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("suppliers")
            .select("*")
            .eq("supplier_id", req.params.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(404).json({
            message: "Supplier not found"
        });
    }
});

// UPDATE SUPPLIER
router.put("/:id", async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        const { data, error } = await supabase
            .from("suppliers")
            .update({ name, phone, email, address })
            .eq("supplier_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        res.json({
            message: "Supplier updated successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE SUPPLIER
router.delete("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("suppliers")
            .delete()
            .eq("supplier_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Supplier not found"
            });
        }

        res.json({
            message: "Supplier deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
