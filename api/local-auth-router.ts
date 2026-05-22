import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers, employees, stores } from "@db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.APP_SECRET || "vapeshopro-secret-key";

export const localAuthRouter = createRouter({
  // ─── Local Admin Login (Email + Password) ──────────────────────────
  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.query.localUsers.findFirst({
        where: eq(localUsers.email, input.email),
      });

      if (!user || !user.isActive) {
        throw new Error("Invalid credentials");
      }

      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new Error("Invalid credentials");
      }

      await db
        .update(localUsers)
        .set({ lastSignInAt: new Date() })
        .where(eq(localUsers.id, user.id));

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, type: "local" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          storeId: user.storeId,
        },
      };
    }),

  // ─── Employee Login (PIN) ──────────────────────────────────────────
  loginPin: publicQuery
    .input(
      z.object({
        pin: z.string().min(4).max(10),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const employee = await db.query.employees.findFirst({
        where: eq(employees.pin, input.pin),
      });

      if (!employee || !employee.isActive) {
        throw new Error("Invalid PIN");
      }

      const token = jwt.sign(
        {
          id: employee.id,
          name: employee.name,
          role: "employee",
          type: "pin",
          position: employee.position,
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return {
        token,
        user: {
          id: employee.id,
          name: employee.name,
          role: "employee",
          image: employee.image,
          position: employee.position,
        },
      };
    }),

  // ─── Get Current Local User ────────────────────────────────────────
  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("x-local-auth-token");
    if (!authHeader) return null;

    try {
      const decoded = jwt.verify(authHeader, JWT_SECRET) as any;
      if (decoded.type === "local") {
        const db = getDb();
        const user = await db.query.localUsers.findFirst({
          where: eq(localUsers.id, decoded.id),
        });
        if (!user || !user.isActive) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          storeId: user.storeId,
          type: "local",
        };
      } else if (decoded.type === "pin") {
        return {
          id: decoded.id,
          name: decoded.name,
          role: decoded.role,
          position: decoded.position,
          type: "pin",
        };
      }
      return null;
    } catch {
      return null;
    }
  }),

  // ─── Register New Business ─────────────────────────────────────────
  register: publicQuery
    .input(
      z.object({
        businessName: z.string().min(2),
        ownerName: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        rnc: z.string().optional(),
        taxId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db.query.localUsers.findFirst({
        where: eq(localUsers.email, input.email),
      });
      if (existing) throw new Error("Email already registered");

      // Create store
      const [store] = await db
        .insert(stores)
        .values({
          name: input.businessName,
          rnc: input.rnc || null,
          taxId: input.taxId || null,
          phone: input.phone || null,
          address: input.address || null,
          city: input.city || null,
          country: "Dominican Republic",
          currency: "DOP",
          membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        });

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [user] = await db
        .insert(localUsers)
        .values({
          name: input.ownerName,
          email: input.email,
          password: hashedPassword,
          role: "admin",
          storeId: Number(store.insertId),
        });

      return {
        success: true,
        userId: Number(user.insertId),
        storeId: Number(store.insertId),
      };
    }),

  // ─── Forgot Password ───────────────────────────────────────────────
  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.query.localUsers.findFirst({
        where: eq(localUsers.email, input.email),
      });

      if (!user) {
        return { success: true };
      }

      return { success: true };
    }),

  // ─── Change Password ───────────────────────────────────────────────
  changePassword: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.query.localUsers.findFirst({
        where: eq(localUsers.email, input.email),
      });

      if (!user) throw new Error("User not found");

      const valid = await bcrypt.compare(input.currentPassword, user.password);
      if (!valid) throw new Error("Current password is incorrect");

      const hashed = await bcrypt.hash(input.newPassword, 10);
      await db
        .update(localUsers)
        .set({ password: hashed })
        .where(eq(localUsers.id, user.id));

      return { success: true };
    }),

  // ─── Update Profile ────────────────────────────────────────────────
  updateProfile: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        avatar: z.string().optional(),
        storeId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(localUsers).set(data).where(eq(localUsers.id, id));
      return { success: true };
    }),
});
