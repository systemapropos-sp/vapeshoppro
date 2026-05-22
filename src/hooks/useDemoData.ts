import { useDemoStore } from "@/stores/demoStore";
import { useLocalAuth } from "./useLocalAuth";

// This hook provides demo data when backend is unavailable
export function useDemoData() {
  const { isDemo } = useLocalAuth();
  const store = useDemoStore();

  if (!isDemo) return null;

  return {
    products: store.getProducts(),
    categories: store.getCategories(),
    customers: store.getCustomers(),
    employees: store.getEmployees(),
    suppliers: store.getSuppliers(),
    sales: store.getSales(),
    expenses: store.getExpenses(),
    purchases: store.getPurchases(),
    payroll: store.getPayroll(),
    loans: store.getLoans(),
    vouchers: store.getVouchers(),
    printers: store.getPrinters(),
    store: store.getStore(),
    add: store.add,
    update: store.update,
    remove: store.remove,
  };
}
