
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// GET factory-wise inventory report
router.get("/factory/:factory_id", async (req, res) => {
  try {
    const factoryId = Number(req.params.factory_id);

    if (!Number.isInteger(factoryId) || factoryId <= 0) {
      return res.status(400).json({
        message: "Invalid factory ID"
      });
    }

    const { data, error } = await supabase
      .from("inventory")
      .select(`
        inventory_id,
        warehouse_id,
        product_id,
        quantity,
        reorder_level,
        warehouses!inner (
          name,
          factory_id
        ),
        products (
          name,
          category,
          unit
        )
      `)
      .eq("warehouses.factory_id", factoryId)
      .order("inventory_id", { ascending: true });

    if (error) throw error;

    const inventory = data || [];

    const totalRecords = inventory.length;

    const lowStockRecords = inventory.filter(
      item => Number(item.quantity) <= Number(item.reorder_level)
    ).length;

    const totalQuantity = inventory.reduce(
      (sum, item) => sum + Number(item.quantity),
      0
    );

    const warehouseCount = new Set(
      inventory.map(item => item.warehouse_id)
    ).size;

    res.status(200).json({
      message: "Factory inventory report generated successfully",
      summary: {
        totalRecords,
        lowStockRecords,
        totalQuantity,
        warehouseCount
      },
      data: inventory
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
