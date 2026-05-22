import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { purchases, purchaseItems, products, inventoryLogs } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const purchaseRouter = createRouter({
  list: publicQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      supplierId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.startDate) conditions.push(gte(purchases.createdAt, new Date(input.startDate)));
      if (input?.endDate) conditions.push(lte(purchases.createdAt, new Date(input.endDate)));
      if (input?.supplierId) conditions.push(eq(purchases.supplierId, input.supplierId));

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.query.purchases.findMany({
        where,
        with: { supplier: true, purchaseItems: { with: { product: true } } },
        orderBy: desc(purchases.createdAt),
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.purchases.findFirst({
        where: eq(purchases.id, input.id),
        with: { supplier: true, purchaseItems: { with: { product: true } } },
      });
    }),

  create: publicQuery
    .input(z.object({
      invoiceNumber: z.string().optional(),
      supplierId: z.number().optional(),
      storeId: z.number().optional(),
      subtotal: z.string(),
      tax: z.string().optional(),
      discount: z.string().optional(),
      total: z.string(),
      paymentMethod: z.enum(["cash", "card", "transfer", "credit"]).optional(),
      paymentStatus: z.enum(["paid", "pending", "partial"]).optional(),
      notes: z.string().optional(),
      items: z.array(z.object({
        productId: z.number(),
        quantity: z.number(),
        unitCost: z.string(),
        total: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { items, ...purchaseData } = input;

      const [result] = await db.insert(purchases).values(purchaseData);
      const purchaseId = Number(result.insertId);

      for (const item of items) {
        await db.insert(purchaseItems).values({ ...item, purchaseId });

        const product = await db.query.products.findFirst({
          where: eq(products.id, item.productId),
        });
        if (product) {
          const newQuantity = product.quantity + item.quantity;
          await db.update(products)
            .set({ quantity: newQuantity, costPrice: item.unitCost })
            .where(eq(products.id, item.productId));

          await db.insert(inventoryLogs).values({
            productId: item.productId,
            type: "in",
            quantity: item.quantity,
            previousStock: product.quantity,
            newStock: newQuantity,
            reason: `Purchase #${purchaseData.invoiceNumber || purchaseId}`,
            referenceId: purchaseId,
            referenceType: "purchase",
          });
        }
      }

      return { id: purchaseId };
    }),

  updateStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["ordered", "received", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(purchases).set({ status: input.status }).where(eq(purchases.id, input.id));
      return { success: true };
    }),
});
