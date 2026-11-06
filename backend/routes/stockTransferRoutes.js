
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// 1. CREATE STOCK TRANSFER
router.post("/", async (req, res) => {
    try {
        const {
            source_warehouse_id,
            destination_warehouse_id,
            employee_id,
            items
        } = req.body;

        if (
            !source_warehouse_id ||
            !destination_warehouse_id ||
            source_warehouse_id === destination_warehouse_id
        ) {
            return res.status(400).json({
                error: "Select two different warehouses."
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: "At least one transfer item is required."
            });
        }

        for (const item of items) {
            if (
                !item.product_id ||
                !Number.isInteger(item.quantity) ||
                item.quantity <= 0
            ) {
                return res.status(400).json({
                    error: "Each item needs a product_id and positive integer quantity."
                });
            }
        }

        // Create transfer
        const { data: transfer, error: transferError } =
            await supabase
                .from("stock_transfers")
                .insert([{
                    source_warehouse_id,
                    destination_warehouse_id,
                    employee_id: employee_id || null,
                    status: "Pending"
                }])
                .select()
                .single();

        if (transferError) throw transferError;

        // Create transfer items
        const transferItems = items.map(item => ({
            transfer_id: transfer.transfer_id,
            product_id: item.product_id,
            quantity: item.quantity
        }));

        const { data: savedItems, error: itemsError } =
            await supabase
                .from("stock_transfer_items")
                .insert(transferItems)
                .select();

        if (itemsError) {
            await supabase
                .from("stock_transfers")
                .delete()
                .eq("transfer_id", transfer.transfer_id);

            throw itemsError;
        }

        res.status(201).json({
            message: "Stock transfer created successfully",
            transfer,
            items: savedItems
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 2. GET ALL STOCK TRANSFERS
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("stock_transfer_summary")
            .select("*")
            .order("transfer_id", { ascending: false });

        if (error) throw error;

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 3. GET ONE STOCK TRANSFER WITH DETAILS
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("stock_transfers")
            .select(`
                *,
                source:warehouses!stock_transfers_source_warehouse_id_fkey(name),
                destination:warehouses!stock_transfers_destination_warehouse_id_fkey(name),
                employees(name),
                stock_transfer_items(
                    *,
                    products(name, category, unit)
                )
            `)
            .eq("transfer_id", req.params.id)
            .single();

        if (error) throw error;

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 4. COMPLETE STOCK TRANSFER
router.patch("/:id/complete", async (req, res) => {
    try {
        // Check current transfer
        const { data: existing, error: findError } = await supabase
            .from("stock_transfers")
            .select("transfer_id, status")
            .eq("transfer_id", req.params.id)
            .single();

        if (findError) throw findError;

        if (existing.status !== "Pending") {
            return res.status(400).json({
                error: "Only Pending transfers can be completed."
            });
        }

        // Update status.
        // PostgreSQL trigger moves the inventory automatically.
        const { data, error } = await supabase
            .from("stock_transfers")
            .update({ status: "Completed" })
            .eq("transfer_id", req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: "Stock transfer completed. Inventory updated automatically.",
            transfer: data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
