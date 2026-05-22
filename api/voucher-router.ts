import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { vouchers } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const voucherRouter = createRouter({
  list: publicQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      type: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.startDate) conditions.push(gte(vouchers.createdAt, new Date(input.startDate)));
      if (input?.endDate) conditions.push(lte(vouchers.createdAt, new Date(input.endDate)));
      if (input?.type) conditions.push(eq(vouchers.type, input.type as any));

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.query.vouchers.findMany({
        where,
        orderBy: desc(vouchers.createdAt),
      });
    }),

  create: publicQuery
    .input(z.object({
      voucherNumber: z.string(),
      type: z.enum(["income", "expense", "transfer", "adjustment"]),
      amount: z.string(),
      description: z.string(),
      referenceId: z.number().optional(),
      referenceType: z.string().optional(),
      notes: z.string().optional(),
      createdBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(vouchers).values(input);
      return { id: Number(result.insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      amount: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["active", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(vouchers).set(data).where(eq(vouchers.id, id));
      return { success: true };
    }),
});
