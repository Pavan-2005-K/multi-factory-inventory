
import { useEffect, useState } from "react";
import API from "../services/api";
import { Plus, Pencil, Trash2, X, Users } from "lucide-react";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    factory_id: ""
  });

  // Fetch employees and factories
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [employeeRes, factoryRes] = await Promise.all([
        API.get("/employees"),
        API.get("/factories")
      ]);

      setEmployees(employeeRes.data.data || []);
      setFactories(factoryRes.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open add modal
  const handleAdd = () => {
    setEditingEmployee(null);

    setFormData({
      name: "",
      role: "",
      factory_id: ""
    });

    setError("");
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      name: employee.name,
      role: employee.role,
      factory_id: String(employee.factory_id)
    });

    setError("");
    setShowModal(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add or update employee
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!formData.name.trim() || !formData.role.trim() || !formData.factory_id) {
        setError("Please fill in all fields.");
        return;
      }

      if (editingEmployee) {
        await API.put(
          `/employees/${editingEmployee.employee_id}`,
          formData
        );
      } else {
        await API.post("/employees", formData);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save employee"
      );
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/employees/${id}`);
      fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Could not delete employee. They may be linked to an order or transfer."
      );
    }
  };

  // Find factory name
  const getFactoryName = (factoryId) => {
    const factory = factories.find(
      (item) => item.factory_id === factoryId
    );

    return factory ? factory.name : "Unknown Factory";
  };

  return (
    <div className="dashboard">

      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Manage employees across all factories.</p>
        </div>

        <button className="primary-btn" onClick={handleAdd}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Users size={23} />
          </div>

          <div>
            <p>Total Employees</p>
            <h2>{employees.length}</h2>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Employee List</h3>
          <span>{employees.length} employees</span>
        </div>

        {error && !showModal && (
          <p className="error-message">{error}</p>
        )}

        {loading ? (
          <p className="loading-message">Loading employees...</p>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />
            <p>No employees found. Add your first employee.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee Name</th>
                  <th>Role</th>
                  <th>Factory</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.employee_id}>
                    <td>#{employee.employee_id}</td>

                    <td>
                      <strong>{employee.name}</strong>
                    </td>

                    <td>{employee.role}</td>

                    <td>
                      {getFactoryName(employee.factory_id)}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(employee)}
                          title="Edit employee"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(employee.employee_id)}
                          title="Delete employee"
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-header">
              <h2>
                {editingEmployee ? "Edit Employee" : "Add Employee"}
              </h2>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p className="error-message">{error}</p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>

                <input
                  type="text"
                  name="role"
                  placeholder="Example: Manager"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Factory</label>

                <select
                  name="factory_id"
                  value={formData.factory_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Factory</option>

                  {factories.map((factory) => (
                    <option
                      key={factory.factory_id}
                      value={factory.factory_id}
                    >
                      {factory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  {editingEmployee ? "Update Employee" : "Add Employee"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;
