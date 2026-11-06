# FactoryFlow – Multi-Factory Supply Chain and Inventory Management System

A web-based inventory management system designed to manage multiple factories, warehouses, products, suppliers, purchase orders, and stock transfers through a centralized Admin Dashboard.

## Project Overview

FactoryFlow is a centralized management system that helps administrators monitor and manage inventory across multiple factories and warehouses.

The system provides inventory tracking, low-stock monitoring, purchase order management, stock transfers, employee management, and factory-wise inventory reports.

The project uses React for the frontend, Node.js and Express.js for the backend, and Supabase PostgreSQL as the database.

## Objectives

- Manage multiple factories and warehouses.
- Maintain product and inventory records.
- Monitor stock availability and low-stock products.
- Manage suppliers and employees.
- Create and manage purchase orders.
- Transfer stock between warehouses.
- Automatically update inventory after receiving purchase orders and completing stock transfers.
- Generate factory-wise inventory reports.

## Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Frontend development server |
| CSS | UI styling |
| Lucide React | Icons |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Supabase | PostgreSQL database and API access |
| Axios | Frontend API communication |
| Git & GitHub | Version control |

## Main Features

### 1. Admin Dashboard
- View total factories.
- View total warehouses.
- View total products.
- Monitor inventory information.
- Identify low-stock items.

### 2. Factory Management
- Add factories.
- View factory details.
- Update factory information.
- Delete factories.

### 3. Warehouse Management
- Create warehouses.
- Assign warehouses to factories.
- Update warehouse information.
- Delete warehouses.
- View warehouses by factory.

### 4. Product Management
- Add new products.
- Manage product names and categories.
- Specify product units.
- Update and delete products.

### 5. Inventory Management
- Maintain warehouse-wise inventory.
- Track product quantities.
- Set reorder levels.
- Update inventory quantities.
- Identify low-stock products.

### 6. Supplier Management
- Add suppliers.
- Store supplier contact information.
- Update supplier details.
- Delete suppliers.

### 7. Purchase Order Management
- Create purchase orders.
- Add multiple products to an order.
- Maintain product quantities and unit prices.
- Track purchase order status.
- Receive purchase orders and automatically update inventory.

### 8. Stock Transfer Management
- Transfer products between warehouses.
- Add multiple products to a transfer.
- Track transfer status.
- Complete transfers and automatically update source and destination inventory.

### 9. Employee Management
- Add employees.
- Assign employees to factories.
- Manage employee roles.
- Update and delete employee records.

### 10. Inventory Reports
- Generate factory-wise inventory reports.
- View inventory records.
- Identify low-stock records.
- View warehouse usage.
- Print inventory reports.

## Database Design

The project uses Supabase PostgreSQL.

The database contains the following main tables:

1. `factories`
2. `employees`
3. `warehouses`
4. `products`
5. `inventory`
6. `suppliers`
7. `purchase_orders`
8. `purchase_order_items`
9. `stock_transfers`
10. `stock_transfer_items`

### Important Database Concepts

- Primary Keys
- Foreign Keys
- One-to-Many Relationships
- Unique Constraints
- Check Constraints
- SQL Joins
- Aggregate Functions
- Database Views
- Triggers

### Database Automation

**Purchase Order Trigger:**

When a purchase order is marked as `Received`, the database trigger automatically increases the corresponding warehouse inventory.

**Stock Transfer Trigger:**

When a stock transfer is marked as `Completed`, the database trigger automatically:
- Decreases the quantity in the source warehouse.
- Increases the quantity in the destination warehouse.

This helps maintain inventory consistency across warehouses.

## Project Folder Structure

```text
multi-factory-inventory/
│
├── backend/
│   ├── config/
│   │   └── supabase.js
│   │
│   ├── routes/
│   │   ├── factoryRoutes.js
│   │   ├── warehouseRoutes.js
│   │   ├── productRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── stockTransferRoutes.js
│   │   └── employeeRoutes.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Factories.jsx
│   │   │   ├── Warehouses.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Suppliers.jsx
│   │   │   ├── PurchaseOrders.jsx
│   │   │   ├── StockTransfers.jsx
│   │   │   ├── Employees.jsx
│   │   │   └── Reports.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── dashboardService.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites

Install the following software:

- Node.js and npm
- Git
- VS Code
- Supabase account

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project directory:

```bash
cd multi-factory-inventory
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
SUPABASE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Replace the placeholder values with your Supabase project details.

Start the backend server:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## API Structure

The backend provides REST APIs for the following modules:

| Module | Base API Endpoint |
|---|---|
| Factories | `/api/factories` |
| Warehouses | `/api/warehouses` |
| Products | `/api/products` |
| Inventory | `/api/inventory` |
| Suppliers | `/api/suppliers` |
| Purchase Orders | `/api/purchase-orders` |
| Stock Transfers | `/api/stock-transfers` |
| Employees | `/api/employees` |

Example API request:

```http
GET http://localhost:5000/api/factories
```

## Application Workflow

1. Administrator opens the FactoryFlow application.
2. Dashboard displays overall inventory information.
3. Administrator creates and manages factories.
4. Warehouses are assigned to factories.
5. Products and suppliers are registered.
6. Inventory records are maintained for each warehouse.
7. Purchase orders are created when products need to be purchased.
8. Receiving an order automatically updates inventory.
9. Stock can be transferred between warehouses.
10. Completing a transfer automatically updates both warehouses.
11. Administrator generates factory-wise inventory reports.

## Future Enhancements

- Admin authentication and role-based access control.
- Factory Manager and Warehouse Manager access.
- Interactive inventory analytics and charts.
- Email notifications for low-stock products.
- Export reports as PDF and Excel.
- Docker-based deployment.
- Cloud deployment.

## Project Information

**Project Name:** Multi-Factory Supply Chain and Inventory Management System

**Application Name:** FactoryFlow

**Project Domain:** Database Management Systems (DBMS)

**Frontend:** React.js

**Backend:** Node.js and Express.js

**Database:** Supabase PostgreSQL

---

*FactoryFlow – Simplifying Multi-Factory Inventory and Supply Chain Management.*