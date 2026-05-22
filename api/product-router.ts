import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, kitItems, inventoryLogs } from "@db/schema";
import { eq, like, desc, and, sql } from "drizzle-orm";

export const productRouter = createRouter({
  categoryList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories).orderBy(categories.name);
  }),

  categoryCreate: publicQuery
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(categories).values(input);
      return { id: Number(result.insertId) };
    }),

  categoryUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(categories).set(data).where(eq(categories.id, id));
      return { success: true };
    }),

  categoryDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(categories).set({ isActive: false }).where(eq(categories.id, input.id));
      return { success: true };
    }),

  list: publicQuery
    .input(z.object({
      search: z.string().optional(),
      categoryId: z.number().optional(),
      isActive: z.boolean().optional(),
      lowStock: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.search) {
        conditions.push(like(products.name, `%${input.search}%`));
      }
      if (input?.categoryId) {
        conditions.push(eq(products.categoryId, input.categoryId));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(products.isActive, input.isActive));
      }
      if (input?.lowStock) {
        conditions.push(sql`${products.quantity} <= ${products.minStock}`);
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.query.products.findMany({
        where,
        with: { category: true, supplier: true },
        orderBy: desc(products.createdAt),
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: { category: true, supplier: true, kitItems: { with: { product: true } } },
      });
    }),

  getByBarcode: publicQuery
    .input(z.object({ barcode: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.products.findFirst({
        where: eq(products.barcode, input.barcode),
      });
    }),

  create: publicQuery
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      barcode: z.string().optional(),
      sku: z.string().optional(),
      image: z.string().optional(),
      categoryId: z.number().optional(),
      supplierId: z.number().optional(),
      costPrice: z.string().optional(),
      salePrice: z.string(),
      wholesalePrice: z.string().optional(),
      quantity: z.number().default(0),
      minStock: z.number().default(5),
      unit: z.string().default("unidad"),
      taxRate: z.string().optional(),
      isKit: z.boolean().default(false),
      hasVariants: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const data: any = { ...input };
      if (input.image === undefined) delete data.image;
      const [result] = await db.insert(products).values(data);
      return { id: Number(result.insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      barcode: z.string().optional(),
      sku: z.string().optional(),
      image: z.string().optional(),
      categoryId: z.number().optional(),
      supplierId: z.number().optional(),
      costPrice: z.string().optional(),
      salePrice: z.string().optional(),
      wholesalePrice: z.string().optional(),
      quantity: z.number().optional(),
      minStock: z.number().optional(),
      unit: z.string().optional(),
      taxRate: z.string().optional(),
      isActive: z.boolean().optional(),
      isKit: z.boolean().optional(),
      hasVariants: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const prev = await db.query.products.findFirst({
        where: eq(products.id, id),
      });
      await db.update(products).set(data).where(eq(products.id, id));

      if (data.quantity !== undefined && prev && prev.quantity !== data.quantity) {
        await db.insert(inventoryLogs).values({
          productId: id,
          type: "adjustment",
          quantity: data.quantity - prev.quantity,
          previousStock: prev.quantity,
          newStock: data.quantity,
          reason: "Manual adjustment",
          referenceType: "product_update",
        });
      }
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(products).set({ isActive: false }).where(eq(products.id, input.id));
      return { success: true };
    }),

  kitItemCreate: publicQuery
    .input(z.object({
      kitId: z.number(),
      productId: z.number(),
      quantity: z.number().default(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(kitItems).values(input);
      return { id: Number(result.insertId) };
    }),

  kitItemDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(kitItems).where(eq(kitItems.id, input.id));
      return { success: true };
    }),

  lowStock: publicQuery.query(async () => {
    const db = getDb();
    return db.query.products.findMany({
      where: sql`${products.quantity} <= ${products.minStock}`,
      with: { category: true },
    });
  }),
});
