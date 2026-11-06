
import { useEffect, useState } from "react";
import API from "../services/api";
import { Plus, Pencil, X, AlertTriangle, Boxes } from "lucide-react";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);

  const [formData, setFormData] = useState({
    warehouse_id: "",
    product_id: "",
    quantity: "",
    reorder_level: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [inventoryRes, warehouseRes, productRes] =
        await Promise.all([
          API.get("/inventory"),
          API.get("/warehouses"),
          API.get("/products")
        ]);

      setInventory(inventoryRes.data.data || inventoryRes.data);
      setWarehouses(warehouseRes.data.data || warehouseRes.data);
      setProducts(productRes.data.data || productRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      warehouse_id: "",
      product_id: "",
      quantity: "",
      reorder_level: ""
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.inventory_id);
    setFormData({
      warehouse_id: item.warehouse_id,
      product_id: item.product_id,
      quantity: item.quantity,
      reorder_level: item.reorder_level
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      warehouse_id: Number(formData.warehouse_id),
      product_id: Number(formData.product_id),
      quantity: Number(formData.quantity),
      reorder_level: Number(formData.reorder_level)
    };

    try {
      if (editingId) {
        await API.put(`/inventory/${editingId}`, {
          quantity: payload.quantity,
          reorder_level: payload.reorder_level
        });
        alert("Inventory updated successfully!");
      } else {
        await API.post("/inventory", payload);
        alert("Inventory added successfully!");
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Inventory operation failed. Check whether this warehouse already has this product."
      );
      console.error(err);
    }
  };

  const displayedInventory = showLowStock
    ? inventory.filter(item =>
        Number(item.quantity) <= Number(item.reorder_level)
      )
    : inventory;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor product stock across all warehouses.</p>
        </div>

        <button className="primary-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Stock
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Boxes size={23} />
          </div>
          <div>
            <p>Total Stock Records</p>
            <h2>{inventory.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <AlertTriangle size={23} />
          </div>
          <div>
            <p>Low Stock Items</p>
            <h2>
              {inventory.filter(
                item => Number(item.quantity) <= Number(item.reorder_level)
              ).length}
            </h2>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>{showLowStock ? "Low Stock Items" : "Warehouse Inventory"}</h2>

          <button
            className="secondary-btn"
            onClick={() => setShowLowStock(!showLowStock)}
          >
            {showLowStock ? "Show All Stock" : "Show Low Stock"}
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading inventory...</p>
        ) : displayedInventory.length === 0 ? (
          <p className="loading-text">No inventory records found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Factory ID</th>
                  <th>Quantity</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {displayedInventory.map(item => {
                  const isLow =
                    Number(item.quantity) <= Number(item.reorder_level);

                  return (
                    <tr key={item.inventory_id}>
                      <td>#{item.inventory_id}</td>
                      <td>{item.products?.name || "Unknown"}</td>
                      <td>{item.warehouses?.name || "Unknown"}</td>
                      <td>{item.warehouses?.factory_id || "-"}</td>
                      <td>
                        {item.quantity} {item.products?.unit || ""}
                      </td>
                      <td>{item.reorder_level}</td>
                      <td>
                        <span className={`status-badge ${isLow ? "low" : "good"}`}>
                          {isLow ? "Low Stock" : "Available"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(item)}
                          title="Edit stock"
                        >
                          <Pencil size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? "Update Stock" : "Add Stock"}</h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!editingId && (
                <>
                  <label>Warehouse</label>
                  <select
                    name="warehouse_id"
                    value={formData.warehouse_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option
                        key={warehouse.warehouse_id}
                        value={warehouse.warehouse_id}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                  </select>

                  <label>Product</label>
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option
                        key={product.product_id}
                        value={product.product_id}
                      >
                        {product.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                min="0"
                step="any"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                required
              />

              <label>Reorder Level</label>
              <input
                type="number"
                name="reorder_level"
                min="0"
                step="any"
                value={formData.reorder_level}
                onChange={handleChange}
                placeholder="Enter reorder level"
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  {editingId ? "Update Stock" : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
