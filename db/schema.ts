import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  bigint,
  // json - available if needed for complex data
  date,
} from "drizzle-orm/mysql-core";

// ─── Users (OAuth) ─────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Local Users (Email/Password Auth) ─────────────────────────────
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["admin", "manager", "cashier"]).default("admin").notNull(),
  storeId: bigint("store_id", { mode: "number", unsigned: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at"),
});

export type LocalUser = typeof localUsers.$inferSelect;

// ─── Stores ────────────────────────────────────────────────────────
export const stores = mysqlTable("stores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  rnc: varchar("rnc", { length: 50 }),
  taxId: varchar("tax_id", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  currency: varchar("currency", { length: 10 }).default("DOP"),
  timezone: varchar("timezone", { length: 50 }).default("America/Santo_Domingo"),
  isActive: boolean("is_active").default(true).notNull(),
  membershipExpiry: date("membership_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Store = typeof stores.$inferSelect;

// ─── Categories ────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#6366f1"),
  icon: varchar("icon", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

// ─── Suppliers ─────────────────────────────────────────────────────
export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image: text("image"),
  contactName: varchar("contact_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  rnc: varchar("rnc", { length: 50 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Supplier = typeof suppliers.$inferSelect;

// ─── Products ──────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  barcode: varchar("barcode", { length: 100 }),
  sku: varchar("sku", { length: 100 }),
  image: text("image"),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }).default("0"),
  salePrice: decimal("sale_price", { precision: 12, scale: 2 }).default("0").notNull(),
  wholesalePrice: decimal("wholesale_price", { precision: 12, scale: 2 }),
  quantity: int("quantity").default(0).notNull(),
  minStock: int("min_stock").default(5),
  unit: varchar("unit", { length: 50 }).default("unidad"),
  isActive: boolean("is_active").default(true).notNull(),
  hasVariants: boolean("has_variants").default(false),
  isKit: boolean("is_kit").default(false),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;

// ─── Kit Items ─────────────────────────────────────────────────────
export const kitItems = mysqlTable("kit_items", {
  id: serial("id").primaryKey(),
  kitId: bigint("kit_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type KitItem = typeof kitItems.$inferSelect;

// ─── Customers ─────────────────────────────────────────────────────
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image: text("image"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  idCard: varchar("id_card", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  notes: text("notes"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0"),
  currentCredit: decimal("current_credit", { precision: 12, scale: 2 }).default("0"),
  isVip: boolean("is_vip").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Customer = typeof customers.$inferSelect;

// ─── Employees ─────────────────────────────────────────────────────
export const employees = mysqlTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image: text("image"),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  idCard: varchar("id_card", { length: 50 }),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),
  salary: decimal("salary", { precision: 12, scale: 2 }).default("0"),
  pin: varchar("pin", { length: 10 }),
  hireDate: date("hire_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Employee = typeof employees.$inferSelect;

// ─── Payroll Records ───────────────────────────────────────────────
export const payrollRecords = mysqlTable("payroll_records", {
  id: serial("id").primaryKey(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  baseSalary: decimal("base_salary", { precision: 12, scale: 2 }).notNull(),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  totalPay: decimal("total_pay", { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  paidAt: timestamp("paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PayrollRecord = typeof payrollRecords.$inferSelect;

// ─── Loans ─────────────────────────────────────────────────────────
export const loans = mysqlTable("loans", {
  id: serial("id").primaryKey(),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  remaining: decimal("remaining", { precision: 12, scale: 2 }).notNull(),
  installments: int("installments").default(1),
  amountPerInstallment: decimal("amount_per_installment", { precision: 10, scale: 2 }),
  reason: text("reason"),
  status: mysqlEnum("status", ["active", "paid", "cancelled"]).default("active").notNull(),
  approvedBy: bigint("approved_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Loan = typeof loans.$inferSelect;

// ─── Sales ─────────────────────────────────────────────────────────
export const sales = mysqlTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  employeeId: bigint("employee_id", { mode: "number", unsigned: true }),
  storeId: bigint("store_id", { mode: "number", unsigned: true }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "transfer", "credit", "mixed"]).default("cash").notNull(),
  paymentStatus: mysqlEnum("payment_status", ["paid", "pending", "partial"]).default("paid").notNull(),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["completed", "cancelled", "refunded"]).default("completed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;

// ─── Sale Items ────────────────────────────────────────────────────
export const saleItems = mysqlTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: bigint("sale_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SaleItem = typeof saleItems.$inferSelect;

// ─── Purchases ─────────────────────────────────────────────────────
export const purchases = mysqlTable("purchases", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }),
  storeId: bigint("store_id", { mode: "number", unsigned: true }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "transfer", "credit"]).default("cash"),
  paymentStatus: mysqlEnum("payment_status", ["paid", "pending", "partial"]).default("paid"),
  status: mysqlEnum("status", ["ordered", "received", "cancelled"]).default("ordered"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Purchase = typeof purchases.$inferSelect;

// ─── Purchase Items ────────────────────────────────────────────────
export const purchaseItems = mysqlTable("purchase_items", {
  id: serial("id").primaryKey(),
  purchaseId: bigint("purchase_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  quantity: int("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 12, scale: 2 }).notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PurchaseItem = typeof purchaseItems.$inferSelect;

// ─── Expenses ──────────────────────────────────────────────────────
export const expenses = mysqlTable("expenses", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "transfer"]).default("cash"),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  date: date("date").notNull(),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: mysqlEnum("recurring_frequency", ["weekly", "monthly", "yearly"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;

// ─── Inventory Logs ────────────────────────────────────────────────
export const inventoryLogs = mysqlTable("inventory_logs", {
  id: serial("id").primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["in", "out", "adjustment", "transfer", "damage"]).notNull(),
  quantity: int("quantity").notNull(),
  previousStock: int("previous_stock").notNull(),
  newStock: int("new_stock").notNull(),
  reason: varchar("reason", { length: 255 }),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  referenceType: varchar("reference_type", { length: 50 }),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InventoryLog = typeof inventoryLogs.$inferSelect;

// ─── Vouchers (Comprobantes) ──────────────────────────────────────
export const vouchers = mysqlTable("vouchers", {
  id: serial("id").primaryKey(),
  voucherNumber: varchar("voucher_number", { length: 50 }).notNull().unique(),
  type: mysqlEnum("type", ["income", "expense", "transfer", "adjustment"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  referenceType: varchar("reference_type", { length: 50 }),
  status: mysqlEnum("status", ["active", "cancelled"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Voucher = typeof vouchers.$inferSelect;

// ─── Printers ──────────────────────────────────────────────────────
export const printers = mysqlTable("printers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image: text("image"),
  type: mysqlEnum("type", ["thermal", "inkjet", "laser"]).default("thermal").notNull(),
  connectionType: mysqlEnum("connection_type", ["usb", "network", "bluetooth"]).default("usb").notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  port: varchar("port", { length: 10 }),
  paperWidth: int("paper_width").default(80),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  storeId: bigint("store_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Printer = typeof printers.$inferSelect;

// ─── Notifications ─────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "warning", "success", "error"]).default("info").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  entityType: varchar("entity_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── Activity Log ──────────────────────────────────────────────────
export const activityLog = mysqlTable("activity_log", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  description: text("description"),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  userName: varchar("user_name", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;

// ─── Settings ──────────────────────────────────────────────────────
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  group: varchar("group", { length: 50 }).default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;

// ─── Receipt Settings ──────────────────────────────────────────────
export const receiptSettings = mysqlTable("receipt_settings", {
  id: serial("id").primaryKey(),
  storeId: bigint("store_id", { mode: "number", unsigned: true }),
  headerText: text("header_text"),
  footerText: text("footer_text"),
  showLogo: boolean("show_logo").default(true),
  showBarcode: boolean("show_barcode").default(true),
  paperWidth: int("paper_width").default(80),
  autoPrint: boolean("auto_print").default(false),
  thankYouMessage: varchar("thank_you_message", { length: 255 }).default("Gracias por su compra!"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ReceiptSetting = typeof receiptSettings.$inferSelect;
