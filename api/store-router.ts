import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { stores, printers, settings, receiptSettings, localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

export const storeRouter = createRouter({
  // ─── Stores ────────────────────────────────────────────────────────
  storeList: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(stores).orderBy(stores.name);
  }),

  storeGetById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.stores.findFirst({
        where: eq(stores.id, input.id),
      });
    }),

  storeUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      logo: z.string().optional(),
      rnc: z.string().optional(),
      taxId: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      currency: z.string().optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(stores).set(data).where(eq(stores.id, id));
      return { success: true };
    }),

  // ─── Printers ──────────────────────────────────────────────────────
  printerList: publicQuery
    .input(z.object({ storeId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.printers.findMany({
        where: input?.storeId ? eq(printers.storeId, input.storeId) : undefined,
        orderBy: printers.name,
      });
    }),

  printerCreate: publicQuery
    .input(z.object({
      name: z.string().min(1),
      image: z.string().optional(),
      type: z.enum(["thermal", "inkjet", "laser"]).default("thermal"),
      connectionType: z.enum(["usb", "network", "bluetooth"]).default("usb"),
      ipAddress: z.string().optional(),
      port: z.string().optional(),
      paperWidth: z.number().default(80),
      isDefault: z.boolean().default(false),
      storeId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      if (input.isDefault) {
        await db.update(printers).set({ isDefault: false }).where(eq(printers.isDefault, true));
      }
      const [result] = await db.insert(printers).values(input);
      return { id: Number(result.insertId) };
    }),

  printerUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      image: z.string().optional(),
      type: z.enum(["thermal", "inkjet", "laser"]).optional(),
      connectionType: z.enum(["usb", "network", "bluetooth"]).optional(),
      ipAddress: z.string().optional(),
      port: z.string().optional(),
      paperWidth: z.number().optional(),
      isDefault: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      if (data.isDefault) {
        await db.update(printers).set({ isDefault: false }).where(eq(printers.isDefault, true));
      }
      await db.update(printers).set(data).where(eq(printers.id, id));
      return { success: true };
    }),

  printerDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(printers).set({ isActive: false }).where(eq(printers.id, input.id));
      return { success: true };
    }),

  // ─── Settings ──────────────────────────────────────────────────────
  settingsList: publicQuery
    .input(z.object({ group: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.settings.findMany({
        where: input?.group ? eq(settings.group, input.group) : undefined,
      });
    }),

  settingsGet: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.settings.findFirst({
        where: eq(settings.key, input.key),
      });
    }),

  settingsSet: publicQuery
    .input(z.object({
      key: z.string(),
      value: z.string(),
      group: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.settings.findFirst({
        where: eq(settings.key, input.key),
      });
      if (existing) {
        await db.update(settings).set({ value: input.value }).where(eq(settings.key, input.key));
      } else {
        await db.insert(settings).values(input);
      }
      return { success: true };
    }),

  // ─── Receipt Settings ──────────────────────────────────────────────
  receiptSettingsGet: publicQuery
    .input(z.object({ storeId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.receiptSettings.findFirst({
        where: eq(receiptSettings.storeId, input.storeId),
      });
    }),

  receiptSettingsUpdate: publicQuery
    .input(z.object({
      id: z.number().optional(),
      storeId: z.number(),
      headerText: z.string().optional(),
      footerText: z.string().optional(),
      showLogo: z.boolean().optional(),
      showBarcode: z.boolean().optional(),
      paperWidth: z.number().optional(),
      autoPrint: z.boolean().optional(),
      thankYouMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, storeId, ...data } = input;
      const existing = await db.query.receiptSettings.findFirst({
        where: eq(receiptSettings.storeId, storeId),
      });
      if (existing) {
        await db.update(receiptSettings).set(data).where(eq(receiptSettings.id, existing.id));
      } else {
        await db.insert(receiptSettings).values({ storeId, ...data });
      }
      return { success: true };
    }),

  // ─── Local Users ───────────────────────────────────────────────────
  userList: publicQuery.query(async () => {
    const db = getDb();
    return db.query.localUsers.findMany({
      with: { store: true },
      orderBy: localUsers.name,
    });
  }),

  userCreate: publicQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "manager", "cashier"]).default("cashier"),
      storeId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash(input.password, 10);
      const [result] = await db.insert(localUsers).values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        storeId: input.storeId,
      });
      return { id: Number(result.insertId) };
    }),

  userUpdate: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "manager", "cashier"]).optional(),
      storeId: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(localUsers).set(data).where(eq(localUsers.id, id));
      return { success: true };
    }),

  userDelete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(localUsers).set({ isActive: false }).where(eq(localUsers.id, input.id));
      return { success: true };
    }),
});
