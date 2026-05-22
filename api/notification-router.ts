import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications, activityLog } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: publicQuery
    .input(z.object({ isRead: z.boolean().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const where = input?.isRead !== undefined ? eq(notifications.isRead, input.isRead) : undefined;
      return db.query.notifications.findMany({
        where,
        orderBy: desc(notifications.createdAt),
        limit: 50,
      });
    }),

  create: publicQuery
    .input(z.object({
      title: z.string(),
      message: z.string(),
      type: z.enum(["info", "warning", "success", "error"]).default("info"),
      userId: z.number().optional(),
      entityId: z.number().optional(),
      entityType: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(notifications).values(input);
      return { id: Number(result.insertId) };
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllRead: publicQuery.mutation(async () => {
    const db = getDb();
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.isRead, false));
    return { success: true };
  }),

  activityList: publicQuery
    .input(z.object({
      entity: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.activityLog.findMany({
        where: input?.entity ? eq(activityLog.entity, input.entity) : undefined,
        orderBy: desc(activityLog.createdAt),
        limit: input?.limit || 50,
      });
    }),

  activityCreate: publicQuery
    .input(z.object({
      action: z.string(),
      entity: z.string(),
      entityId: z.number().optional(),
      description: z.string().optional(),
      userId: z.number().optional(),
      userName: z.string().optional(),
      ipAddress: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [result] = await db.insert(activityLog).values(input);
      return { id: Number(result.insertId) };
    }),
});
