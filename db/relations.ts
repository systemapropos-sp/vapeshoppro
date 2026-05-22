import { relations } from "drizzle-orm";
import {
  localUsers,
  stores,
  categories,
  suppliers,
  products,
  kitItems,
  customers,
  employees,
  payrollRecords,
  loans,
  sales,
  saleItems,
  purchases,
  purchaseItems,
  inventoryLogs,
  printers,
  receiptSettings,
} from "./schema";

export const localUsersRelations = relations(localUsers, ({ one }) => ({
  store: one(stores, { fields: [localUsers.storeId], references: [stores.id] }),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  localUsers: many(localUsers),
  printers: many(printers),
  receiptSettings: many(receiptSettings),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  kitItems: many(kitItems),
  saleItems: many(saleItems),
  purchaseItems: many(purchaseItems),
  inventoryLogs: many(inventoryLogs),
}));

export const kitItemsRelations = relations(kitItems, ({ one }) => ({
  kit: one(products, { fields: [kitItems.kitId], references: [products.id] }),
  product: one(products, { fields: [kitItems.productId], references: [products.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  sales: many(sales),
  payrollRecords: many(payrollRecords),
  loans: many(loans),
}));

export const payrollRecordsRelations = relations(payrollRecords, ({ one }) => ({
  employee: one(employees, { fields: [payrollRecords.employeeId], references: [employees.id] }),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  employee: one(employees, { fields: [loans.employeeId], references: [employees.id] }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, { fields: [sales.customerId], references: [customers.id] }),
  employee: one(employees, { fields: [sales.employeeId], references: [employees.id] }),
  saleItems: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, { fields: [saleItems.saleId], references: [sales.id] }),
  product: one(products, { fields: [saleItems.productId], references: [products.id] }),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [purchases.supplierId], references: [suppliers.id] }),
  purchaseItems: many(purchaseItems),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, { fields: [purchaseItems.purchaseId], references: [purchases.id] }),
  product: one(products, { fields: [purchaseItems.productId], references: [products.id] }),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  product: one(products, { fields: [inventoryLogs.productId], references: [products.id] }),
}));

export const printersRelations = relations(printers, ({ one }) => ({
  store: one(stores, { fields: [printers.storeId], references: [stores.id] }),
}));

export const receiptSettingsRelations = relations(receiptSettings, ({ one }) => ({
  store: one(stores, { fields: [receiptSettings.storeId], references: [stores.id] }),
}));
