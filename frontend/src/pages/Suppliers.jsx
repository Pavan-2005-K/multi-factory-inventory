
import { useEffect, useState } from "react";
import API from "../services/api";
import { Plus, Pencil, Trash2, X, Truck } from "lucide-react";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await API.get("/suppliers");

      setSuppliers(response.data.data || response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Open add supplier modal
  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: ""
    });
    setShowModal(true);
  };

  // Open edit supplier modal
  const openEditModal = (supplier) => {
    setEditingId(supplier.supplier_id);

    setFormData({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || ""
    });

    setShowModal(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add or update supplier
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/suppliers/${editingId}`, formData);
        alert("Supplier updated successfully!");
      } else {
        await API.post("/suppliers", formData);
        alert("Supplier added successfully!");
      }

      setShowModal(false);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Supplier operation failed."
      );
    }
  };

  // Delete supplier
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/suppliers/${id}`);
      alert("Supplier deleted successfully!");
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
        "Cannot delete this supplier. It may be linked to purchase orders."
      );
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Suppliers Management</h1>
          <p>Manage supplier information and contact details.</p>
        </div>

        <button className="primary-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Truck size={23} />
          </div>

          <div>
            <p>Total Suppliers</p>
            <h2>{suppliers.length}</h2>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2>All Suppliers</h2>
          <span>{suppliers.length} Suppliers</span>
        </div>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p className="loading-text">Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p className="loading-text">No suppliers found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplier_id}>
                    <td>#{supplier.supplier_id}</td>
                    <td>{supplier.name}</td>
                    <td>{supplier.phone || "-"}</td>
                    <td>{supplier.email || "-"}</td>
                    <td>{supplier.address || "-"}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(supplier)}
                          title="Edit supplier"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(supplier.supplier_id)
                          }
                          title="Delete supplier"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingId ? "Edit Supplier" : "Add Supplier"}
              </h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Supplier Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter supplier name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />

              <label>Address</label>
              <textarea
                name="address"
                placeholder="Enter supplier address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
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
                  {editingId ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
