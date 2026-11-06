
import { useEffect, useState } from "react";
import API from "../services/api";

import {
  FileBarChart,
  Package,
  Warehouse,
  AlertTriangle,
  Printer
} from "lucide-react";

function Reports() {
  const [factories, setFactories] = useState([]);
  const [selectedFactory, setSelectedFactory] = useState("");

  const [inventory, setInventory] = useState([]);

  const [summary, setSummary] = useState({
    totalRecords: 0,
    lowStockRecords: 0,
    totalQuantity: 0,
    warehouseCount: 0
  });

  const [loadingFactories, setLoadingFactories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STEP 1: Fetch all factories
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        setLoadingFactories(true);
        setError("");

        const response = await API.get("/factories");

        // Support both { data: [...] } and direct array responses
        const factoryData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        setFactories(factoryData);

        if (factoryData.length > 0) {
          setSelectedFactory(
            String(factoryData[0].factory_id)
          );
        } else {
          setSelectedFactory("");
        }

      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load factories. Check the backend."
        );
      } finally {
        setLoadingFactories(false);
      }
    };

    fetchFactories();
  }, []);

  // STEP 2: Fetch factory-wise report
  useEffect(() => {
    if (!selectedFactory) {
      setInventory([]);

      setSummary({
        totalRecords: 0,
        lowStockRecords: 0,
        totalQuantity: 0,
        warehouseCount: 0
      });

      return;
    }

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(
          `/reports/factory/${selectedFactory}`
        );

        const reportData = response.data.data || [];
        const reportSummary = response.data.summary || {};

        setInventory(reportData);

        setSummary({
          totalRecords: reportSummary.totalRecords ?? reportData.length,
          lowStockRecords: reportSummary.lowStockRecords ?? 0,
          totalQuantity: reportSummary.totalQuantity ?? 0,
          warehouseCount: reportSummary.warehouseCount ?? 0
        });

      } catch (err) {
        setInventory([]);

        setSummary({
          totalRecords: 0,
          lowStockRecords: 0,
          totalQuantity: 0,
          warehouseCount: 0
        });

        setError(
          err.response?.data?.message ||
          "Failed to load factory inventory report."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedFactory]);

  // STEP 3: Get selected factory name
  const factoryName =
    factories.find(
      (factory) =>
        String(factory.factory_id) === selectedFactory
    )?.name || "Factory";

  // STEP 4: Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard">

      {/* Page Header */}
      <div className="page-header report-header">
        <div>
          <h1>Inventory Reports</h1>
          <p>
            View factory-wise inventory and stock information.
          </p>
        </div>

        <button
          className="primary-btn no-print"
          onClick={handlePrint}
          disabled={loading || !selectedFactory}
        >
          <Printer size={18} />
          Print Report
        </button>
      </div>

      {/* Factory Selection */}
      <div className="table-card report-filter no-print">
        <div className="form-group">
          <label>Select Factory</label>

          <select
            value={selectedFactory}
            onChange={(e) =>
              setSelectedFactory(e.target.value)
            }
            disabled={loadingFactories || factories.length === 0}
          >
            {loadingFactories ? (
              <option value="">Loading factories...</option>
            ) : factories.length === 0 ? (
              <option value="">No factories available</option>
            ) : (
              factories.map((factory) => (
                <option
                  key={factory.factory_id}
                  value={String(factory.factory_id)}
                >
                  {factory.name} - {factory.location}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* Report Content */}
      {!loadingFactories && factories.length > 0 && (
        <>
          <div className="report-title">
            <h2>{factoryName} - Inventory Report</h2>

            <p>
              Factory ID: {selectedFactory}
            </p>
          </div>

          {loading ? (
            <p className="loading-message">
              Loading inventory report...
            </p>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="stats-grid">

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <Package size={23} />
                  </div>

                  <div>
                    <p>Inventory Records</p>
                    <h2>{summary.totalRecords}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <Warehouse size={23} />
                  </div>

                  <div>
                    <p>Warehouses Used</p>
                    <h2>{summary.warehouseCount}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <AlertTriangle size={23} />
                  </div>

                  <div>
                    <p>Low Stock Records</p>
                    <h2>{summary.lowStockRecords}</h2>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <Package size={23} />
                  </div>

                  <div>
                    <p>Total Stock Quantity</p>
                    <h2>
                      {Number(summary.totalQuantity).toLocaleString()}
                    </h2>
                  </div>
                </div>

              </div>

              {/* Inventory Details */}
              <div className="table-card">

                <div className="table-header">
                  <h3>
                    <FileBarChart size={19} />
                    Factory Inventory Details
                  </h3>

                  <span>
                    {inventory.length} records
                  </span>
                </div>

                {inventory.length === 0 ? (
                  <div className="empty-state">
                    No inventory records found for this factory.
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Inventory ID</th>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Warehouse</th>
                          <th>Quantity</th>
                          <th>Reorder Level</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {inventory.map((item) => {
                          const isLow =
                            Number(item.quantity) <=
                            Number(item.reorder_level);

                          return (
                            <tr key={item.inventory_id}>

                              <td>
                                #{item.inventory_id}
                              </td>

                              <td>
                                <strong>
                                  {item.products?.name || "N/A"}
                                </strong>
                              </td>

                              <td>
                                {item.products?.category || "N/A"}
                              </td>

                              <td>
                                {item.warehouses?.name || "N/A"}
                              </td>

                              <td>
                                {item.quantity}{" "}
                                {item.products?.unit || ""}
                              </td>

                              <td>
                                {item.reorder_level}
                              </td>

                              <td>
                                <span
                                  className={`status-badge ${
                                    isLow ? "low" : "good"
                                  }`}
                                >
                                  {isLow ? "Low Stock" : "Available"}
                                </span>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </>
          )}
        </>
      )}

      {!loadingFactories && factories.length === 0 && !error && (
        <div className="table-card empty-state">
          No factories found. Please add a factory first.
        </div>
      )}

    </div>
  );
}

export default Reports;
