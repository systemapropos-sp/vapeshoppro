import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { productRouter } from "./product-router";
import { customerRouter } from "./customer-router";
import { supplierRouter } from "./supplier-router";
import { employeeRouter } from "./employee-router";
import { saleRouter } from "./sale-router";
import { purchaseRouter } from "./purchase-router";
import { expenseRouter } from "./expense-router";
import { storeRouter } from "./store-router";
import { reportRouter } from "./report-router";
import { voucherRouter } from "./voucher-router";
import { notificationRouter } from "./notification-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  product: productRouter,
  customer: customerRouter,
  supplier: supplierRouter,
  employee: employeeRouter,
  sale: saleRouter,
  purchase: purchaseRouter,
  expense: expenseRouter,
  store: storeRouter,
  report: reportRouter,
  voucher: voucherRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
