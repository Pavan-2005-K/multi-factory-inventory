
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Plus,
  Eye,
  ArrowLeftRight,
  CheckCircle,
  X,
  Trash2
} from "lucide-react";

function StockTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const [formData, setFormData] = useState({
    source_warehouse_id: "",
    destination_warehouse_id: "",
    employee_id: "",
    items: [
      {
        product_id: "",
        quantity: ""
      }
    ]
  });

  // Fetch transfers and dropdown data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [transferRes, warehouseRes, productRes] =
        await Promise.all([
          API.get("/stock-transfers"),
          API.get("/warehouses"),
          API.get("/products")
        ]);

      setTransfers(transferRes.data.data || transferRes.data);
      setWarehouses(warehouseRes.data.data || warehouseRes.data);
      setProducts(productRes.data.data || productRes.data);

    } catch (err) {
      console.error(err);
      alert("Failed to load stock transfer information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle product rows
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = value;

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Add product row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: "",
          quantity: ""
        }
      ]
    });
  };

  // Remove product row
  const removeItem = (index) => {
    if (formData.items.length === 1) {
      alert("At least one product is required.");
      return;
    }

    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      source_warehouse_id: "",
      destination_warehouse_id: "",
      employee_id: "",
      items: [
        {
          product_id: "",
          quantity: ""
        }
      ]
    });
  };

  // Create stock transfer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      Number(formData.source_warehouse_id) ===
      Number(formData.destination_warehouse_id)
    ) {
      alert("Source and destination warehouses must be different.");
      return;
    }

    const items = formData.items.map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity)
    }));

    if (items.some(item =>
      !Number.isInteger(item.product_id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    )) {
      alert("Please select products and enter valid quantities.");
      return;
    }

    const productIds = items.map(item => item.product_id);

    if (new Set(productIds).size !== productIds.length) {
      alert("Please select each product only once in a transfer.");
      return;
    }

    const payload = {
      source_warehouse_id: Number(formData.source_warehouse_id),
      destination_warehouse_id: Number(formData.destination_warehouse_id),
      employee_id: formData.employee_id
        ? Number(formData.employee_id)
        : null,
      items
    };

    try {
      await API.post("/stock-transfers", payload);

      alert("Stock transfer created successfully!");

      setShowModal(false);
      resetForm();
      fetchData();

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Failed to create stock transfer."
      );
    }
  };

  // View transfer details
  const viewTransfer = async (id) => {
    try {
      const response = await API.get(`/stock-transfers/${id}`);

      setSelectedTransfer(response.data.data || response.data);

    } catch (err) {
      console.error(err);
      alert("Unable to load transfer details.");
    }
  };

  // Complete transfer
  const completeTransfer = async (id) => {
    const confirmed = window.confirm(
      "Complete this transfer? Stock will be deducted from the source and added to the destination."
    );

    if (!confirmed) return;

    try {
      await API.patch(`/stock-transfers/${id}/complete`);

      alert("Transfer completed! Inventory has been updated.");

      setSelectedTransfer(null);
      fetchData();

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Failed to complete transfer. Check source warehouse stock."
      );
    }
  };

  return (
    <div className="dashboard">

      <div className="page-header">
        <div>
          <h1>Stock Transfers</h1>
          <p>Transfer products between warehouses and factories.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Create Transfer
        </button>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon blue">
            <ArrowLeftRight size={23} />
          </div>

          <div>
            <p>Total Transfers</p>
            <h2>{transfers.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <CheckCircle size={23} />
          </div>

          <div>
            <p>Pending Transfers</p>
            <h2>
              {transfers.filter(
                transfer => transfer.status === "Pending"
              ).length}
            </h2>
          </div>
        </div>

      </div>

      <div className="table-card">

        <div className="table-header">
          <h2>All Stock Transfers</h2>
          <span>{transfers.length} Transfers</span>
        </div>

        {loading ? (
          <p className="loading-text">Loading transfers...</p>
        ) : transfers.length === 0 ? (
          <p className="loading-text">No stock transfers found.</p>
        ) : (
          <div className="table-container">

            <table>
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>Source Warehouse</th>
                  <th>Destination Warehouse</th>
                  <th>Transfer Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {transfers.map(transfer => (
                  <tr key={transfer.transfer_id}>
                    <td>#{transfer.transfer_id}</td>

                    <td>{transfer.source_warehouse_name || "-"}</td>

                    <td>{transfer.destination_warehouse_name || "-"}</td>

                    <td>
                      {transfer.transfer_date
                        ? new Date(transfer.transfer_date).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <span className={`status-badge ${
                        transfer.status === "Completed"
                          ? "good"
                          : transfer.status === "Pending"
                          ? "low"
                          : ""
                      }`}>
                        {transfer.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        title="View transfer"
                        onClick={() => viewTransfer(transfer.transfer_id)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

      </div>

      {/* Create Transfer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal purchase-modal">

            <div className="modal-header">
              <h2>Create Stock Transfer</h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Source Warehouse</label>
              <select
                name="source_warehouse_id"
                value={formData.source_warehouse_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Source Warehouse</option>

                {warehouses.map(warehouse => (
                  <option
                    key={warehouse.warehouse_id}
                    value={warehouse.warehouse_id}
                  >
                    {warehouse.name}
                  </option>
                ))}
              </select>

              <label>Destination Warehouse</label>
              <select
                name="destination_warehouse_id"
                value={formData.destination_warehouse_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Destination Warehouse</option>

                {warehouses
                  .filter(warehouse =>
                    String(warehouse.warehouse_id) !==
                    String(formData.source_warehouse_id)
                  )
                  .map(warehouse => (
                    <option
                      key={warehouse.warehouse_id}
                      value={warehouse.warehouse_id}
                    >
                      {warehouse.name}
                    </option>
                  ))}
              </select>

              <label>Employee ID (Optional)</label>
              <input
                type="number"
                name="employee_id"
                min="1"
                placeholder="Enter employee ID"
                value={formData.employee_id}
                onChange={handleChange}
              />

              <div className="purchase-items-heading">
                <h3>Products to Transfer</h3>

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={addItem}
                >
                  <Plus size={15} />
                  Add Product
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div className="purchase-item-row" key={index}>

                  <div>
                    <label>Product</label>

                    <select
                      value={item.product_id}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "product_id",
                          e.target.value
                        )
                      }
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
                  </div>

                  <div>
                    <label>Quantity</label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={e =>
                        handleItemChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="delete-btn remove-item-btn"
                    onClick={() => removeItem(index)}
                    title="Remove product"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>
              ))}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  Create Transfer
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <div className="modal-overlay">

          <div className="modal purchase-modal">

            <div className="modal-header">
              <h2>
                Transfer #{selectedTransfer.transfer_id}
              </h2>

              <button
                className="close-btn"
                onClick={() => setSelectedTransfer(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="order-details">

              <p>
                <strong>Source Warehouse:</strong>{" "}
                {selectedTransfer.source_warehouse?.name || "-"}
              </p>

              <p>
                <strong>Destination Warehouse:</strong>{" "}
                {selectedTransfer.destination_warehouse?.name || "-"}
              </p>

              <p>
                <strong>Employee:</strong>{" "}
                {selectedTransfer.employees?.name || "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedTransfer.status}
              </p>

              <p>
                <strong>Transfer Date:</strong>{" "}
                {selectedTransfer.transfer_date
                  ? new Date(
                      selectedTransfer.transfer_date
                    ).toLocaleDateString()
                  : "-"}
              </p>

            </div>

            <h3>Products in Transfer</h3>

            <div className="table-container">
              <table>

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedTransfer.items || []).map(item => (
                    <tr key={item.transfer_item_id}>
                      <td>{item.products?.name || "-"}</td>
                      <td>{item.quantity}</td>
                      <td>{item.products?.unit || "-"}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {selectedTransfer.status === "Pending" && (
              <div className="modal-actions">

                <button
                  className="primary-btn"
                  onClick={() =>
                    completeTransfer(selectedTransfer.transfer_id)
                  }
                >
                  <CheckCircle size={17} />
                  Complete Transfer
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default StockTransfers;
