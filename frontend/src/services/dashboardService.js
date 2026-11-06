
import API from "./api";

export const getFactories = () => API.get("/factories");

export const getWarehouses = () => API.get("/warehouses");

export const getProducts = () => API.get("/products");

export const getInventory = () => API.get("/inventory");

export const getLowStock = () => API.get("/inventory/low-stock");

export const getSuppliers = () => API.get("/suppliers");
