
import {
  LayoutDashboard,
  Factory,
  Warehouse,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  ArrowLeftRight,
  Users,
  FileBarChart
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Factories", icon: Factory },
  { name: "Warehouses", icon: Warehouse },
  { name: "Products", icon: Package },
  { name: "Inventory", icon: Boxes },
  { name: "Suppliers", icon: Truck },
  { name: "Purchase Orders", icon: ShoppingCart },
  { name: "Stock Transfers", icon: ArrowLeftRight },
  { name: "Employees", icon: Users },
  { name: "Reports", icon: FileBarChart }
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <Boxes size={30} />
        <h2>FactoryFlow</h2>
      </div>

      <p className="menu-heading">MAIN MENU</p>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              className={`menu-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Multi-Factory Inventory</p>
        <small>Management System</small>
      </div>

    </aside>
  );
}

export default Sidebar;
