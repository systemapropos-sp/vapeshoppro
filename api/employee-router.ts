import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { employees, payrollRecords, loans } from "@db/schema";
import { eq, like, desc } from "drizzle-orm";

export const employeeRouter = createRouter({
  list: publicQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const where = input?.search ? like(employees.name, `%${input.search}%`) : undefined;
      return db.query.employees.findMany({
        where,
        orderBy: desc(employees.createdAt),
      });
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.employees.findFirst({
        where: eq(employees.id, input.id),
        with: { payrollRecords: true, loans: true },
      });
    }),

  create: publicQuery
    .input(z.object({
      name: z.string().min(1),
      image: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      idCard: z.string().optional(),
      position: z.string().optional(),
      department: z.string().optional(),
      salary: z.string().optional(),
      pin: z.string().optional(),
      hireDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const data: any = { ...input };
      if (input.hireDate) data.hireDate = new Date(input.hireDate);
      const [result] = await db.insert(employees).values(data);
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
      position: z.string().optional(),
      department: z.string().optional(),
      salary: z.string().optional(),
      pin: z.string().optional(),
      hireDate: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, hireDate, ...data } = input;
      const updateData: any = { ...data };
      if (hireDate) updateData.hireDate = new Date(hireDate);
      await db.update(employees).set(updateData).where(eq(employees.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(employees).set({ isActive: false }).where(eq(employees.id, input.id));
      return { success: true };
    }),

  payrollList: publicQuery
    .input(z.object({ employeeId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const where = input?.employeeId ? eq(payrollRecords.employeeId, input.employeeId) : undefined;
      return db.query.payrollRecords.findMany({
        where,
        with: { employee: true },
        orderBy: desc(payrollRecords.createdAt),
      });
    }),

  payrollCreate: publicQuery
    .input(z.object({
      employeeId: z.number(),
      periodStart: z.string(),
      periodEnd: z.string(),
      baseSalary: z.string(),
      overtime: z.string().optional(),
      commission: z.string().optional(),
      bonus: z.string().optional(),
      deductions: z.string().optional(),
      tax: z.string().optional(),
      totalPay: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(payrollRecords).values({
        ...input,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
      });
      return { id: Number(result.insertId) };
    }),

  payrollUpdateStatus: publicQuery
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "paid", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const updateData: any = { status: input.status };
      if (input.status === "paid") updateData.paidAt = new Date();
      await db.update(payrollRecords).set(updateData).where(eq(payrollRecords.id, input.id));
      return { success: true };
    }),

  loanList: publicQuery.query(async () => {
    const db = getDb();
    return db.query.loans.findMany({
      with: { employee: true },
      orderBy: desc(loans.createdAt),
    });
  }),

  loanCreate: publicQuery
    .input(z.object({
      employeeId: z.number(),
      amount: z.string(),
      remaining: z.string(),
      installments: z.number().default(1),
      amountPerInstallment: z.string().optional(),
      reason: z.string().optional(),
      approvedBy: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(loans).values(input);
      return { id: Number(result.insertId) };
    }),

  loanUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      remaining: z.string().optional(),
      status: z.enum(["active", "paid", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(loans).set(data).where(eq(loans.id, id));
      return { success: true };
    }),
});
