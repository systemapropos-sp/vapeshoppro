import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sales, saleItems, products, inventoryLogs } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const saleRouter = createRouter({
  list: publicQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      customerId: z.number().optional(),
      employeeId: z.number().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.startDate) conditions.push(gte(sales.createdAt, new Date(input.startDate)));
      if (input?.endDate) conditions.push(lte(sales.createdAt, new Date(input.endDate)));
      if (input?.customerId) conditions.push(eq(sales.customerId, input.customerId));
      if (input?.employeeId) conditions.push(eq(sales.employeeId, input.employeeId));

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.query.sales.findMany({
        where,
        with: { customer: true, employee: true, saleItems: { with: { product: true } } },
        orderBy: desc(sales.createdAt),
        limit: input?.limit || 50,
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.sales.findFirst({
        where: eq(sales.id, input.id),
        with: { customer: true, employee: true, saleItems: { with: { product: true } } },
      });
    }),

  create: publicQuery
    .input(z.object({
      invoiceNumber: z.string(),
      customerId: z.number().optional(),
      employeeId: z.number().optional(),
      storeId: z.number().optional(),
      subtotal: z.string(),
      tax: z.string().optional(),
      discount: z.string().optional(),
      total: z.string(),
      paymentMethod: z.enum(["cash", "card", "transfer", "credit", "mixed"]).default("cash"),
      paymentStatus: z.enum(["paid", "pending", "partial"]).default("paid"),
      amountPaid: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitPrice: z.string(),
        costPrice: z.string().optional(),
        discount: z.string().optional(),
        total: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { items, ...saleData } = input;

      const [saleResult] = await db.insert(sales).values(saleData);
      const saleId = Number(saleResult.insertId);

      for (const item of items) {
        await db.insert(saleItems).values({ ...item, saleId });

        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        });
        if (product) {
          const newQuantity = Math.max(0, product.quantity - item.quantity);
          await db.update(products)
            .set({ quantity: newQuantity })
            .where(eq(products.id, item.productId));

          await db.insert(inventoryLogs).values({
            productId: item.productId,
            type: "out",
            quantity: -item.quantity,
            previousStock: product.quantity,
            newStock: newQuantity,
            reason: `Sale #${saleData.invoiceNumber}`,
            referenceId: saleId,
            referenceType: "sale",
          });
        }
      }

      return { id: saleId, invoiceNumber: saleData.invoiceNumber };
    }),

  cancel: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(sales).set({ status: "cancelled" }).where(eq(sales.id, input.id));
      return { success: true };
    }),

  todayStats: publicQuery.query(async () => {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await db.query.sales.findMany({
      where: gte(sales.createdAt, today),
    });

    const totalSales = todaySales.length;
    const totalRevenue = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalItems = todaySales.reduce((sum, s) => sum + Number(s.subtotal), 0);

    return { totalSales, totalRevenue, totalItems };
  }),

  salesByDate: publicQuery
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.sales.findMany({
        where: and(
          gte(sales.createdAt, new Date(input.startDate)),
          lte(sales.createdAt, new Date(input.endDate)),
        ),
      });
    }),
});
