
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Factories from "./pages/Factories";
import Warehouses from "./pages/Warehouses";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import StockTransfers from "./pages/StockTransfers";
import Employees from "./pages/Employees";
import Reports from "./pages/Reports";

import { Bell, Search } from "lucide-react";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard": return <Dashboard />;
      case "Factories": return <Factories />;
      case "Warehouses": return <Warehouses />;
      case "Products": return <Products />;
      case "Inventory": return <Inventory />;
      case "Suppliers": return <Suppliers />;
      case "Purchase Orders": return <PurchaseOrders />;
      case "Stock Transfers": return <StockTransfers />;
      case "Employees": return <Employees />;
      case "Reports": return <Reports />;



      default:
        return (
          <div className="dashboard">
            <h1>{activePage}</h1>
            <p>This module will be developed next.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">

        <header className="topbar">
          <div className="search-box">
            <Search size={19} />
            <input placeholder="Search anything..." />
          </div>

          <div className="topbar-right">
            <Bell size={21} />

            <div className="profile">
              <div className="avatar">A</div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        {renderPage()}

      </main>

    </div>
  );
}

export default App;
