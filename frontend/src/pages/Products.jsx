
import { useEffect, useState } from "react";
import API from "../services/api";
import { Plus, Pencil, Trash2, X } from "lucide-react";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: ""
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get("/products");
      setProducts(response.data.data || response.data);
      setError("");
    } catch (err) {
      setError("Failed to load products.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", category: "", unit: "" });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.product_id);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit
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

    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, formData);
        alert("Product updated successfully!");
      } else {
        await API.post("/products", formData);
        alert("Product added successfully!");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/products/${id}`);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Cannot delete this product. It may be used in inventory or orders."
      );
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Products Management</h1>
          <p>Manage products and raw materials across factories.</p>
        </div>

        <button className="primary-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="table-card">
        <div className="table-header">
          <h2>All Products</h2>
          <span>{products.length} Products</span>
        </div>

        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="loading-text">No products found.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id}>
                    <td>#{product.product_id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.unit}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(product.product_id)}
                          title="Delete product"
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
              <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Category</label>
              <input
                type="text"
                name="category"
                placeholder="Example: Raw Material"
                value={formData.category}
                onChange={handleChange}
                required
              />

              <label>Unit</label>
              <input
                type="text"
                name="unit"
                placeholder="Example: kg, litre, pieces"
                value={formData.unit}
                onChange={handleChange}
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
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
