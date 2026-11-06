
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Plus,
  Eye,
  PackageCheck,
  X,
  Trash2,
  ShoppingCart
} from "lucide-react";

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({
    supplier_id: "",
    warehouse_id: "",
    employee_id: "",
    items: [
      {
        product_id: "",
        quantity: "",
        unit_price: ""
      }
    ]
  });

  // Fetch purchase orders and dropdown data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        orderRes,
        supplierRes,
        warehouseRes,
        productRes
      ] = await Promise.all([
        API.get("/purchase-orders"),
        API.get("/suppliers"),
        API.get("/warehouses"),
        API.get("/products")
      ]);

      setOrders(orderRes.data.data || orderRes.data);
      setSuppliers(supplierRes.data.data || supplierRes.data);
      setWarehouses(warehouseRes.data.data || warehouseRes.data);
      setProducts(productRes.data.data || productRes.data);

    } catch (err) {
      console.error(err);
      alert("Failed to load purchase order information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle main form fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle product item fields
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    updatedItems[index][field] = value;

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Add another product row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: "",
          quantity: "",
          unit_price: ""
        }
      ]
    });
  };

  // Remove a product row
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

  // Calculate total amount
  const totalAmount = formData.items.reduce((total, item) => {
    return total +
      Number(item.quantity || 0) *
      Number(item.unit_price || 0);
  }, 0);

  // Create purchase order
  const handleSubmit = async (e) => {
    e.preventDefault();

    const items = formData.items.map(item => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price)
    }));

    if (items.some(item =>
      !Number.isInteger(item.product_id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      !Number.isFinite(item.unit_price) ||
      item.unit_price < 0
    )) {
      alert("Please select products and enter valid quantities and prices.");
      return;
    }

    const productIds = items.map(item => item.product_id);

    if (new Set(productIds).size !== productIds.length) {
      alert("Please select each product only once in an order.");
      return;
    }

    const payload = {
      supplier_id: Number(formData.supplier_id),
      warehouse_id: Number(formData.warehouse_id),
      employee_id: formData.employee_id
        ? Number(formData.employee_id)
        : null,
      items
    };

    try {
      await API.post("/purchase-orders", payload);

      alert("Purchase order created successfully!");

      setShowModal(false);

      setFormData({
        supplier_id: "",
        warehouse_id: "",
        employee_id: "",
        items: [
          {
            product_id: "",
            quantity: "",
            unit_price: ""
          }
        ]
      });

      fetchData();

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Failed to create purchase order."
      );
    }
  };

  // View order details
  const viewOrder = async (id) => {
    try {
      const response = await API.get(`/purchase-orders/${id}`);

      setSelectedOrder(response.data.data || response.data);
    } catch (err) {
      console.error(err);
      alert("Unable to load purchase order details.");
    }
  };

  // Receive purchase order
  const receiveOrder = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to receive this order? Inventory will be updated automatically."
    );

    if (!confirmed) return;

    try {
      await API.patch(`/purchase-orders/${id}/receive`);

      alert("Purchase order received! Inventory has been updated.");

      setSelectedOrder(null);
      fetchData();

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Failed to receive purchase order."
      );
    }
  };

  return (
    <div className="dashboard">

      <div className="page-header">
        <div>
          <h1>Purchase Orders</h1>
          <p>Create and manage supplier purchase orders.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          Create Purchase Order
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <ShoppingCart size={23} />
          </div>
          <div>
            <p>Total Orders</p>
            <h2>{orders.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <PackageCheck size={23} />
          </div>
          <div>
            <p>Pending Orders</p>
            <h2>
              {orders.filter(order => order.status === "Pending").length}
            </h2>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>All Purchase Orders</h2>
          <span>{orders.length} Orders</span>
        </div>

        {loading ? (
          <p className="loading-text">Loading purchase orders...</p>
        ) : orders.length === 0 ? (
          <p className="loading-text">No purchase orders found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Warehouse</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map(order => (
                  <tr key={order.po_id}>
                    <td>#{order.po_id}</td>
                    <td>{order.supplier_name || "-"}</td>
                    <td>{order.warehouse_name || "-"}</td>
                    <td>
                      {order.order_date
                        ? new Date(order.order_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <span className={`status-badge ${
                        order.status === "Received"
                          ? "good"
                          : order.status === "Pending"
                          ? "low"
                          : ""
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        title="View details"
                        onClick={() => viewOrder(order.po_id)}
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

      {/* Create Purchase Order Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal purchase-modal">

            <div className="modal-header">
              <h2>Create Purchase Order</h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option
                    key={supplier.supplier_id}
                    value={supplier.supplier_id}
                  >
                    {supplier.name}
                  </option>
                ))}
              </select>

              <label>Destination Warehouse</label>
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
                <h3>Order Products</h3>

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
                        handleItemChange(index, "product_id", e.target.value)
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
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Unit Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={e =>
                        handleItemChange(index, "unit_price", e.target.value)
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

              <div className="purchase-total">
                <span>Estimated Total</span>
                <strong>
                  ₹{totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </strong>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  Create Order
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Purchase Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal purchase-modal">

            <div className="modal-header">
              <h2>Purchase Order #{selectedOrder.po_id}</h2>

              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="order-details">
              <p>
                <strong>Supplier:</strong>{" "}
                {selectedOrder.suppliers?.name || "-"}
              </p>

              <p>
                <strong>Warehouse:</strong>{" "}
                {selectedOrder.warehouses?.name || "-"}
              </p>

              <p>
                <strong>Employee:</strong>{" "}
                {selectedOrder.employees?.name || "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedOrder.status}
              </p>

              <p>
                <strong>Order Date:</strong>{" "}
                {selectedOrder.order_date
                  ? new Date(selectedOrder.order_date).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <h3>Products in Order</h3>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedOrder.items || []).map(item => (
                    <tr key={item.po_item_id}>
                      <td>{item.products?.name || "-"}</td>
                      <td>{item.quantity}</td>
                      <td>₹{Number(item.unit_price).toFixed(2)}</td>
                      <td>
                        ₹{(
                          Number(item.quantity) *
                          Number(item.unit_price)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedOrder.status === "Pending" && (
              <div className="modal-actions">
                <button
                  className="primary-btn"
                  onClick={() => receiveOrder(selectedOrder.po_id)}
                >
                  <PackageCheck size={17} />
                  Receive Order
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default PurchaseOrders;
