
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Factory,
  Warehouse,
  Package,
  Users,
  Boxes,
  AlertTriangle,
  ShoppingCart,
  ArrowLeftRight
} from "lucide-react";

function Dashboard() {
  const [stats, setStats] = useState({
    factories: 0,
    warehouses: 0,
    products: 0,
    employees: 0,
    inventory: 0,
    lowStock: 0
  });

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stockTransfers, setStockTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          factoriesRes,
          warehousesRes,
          productsRes,
          employeesRes,
          inventoryRes,
          lowStockRes,
          purchaseRes,
          transfersRes
        ] = await Promise.all([
          API.get("/factories"),
          API.get("/warehouses"),
          API.get("/products"),
          API.get("/employees"),
          API.get("/inventory"),
          API.get("/inventory/low-stock"),
          API.get("/purchase-orders"),
          API.get("/stock-transfers")
        ]);

        const factories = factoriesRes.data.data || [];
        const warehouses = warehousesRes.data.data || [];
        const products = productsRes.data.data || [];
        const employees = employeesRes.data.data || [];
        const inventory = inventoryRes.data.data || [];
        const lowStock = lowStockRes.data.data || [];
        const orders = purchaseRes.data.data || [];
        const transfers = transfersRes.data.data || [];

        setStats({
          factories: factories.length,
          warehouses: warehouses.length,
          products: products.length,
          employees: employees.length,
          inventory: inventory.length,
          lowStock: lowStock.length
        });

        setPurchaseOrders(orders.slice(0, 5));
        setStockTransfers(transfers.slice(0, 5));

      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard data. Check your backend."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Factories",
      value: stats.factories,
      icon: Factory,
      color: "blue"
    },
    {
      title: "Total Warehouses",
      value: stats.warehouses,
      icon: Warehouse,
      color: "orange"
    },
    {
      title: "Total Products",
      value: stats.products,
      icon: Package,
      color: "green"
    },
    {
      title: "Total Employees",
      value: stats.employees,
      icon: Users,
      color: "purple"
    },
    {
      title: "Inventory Records",
      value: stats.inventory,
      icon: Boxes,
      color: "blue"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: AlertTriangle,
      color: "orange"
    }
  ];

  const getStatusClass = (status) => {
    const value = status?.toLowerCase();

    if (value === "completed" || value === "received") {
      return "good";
    }

    if (value === "cancelled") {
      return "low";
    }

    return "pending";
  };

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p>Loading dashboard information...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your multi-factory inventory system.</p>
        </div>
      </div>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* Statistics */}
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="stat-card" key={card.title}>
              <div className={`stat-icon ${card.color}`}>
                <Icon size={23} />
              </div>

              <div>
                <p>{card.title}</p>
                <h2>{card.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low stock alert */}
      <div className="table-card">
        <div className="table-header">
          <h3>
            <AlertTriangle size={19} />
            Inventory Alert
          </h3>
          <span>{stats.lowStock} low-stock records</span>
        </div>

        <div className="alert-content">
          {stats.lowStock > 0 ? (
            <p>
              <strong>{stats.lowStock}</strong> inventory records
              have reached or fallen below their reorder level.
              Please review the Inventory module.
            </p>
          ) : (
            <p>All inventory records are above their reorder levels.</p>
          )}
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div className="table-card">
        <div className="table-header">
          <h3>
            <ShoppingCart size={19} />
            Recent Purchase Orders
          </h3>
          <span>Latest 5 orders</span>
        </div>

        {purchaseOrders.length === 0 ? (
          <p className="empty-state">No purchase orders available.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Warehouse</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {purchaseOrders.map((order) => (
                  <tr key={order.po_id}>
                    <td>#{order.po_id}</td>
                    <td>{order.supplier_name || "N/A"}</td>
                    <td>{order.warehouse_name || "N/A"}</td>
                    <td>
                      {order.total_amount != null
                        ? Number(order.total_amount).toFixed(2)
                        : "N/A"}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Stock Transfers */}
      <div className="table-card">
        <div className="table-header">
          <h3>
            <ArrowLeftRight size={19} />
            Recent Stock Transfers
          </h3>
          <span>Latest 5 transfers</span>
        </div>

        {stockTransfers.length === 0 ? (
          <p className="empty-state">No stock transfers available.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Transfer ID</th>
                  <th>Source Warehouse</th>
                  <th>Destination Warehouse</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {stockTransfers.map((transfer) => (
                  <tr key={transfer.transfer_id}>
                    <td>#{transfer.transfer_id}</td>
                    <td>{transfer.source_warehouse_name || "N/A"}</td>
                    <td>{transfer.destination_warehouse_name || "N/A"}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(transfer.status)}`}>
                        {transfer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
