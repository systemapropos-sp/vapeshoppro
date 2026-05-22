// Helper that returns demo data when in demo mode, avoiding tRPC calls
import { useDemoStore } from "@/stores/demoStore";
import { useLocalAuth } from "./useLocalAuth";

export function useDemoQuery<T>(entity: string): T[] | undefined {
  const { isDemo } = useLocalAuth();
  const store = useDemoStore();
  if (!isDemo) return undefined;

  const getters: Record<string, () => T[]> = {
    products: store.getProducts as () => T[],
    categories: store.getCategories as () => T[],
    customers: store.getCustomers as () => T[],
    employees: store.getEmployees as () => T[],
    suppliers: store.getSuppliers as () => T[],
    sales: store.getSales as () => T[],
    expenses: store.getExpenses as () => T[],
    purchases: store.getPurchases as () => T[],
    payroll: store.getPayroll as () => T[],
    loans: store.getLoans as () => T[],
    vouchers: store.getVouchers as () => T[],
    printers: store.getPrinters as () => T[],
  };

  return getters[entity]?.() || [];
}
