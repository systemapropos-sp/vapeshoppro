import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sales, expenses, employees } from "@db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const reportRouter = createRouter({
  salesSummary: publicQuery
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const salesData = await db.query.sales.findMany({
        where: and(
          gte(sales.createdAt, new Date(input.startDate)),
          lte(sales.createdAt, new Date(input.endDate)),
          eq(sales.status, "completed"),
        ),
        with: { saleItems: true },
      });

      const totalRevenue = salesData.reduce((sum, s) => sum + Number(s.total), 0);
      const totalTax = salesData.reduce((sum, s) => sum + Number(s.tax || 0), 0);
      const totalDiscount = salesData.reduce((sum, s) => sum + Number(s.discount || 0), 0);
      const totalTransactions = salesData.length;
      const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const byPaymentMethod = {
        cash: salesData.filter(s => s.paymentMethod === "cash").reduce((sum, s) => sum + Number(s.total), 0),
        card: salesData.filter(s => s.paymentMethod === "card").reduce((sum, s) => sum + Number(s.total), 0),
        transfer: salesData.filter(s => s.paymentMethod === "transfer").reduce((sum, s) => sum + Number(s.total), 0),
        credit: salesData.filter(s => s.paymentMethod === "credit").reduce((sum, s) => sum + Number(s.total), 0),
      };

      return { totalRevenue, totalTax, totalDiscount, totalTransactions, averageTicket, byPaymentMethod };
    }),

  topProducts: publicQuery
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db.query.saleItems.findMany({
        with: { product: true, sale: true },
      });

      const filtered = items.filter(i => {
        if (!i.sale || i.sale.status !== "completed") return false;
        const d = i.sale.createdAt;
        return d >= new Date(input.startDate) && d <= new Date(input.endDate);
      });

      const productMap = new Map<number, { name: string; quantity: number; revenue: number }>();
      for (const item of filtered) {
        const pid = item.productId;
        const existing = productMap.get(pid) || { name: item.product?.name || "Unknown", quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += Number(item.total);
        productMap.set(pid, existing);
      }

      return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, input.limit);
    }),

  expenseSummary: publicQuery
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const expensesData = await db.query.expenses.findMany({
        where: and(
          gte(expenses.date, new Date(input.startDate)),
          lte(expenses.date, new Date(input.endDate))
        ),
      });

      const totalExpenses = expensesData.reduce((sum, e) => sum + Number(e.amount), 0);
      const byCategory: Record<string, number> = {};
      for (const e of expensesData) {
        byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
      }

      return { totalExpenses, byCategory, count: expensesData.length };
    }),

  inventorySummary: publicQuery.query(async () => {
    const db = getDb();
    const allProducts = await db.query.products.findMany();
    const totalProducts = allProducts.length;
    const totalStockValue = allProducts.reduce((sum, p) => sum + (Number(p.costPrice || 0) * p.quantity), 0);
    const totalRetailValue = allProducts.reduce((sum, p) => sum + (Number(p.salePrice || 0) * p.quantity), 0);
    const lowStockCount = allProducts.filter(p => p.quantity <= (p.minStock || 5)).length;
    const outOfStockCount = allProducts.filter(p => p.quantity === 0).length;

    return { totalProducts, totalStockValue, totalRetailValue, lowStockCount, outOfStockCount };
  }),

  dashboard: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaySales = await db.query.sales.findMany({
      where: and(gte(sales.createdAt, todayStart), eq(sales.status, "completed")),
    });
    const monthSales = await db.query.sales.findMany({
      where: and(gte(sales.createdAt, monthStart), eq(sales.status, "completed")),
    });

    const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
    const monthRevenue = monthSales.reduce((sum, s) => sum + Number(s.total), 0);
    const todayTransactions = todaySales.length;

    const allProducts = await db.query.products.findMany();
    const lowStock = allProducts.filter(p => p.quantity <= (p.minStock || 5)).length;

    const totalCustomers = (await db.query.customers.findMany()).length;
    const totalEmployees = (await db.query.employees.findMany({ where: eq(employees.isActive, true) })).length;

    return {
      todayRevenue,
      todayTransactions,
      monthRevenue,
      lowStock,
      totalProducts: allProducts.length,
      totalCustomers,
      totalEmployees,
    };
  }),
});
