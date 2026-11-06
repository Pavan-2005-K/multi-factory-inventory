
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Factory, RefreshCw } from "lucide-react";
import API from "../services/api";

function Factories() {
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: ""
  });

  // Get all factories
  const fetchFactories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/factories");
      setFactories(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load factories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Open add form
  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: "", location: "" });
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (factory) => {
    setEditingId(factory.factory_id);

    setFormData({
      name: factory.name,
      location: factory.location
    });

    setShowForm(true);
  };

  // Add or update factory
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/factories/${editingId}`, formData);
        alert("Factory updated successfully!");
      } else {
        await API.post("/factories", formData);
        alert("Factory added successfully!");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", location: "" });

      fetchFactories();
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed.");
    }
  };

  // Delete factory
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this factory?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/factories/${id}`);
      alert("Factory deleted successfully!");
      fetchFactories();
    } catch (err) {
      alert(err.response?.data?.error || "Unable to delete factory.");
    }
  };

  return (
    <div className="dashboard">

      <div className="page-heading">
        <div>
          <h1>Factories</h1>
          <p>Manage all factories in your supply chain.</p>
        </div>

        <button className="primary-button" onClick={openAddForm}>
          <Plus size={18} />
          Add Factory
        </button>
      </div>

      <div className="table-container">

        <div className="table-heading">
          <h2>
            <Factory size={20} />
            Factory List ({factories.length})
          </h2>

          <button className="refresh-button" onClick={fetchFactories}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="message">Loading factories...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : factories.length === 0 ? (
          <p className="message">No factories found.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Factory Name</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {factories.map((factory) => (
                  <tr key={factory.factory_id}>
                    <td>{factory.factory_id}</td>
                    <td>{factory.name}</td>
                    <td>{factory.location}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => openEditForm(factory)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => handleDelete(factory.factory_id)}
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
              <h2>{editingId ? "Edit Factory" : "Add New Factory"}</h2>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Factory Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter factory name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="Enter factory location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingId ? "Update Factory" : "Save Factory"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Factories;
