import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { expenses } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const expenseRouter = createRouter({
  list: publicQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.startDate) conditions.push(gte(expenses.date, new Date(input.startDate)));
      if (input?.endDate) conditions.push(lte(expenses.date, new Date(input.endDate)));
      if (input?.category) conditions.push(eq(expenses.category, input.category));

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      return db.query.expenses.findMany({
        where,
        orderBy: desc(expenses.createdAt),
      });
    }),

  create: publicQuery
    .input(z.object({
      category: z.string().min(1),
      description: z.string().min(1),
      amount: z.string(),
      paymentMethod: z.enum(["cash", "card", "transfer"]).optional(),
      receiptNumber: z.string().optional(),
      date: z.string(),
      notes: z.string().optional(),
      isRecurring: z.boolean().optional(),
      recurringFrequency: z.enum(["weekly", "monthly", "yearly"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(expenses).values({
        ...input,
        date: new Date(input.date),
      });
      return { id: Number(result.insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      category: z.string().optional(),
      description: z.string().optional(),
      amount: z.string().optional(),
      paymentMethod: z.enum(["cash", "card", "transfer"]).optional(),
      receiptNumber: z.string().optional(),
      date: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, date, ...data } = input;
      const updateData: any = { ...data };
      if (date) updateData.date = new Date(date);
      await db.update(expenses).set(updateData).where(eq(expenses.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(expenses).where(eq(expenses.id, input.id));
      return { success: true };
    }),
});
