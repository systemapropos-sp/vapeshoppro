// Demo mode - works without backend using localStorage
import { create } from "zustand";

const STORAGE_KEY = "vapeshopro_demo_data";

function loadDemoData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  // Seed data
  const seed = {
    products: [
      { id: 1, name: "Geek Bar Pulse 15000", description: "Disposable vape with 15,000 puffs", barcode: "123456789001", sku: "GB-PULSE-001", image: "", categoryId: 1, costPrice: "8.50", salePrice: "15.99", wholesalePrice: "12.50", quantity: 45, minStock: 10, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Disposables" } },
      { id: 2, name: "Elf Bar BC5000", description: "Popular disposable with 5000 puffs", barcode: "123456789002", sku: "EB-BC5000-001", image: "", categoryId: 1, costPrice: "7.00", salePrice: "13.99", wholesalePrice: "10.00", quantity: 32, minStock: 10, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Disposables" } },
      { id: 3, name: "Hookah Khalil Mamoon", description: "Traditional Egyptian hookah", barcode: "123456789003", sku: "HK-KM-001", image: "", categoryId: 2, costPrice: "35.00", salePrice: "69.99", wholesalePrice: "50.00", quantity: 8, minStock: 3, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Hookahs" } },
      { id: 4, name: "Al Fakher Mint 250g", description: "Premium shisha tobacco", barcode: "123456789004", sku: "AF-MINT-250", image: "", categoryId: 3, costPrice: "6.50", salePrice: "12.99", wholesalePrice: "9.00", quantity: 20, minStock: 5, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Tobacco" } },
      { id: 5, name: "Coconut Charcoal 1kg", description: "Natural coconut hookah charcoal", barcode: "123456789005", sku: "CC-1KG-001", image: "", categoryId: 4, costPrice: "3.50", salePrice: "7.99", wholesalePrice: "5.50", quantity: 50, minStock: 15, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Accessories" } },
      { id: 6, name: "Vaporesso XROS 3", description: "Pod system with adjustable airflow", barcode: "123456789006", sku: "VS-XROS3-001", image: "", categoryId: 5, costPrice: "12.00", salePrice: "24.99", wholesalePrice: "18.00", quantity: 15, minStock: 5, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Pod Systems" } },
      { id: 7, name: "SMOK Nord 5", description: "Advanced pod mod 2000mAh", barcode: "123456789007", sku: "SM-NORD5-001", image: "", categoryId: 5, costPrice: "14.00", salePrice: "29.99", wholesalePrice: "22.00", quantity: 12, minStock: 5, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Pod Systems" } },
      { id: 8, name: "Hookah Hose Premium", description: "Washable silicone hookah hose", barcode: "123456789008", sku: "HH-PREM-001", image: "", categoryId: 4, costPrice: "4.00", salePrice: "9.99", wholesalePrice: "6.50", quantity: 25, minStock: 8, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Accessories" } },
      { id: 9, name: "Foil Pack 50pcs", description: "Pre-cut hookah foil sheets", barcode: "123456789009", sku: "FOIL-50-001", image: "", categoryId: 4, costPrice: "1.50", salePrice: "3.99", wholesalePrice: "2.50", quantity: 60, minStock: 20, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Accessories" } },
      { id: 10, name: "Starter Vape Kit", description: "Complete beginner vape kit", barcode: "123456789010", sku: "KIT-START-001", image: "", categoryId: 6, costPrice: "18.00", salePrice: "39.99", wholesalePrice: "28.00", quantity: 6, minStock: 3, unit: "kit", taxRate: "0", isActive: true, isKit: true, category: { name: "Kits" } },
      { id: 11, name: "Lost Mary OS5000", description: "Disposable with amazing flavors", barcode: "123456789011", sku: "LM-OS5000-001", image: "", categoryId: 1, costPrice: "7.50", salePrice: "14.99", wholesalePrice: "10.50", quantity: 28, minStock: 10, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Disposables" } },
      { id: 12, name: "Starbuzz Blue Mist 250g", description: "Famous blueberry mint shisha", barcode: "123456789012", sku: "SB-BM-250", image: "", categoryId: 3, costPrice: "8.00", salePrice: "16.99", wholesalePrice: "12.00", quantity: 14, minStock: 5, unit: "unidad", taxRate: "0", isActive: true, isKit: false, category: { name: "Tobacco" } },
    ],
    categories: [
      { id: 1, name: "Disposables", description: "Disposable vapes and e-cigs", color: "#06b6d4", icon: "vape" },
      { id: 2, name: "Hookahs", description: "Traditional and modern hookahs", color: "#8b5cf6", icon: "flame" },
      { id: 3, name: "Tobacco", description: "Shisha tobacco and flavors", color: "#f59e0b", icon: "leaf" },
      { id: 4, name: "Accessories", description: "Hoses, charcoal, foil, etc.", color: "#10b981", icon: "wrench" },
      { id: 5, name: "Pod Systems", description: "Pod vapes and mods", color: "#ec4899", icon: "battery" },
      { id: 6, name: "Kits", description: "Complete vape and hookah kits", color: "#f97316", icon: "box" },
    ],
    customers: [
      { id: 1, name: "Juan Perez", image: "", email: "juan@email.com", phone: "809-555-0101", idCard: "001-2345678-9", address: "Calle Principal #123", city: "Santo Domingo", creditLimit: "5000", currentCredit: "1250", isVip: true, isActive: true },
      { id: 2, name: "Maria Garcia", image: "", email: "maria@email.com", phone: "809-555-0102", idCard: "002-3456789-0", address: "Av. Winston Churchill #456", city: "Santo Domingo", creditLimit: "3000", currentCredit: "0", isVip: false, isActive: true },
      { id: 3, name: "Carlos Santos", image: "", email: "carlos@email.com", phone: "809-555-0103", idCard: "003-4567890-1", address: "Calle del Sol #789", city: "Santiago", creditLimit: "10000", currentCredit: "4500", isVip: true, isActive: true },
    ],
    employees: [
      { id: 1, name: "Pedro Martinez", image: "", email: "pedro@vapeshop.com", phone: "809-555-0201", idCard: "004-5678901-2", position: "Manager", department: "Sales", salary: "45000", pin: "1234", hireDate: "2024-01-15", isActive: true },
      { id: 2, name: "Ana Lopez", image: "", email: "ana@vapeshop.com", phone: "809-555-0202", idCard: "005-6789012-3", position: "Cashier", department: "Sales", salary: "25000", pin: "5678", hireDate: "2024-03-01", isActive: true },
      { id: 3, name: "Luis Torres", image: "", email: "luis@vapeshop.com", phone: "809-555-0203", idCard: "006-7890123-4", position: "Inventory Clerk", department: "Warehouse", salary: "28000", pin: "9012", hireDate: "2024-02-10", isActive: true },
    ],
    suppliers: [
      { id: 1, name: "Vape Wholesale USA", image: "", contactName: "John Smith", email: "john@vapewholesale.com", phone: "305-555-0301", address: "123 Trade St, Miami FL", rnc: "USA-VW-001", isActive: true },
      { id: 2, name: "Hookah International", image: "", contactName: "Ahmed Hassan", email: "ahmed@hookahintl.com", phone: "305-555-0302", address: "456 Export Ave, Miami FL", rnc: "USA-HI-002", isActive: true },
      { id: 3, name: "Tobacco Direct", image: "", contactName: "Sarah Johnson", email: "sarah@tobaccodirect.com", phone: "305-555-0303", address: "789 Commerce Blvd, Orlando FL", rnc: "USA-TD-003", isActive: true },
    ],
    sales: [
      { id: 1, invoiceNumber: "INV-A1B2C3D4", customerId: 1, employeeId: 2, subtotal: "45.97", tax: "0", discount: "0", total: "45.97", paymentMethod: "cash", paymentStatus: "paid", amountPaid: "45.97", status: "completed", notes: "", createdAt: new Date(Date.now() - 86400000).toISOString(), customer: { name: "Juan Perez" }, employee: { name: "Ana Lopez" }, saleItems: [{ id: 1, productId: 1, quantity: 2, unitPrice: "15.99", total: "31.98", product: { name: "Geek Bar Pulse 15000" } }, { id: 2, productId: 5, quantity: 1, unitPrice: "7.99", total: "7.99", product: { name: "Coconut Charcoal 1kg" } }] },
      { id: 2, invoiceNumber: "INV-E5F6G7H8", customerId: 2, employeeId: 2, subtotal: "69.99", tax: "0", discount: "5.00", total: "64.99", paymentMethod: "card", paymentStatus: "paid", amountPaid: "64.99", status: "completed", notes: "VIP discount", createdAt: new Date(Date.now() - 172800000).toISOString(), customer: { name: "Maria Garcia" }, employee: { name: "Ana Lopez" }, saleItems: [{ id: 3, productId: 3, quantity: 1, unitPrice: "69.99", total: "69.99", product: { name: "Hookah Khalil Mamoon" } }] },
      { id: 3, invoiceNumber: "INV-I9J0K1L2", customerId: 3, employeeId: 1, subtotal: "53.97", tax: "0", discount: "0", total: "53.97", paymentMethod: "transfer", paymentStatus: "paid", amountPaid: "53.97", status: "completed", notes: "", createdAt: new Date(Date.now() - 259200000).toISOString(), customer: { name: "Carlos Santos" }, employee: { name: "Pedro Martinez" }, saleItems: [{ id: 4, productId: 4, quantity: 2, unitPrice: "12.99", total: "25.98", product: { name: "Al Fakher Mint 250g" } }, { id: 5, productId: 6, quantity: 1, unitPrice: "24.99", total: "24.99", product: { name: "Vaporesso XROS 3" } }] },
    ],
    expenses: [
      { id: 1, category: "Rent", description: "Monthly store rent", amount: "800.00", paymentMethod: "transfer", receiptNumber: "RCP-001", date: "2026-05-01", notes: "" },
      { id: 2, category: "Utilities", description: "Electric bill", amount: "125.00", paymentMethod: "cash", receiptNumber: "RCP-002", date: "2026-05-05", notes: "" },
      { id: 3, category: "Inventory", description: "Vape restock order", amount: "2500.00", paymentMethod: "transfer", receiptNumber: "RCP-003", date: "2026-05-10", notes: "" },
    ],
    purchases: [
      { id: 1, invoiceNumber: "PO-001", supplierId: 1, subtotal: "1500.00", tax: "0", discount: "50.00", total: "1450.00", paymentMethod: "transfer", paymentStatus: "paid", status: "received", notes: "", createdAt: new Date(Date.now() - 604800000).toISOString(), supplier: { name: "Vape Wholesale USA" }, purchaseItems: [{ id: 1, productId: 1, quantity: 100, unitCost: "8.50", total: "850.00", product: { name: "Geek Bar Pulse 15000" } }, { id: 2, productId: 2, quantity: 50, unitCost: "7.00", total: "350.00", product: { name: "Elf Bar BC5000" } }] },
    ],
    payrollRecords: [
      { id: 1, employeeId: 1, periodStart: "2026-05-01", periodEnd: "2026-05-15", baseSalary: "2250.00", overtime: "100.00", commission: "150.00", bonus: "0", deductions: "50.00", tax: "225.00", totalPay: "2225.00", status: "paid", paidAt: new Date().toISOString(), notes: "" },
      { id: 2, employeeId: 2, periodStart: "2026-05-01", periodEnd: "2026-05-15", baseSalary: "1250.00", overtime: "0", commission: "75.00", bonus: "50.00", deductions: "25.00", tax: "125.00", totalPay: "1225.00", status: "pending", notes: "" },
    ],
    loans: [
      { id: 1, employeeId: 2, amount: "500.00", remaining: "250.00", installments: 4, amountPerInstallment: "125.00", reason: "Medical expenses", status: "active", createdAt: new Date(Date.now() - 2592000000).toISOString() },
    ],
    vouchers: [
      { id: 1, voucherNumber: "VCH-A1B2C3", type: "income", amount: "150.00", description: "Cash sale refund", referenceId: 1, referenceType: "sale", status: "active", createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, voucherNumber: "VCH-D4E5F6", type: "expense", amount: "75.00", description: "Office supplies", referenceId: null, referenceType: null, status: "active", createdAt: new Date(Date.now() - 172800000).toISOString() },
    ],
    printers: [
      { id: 1, name: "Main Thermal Printer", image: "/printer-thermal.jpg", type: "thermal", connectionType: "usb", ipAddress: "192.168.1.100", port: "9100", paperWidth: 80, isDefault: true, isActive: true },
    ],
    store: { id: 1, name: "VapeShop Pro Demo", logo: "/logo.png", rnc: "1-23456789-0", taxId: "DO-VSP-001", phone: "809-555-0000", email: "info@vapeshopro.com", address: "Av. Lincoln #1025", city: "Santo Domingo", country: "Dominican Republic", currency: "DOP", timezone: "America/Santo_Domingo", isActive: true, membershipExpiry: "2026-12-31" },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveData(data: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export interface DemoState {
  data: any;
  isDemo: boolean;
  setDemo: (v: boolean) => void;
  getProducts: () => any[];
  getCategories: () => any[];
  getCustomers: () => any[];
  getEmployees: () => any[];
  getSuppliers: () => any[];
  getSales: () => any[];
  getExpenses: () => any[];
  getPurchases: () => any[];
  getPayroll: () => any[];
  getLoans: () => any[];
  getVouchers: () => any[];
  getPrinters: () => any[];
  getStore: () => any;
  add: (entity: string, item: any) => any;
  update: (entity: string, id: number, item: any) => void;
  remove: (entity: string, id: number) => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  data: loadDemoData(),
  isDemo: false,
  setDemo: (v) => set({ isDemo: v }),
  getProducts: () => get().data.products,
  getCategories: () => get().data.categories,
  getCustomers: () => get().data.customers,
  getEmployees: () => get().data.employees,
  getSuppliers: () => get().data.suppliers,
  getSales: () => get().data.sales,
  getExpenses: () => get().data.expenses,
  getPurchases: () => get().data.purchases,
  getPayroll: () => get().data.payrollRecords,
  getLoans: () => get().data.loans,
  getVouchers: () => get().data.vouchers,
  getPrinters: () => get().data.printers,
  getStore: () => get().data.store,
  add: (entity, item) => {
    const state = get();
    const newId = Math.max(0, ...state.data[entity].map((e: any) => e.id)) + 1;
    const newItem = { ...item, id: newId };
    const newData = { ...state.data, [entity]: [...state.data[entity], newItem] };
    saveData(newData);
    set({ data: newData });
    return newItem;
  },
  update: (entity, id, item) => {
    const state = get();
    const newData = { ...state.data, [entity]: state.data[entity].map((e: any) => e.id === id ? { ...e, ...item } : e) };
    saveData(newData);
    set({ data: newData });
  },
  remove: (entity, id) => {
    const state = get();
    const newData = { ...state.data, [entity]: state.data[entity].filter((e: any) => e.id !== id) };
    saveData(newData);
    set({ data: newData });
  },
}));
