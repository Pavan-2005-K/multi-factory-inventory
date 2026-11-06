
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// CREATE FACTORY
router.post("/", async (req, res) => {
    try {
        const { name, location } = req.body;

        if (!name || !location) {
            return res.status(400).json({
                message: "Name and location are required"
            });
        }

        const { data, error } = await supabase
            .from("factories")
            .insert([{ name, location }])
            .select();

        if (error) throw error;

        res.status(201).json({
            message: "Factory created successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL FACTORIES
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("factories")
            .select("*")
            .order("factory_id");

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET FACTORY BY ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("factories")
            .select("*")
            .eq("factory_id", req.params.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(404).json({ error: "Factory not found" });
    }
});

// UPDATE FACTORY
router.put("/:id", async (req, res) => {
    try {
        const { name, location } = req.body;

        const { data, error } = await supabase
            .from("factories")
            .update({ name, location })
            .eq("factory_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Factory not found"
            });
        }

        res.json({
            message: "Factory updated successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE FACTORY
router.delete("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("factories")
            .delete()
            .eq("factory_id", req.params.id)
            .select();

        if (error) throw error;

        if (!data.length) {
            return res.status(404).json({
                message: "Factory not found"
            });
        }

        res.json({
            message: "Factory deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
