
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Warehouse,
  RefreshCw
} from "lucide-react";

import API from "../services/api";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [factories, setFactories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    factory_id: ""
  });

  // Fetch warehouses and factories
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [warehouseResponse, factoryResponse] =
        await Promise.all([
          API.get("/warehouses"),
          API.get("/factories")
        ]);

      setWarehouses(warehouseResponse.data);
      setFactories(factoryResponse.data);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load warehouse information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Open add form
  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      location: "",
      factory_id: ""
    });

    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (warehouse) => {
    setEditingId(warehouse.warehouse_id);

    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      factory_id: String(warehouse.factory_id)
    });

    setShowForm(true);
  };

  // Add or update warehouse
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      location: formData.location,
      factory_id: Number(formData.factory_id)
    };

    try {
      if (editingId) {
        await API.put(`/warehouses/${editingId}`, payload);
        alert("Warehouse updated successfully!");
      } else {
        await API.post("/warehouses", payload);
        alert("Warehouse added successfully!");
      }

      setShowForm(false);
      setEditingId(null);

      fetchData();

    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Unable to save warehouse."
      );
    }
  };

  // Delete warehouse
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/warehouses/${id}`);

      alert("Warehouse deleted successfully!");

      fetchData();

    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Unable to delete warehouse. Check its related inventory or transfers."
      );
    }
  };

  return (
    <div className="dashboard">

      <div className="page-heading">
        <div>
          <h1>Warehouses</h1>
          <p>Manage warehouses across all factories.</p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Warehouse
        </button>
      </div>

      <div className="table-container">

        <div className="table-heading">
          <h2>
            <Warehouse size={20} />
            Warehouse List ({warehouses.length})
          </h2>

          <button
            className="refresh-button"
            onClick={fetchData}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="message">Loading warehouses...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : warehouses.length === 0 ? (
          <p className="message">No warehouses found.</p>
        ) : (

          <div className="table-scroll">

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Warehouse Name</th>
                  <th>Location</th>
                  <th>Factory ID</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {warehouses.map((warehouse) => (

                  <tr key={warehouse.warehouse_id}>
                    <td>{warehouse.warehouse_id}</td>
                    <td>{warehouse.name}</td>
                    <td>{warehouse.location}</td>
                    <td>{warehouse.factory_id}</td>

                    <td>
                      <div className="action-buttons">

                        <button
                          className="edit-button"
                          onClick={() => openEditForm(warehouse)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(warehouse.warehouse_id)
                          }
                          title="Delete"
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

      {showForm && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-heading">

              <h2>
                {editingId ? "Edit Warehouse" : "Add New Warehouse"}
              </h2>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label>Warehouse Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter warehouse name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Location</label>

              <input
                type="text"
                name="location"
                placeholder="Enter warehouse location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <label>Select Factory</label>

              <select
                name="factory_id"
                value={formData.factory_id}
                onChange={handleChange}
                required
              >
                <option value="">Choose a factory</option>

                {factories.map((factory) => (
                  <option
                    key={factory.factory_id}
                    value={factory.factory_id}
                  >
                    {factory.name} - {factory.location}
                  </option>
                ))}

              </select>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingId ? "Update Warehouse" : "Save Warehouse"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Warehouses;
