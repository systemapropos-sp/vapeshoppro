import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers } from "@db/schema";
import { eq, like, desc, and } from "drizzle-orm";

export const customerRouter = createRouter({
  list: publicQuery
    .input(z.object({
      search: z.string().optional(),
      isVip: z.boolean().optional(),
      hasCredit: z.boolean().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.search) {
        conditions.push(like(customers.name, `%${input.search}%`));
      }
      if (input?.isVip !== undefined) {
        conditions.push(eq(customers.isVip, input.isVip));
      }
      
      const where = conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;
      
      return db.query.customers.findMany({
        where,
        orderBy: desc(customers.createdAt),
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.customers.findFirst({
        where: eq(customers.id, input.id),
        with: { sales: true },
      });
    }),

  create: publicQuery
    .input(z.object({
      name: z.string().min(1),
      image: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      idCard: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      notes: z.string().optional(),
      creditLimit: z.string().optional(),
      isVip: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(customers).values(input);
      return { id: Number(result.insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      image: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      idCard: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      notes: z.string().optional(),
      creditLimit: z.string().optional(),
      currentCredit: z.string().optional(),
      isVip: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(customers).set(data).where(eq(customers.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(customers).set({ isActive: false }).where(eq(customers.id, input.id));
      return { success: true };
    }),
});
