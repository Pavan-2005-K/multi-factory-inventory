
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const factoryRoutes = require("./routes/factoryRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const stockTransferRoutes = require("./routes/stockTransferRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const reportRoutes = require("./routes/reportRoutes");







// Register routes
app.use("/api/factories", factoryRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseRoutes);
app.use("/api/stock-transfers", stockTransferRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/reports", reportRoutes);











// Home
app.get("/", (req, res) => {
    res.json({
        message: "Multi-Factory Inventory Backend Running"
    });
});

// Test warehouse route
app.get("/api/warehouse-test", (req, res) => {
    res.json({
        message: "Warehouse routes are connected"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
