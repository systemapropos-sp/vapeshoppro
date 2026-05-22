import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Reports() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 30 * 86400000), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [tab, setTab] = useState("sales");

  const { data: salesSummary } = trpc.report.salesSummary.useQuery({ startDate, endDate }, { enabled: tab === "sales" });
  const { data: topProducts } = trpc.report.topProducts.useQuery({ startDate, endDate, limit: 10 }, { enabled: tab === "sales" });
  const { data: expenseSummary } = trpc.report.expenseSummary.useQuery({ startDate, endDate }, { enabled: tab === "expenses" });
  const { data: inventorySummary } = trpc.report.inventorySummary.useQuery(undefined, { enabled: tab === "inventory" });
  const { data: dashboard } = trpc.report.dashboard.useQuery(undefined, { enabled: tab === "overview" });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("reports")}</h1>
        <div className="flex gap-2">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview"><TrendingUp className="w-4 h-4 mr-1" /> {t("dashboard")}</TabsTrigger>
          <TabsTrigger value="sales"><DollarSign className="w-4 h-4 mr-1" /> {t("sales")}</TabsTrigger>
          <TabsTrigger value="expenses"><ShoppingBag className="w-4 h-4 mr-1" /> {t("expenses")}</TabsTrigger>
          <TabsTrigger value="inventory"><BarChart className="w-4 h-4 mr-1" /> {t("inventory")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboard && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title={t("dailySales")} value={`$${dashboard.todayRevenue.toFixed(2)}`} icon={DollarSign} color="emerald" />
              <StatCard title={t("monthlySales")} value={`$${dashboard.monthRevenue.toFixed(2)}`} icon={TrendingUp} color="cyan" />
              <StatCard title={t("totalProducts")} value={dashboard.totalProducts} icon={BarChart} color="violet" />
              <StatCard title={t("totalCustomers")} value={dashboard.totalCustomers} icon={ShoppingBag} color="amber" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          {salesSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title={t("revenue")} value={`$${salesSummary.totalRevenue.toFixed(2)}`} icon={DollarSign} color="emerald" />
              <StatCard title={t("transactions")} value={salesSummary.totalTransactions} icon={ShoppingBag} color="cyan" />
              <StatCard title={t("averageTicket")} value={`$${salesSummary.averageTicket.toFixed(2)}`} icon={TrendingUp} color="violet" />
              <StatCard title={t("tax")} value={`$${salesSummary.totalTax.toFixed(2)}`} icon={DollarSign} color="amber" />
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{t("salesByPayment")}</CardTitle></CardHeader>
              <CardContent>
                {salesSummary?.byPaymentMethod && Object.entries(salesSummary.byPaymentMethod).map(([method, amount]) => (
                  <div key={method} className="flex justify-between py-2 border-b last:border-0">
                    <span className="capitalize">{method}</span>
                    <span className="font-medium">${Number(amount).toFixed(2)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("topProducts")}</CardTitle></CardHeader>
              <CardContent>
                {topProducts?.map((p, i) => (
                  <div key={i} className="flex justify-between py-2 border-b last:border-0">
                    <span className="text-sm">{p.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{p.quantity} sold</span>
                      <span className="text-sm text-cyan-600 ml-2">${p.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {expenseSummary && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard title={t("totalExpenses")} value={`$${expenseSummary.totalExpenses.toFixed(2)}`} icon={DollarSign} color="red" />
              <StatCard title={t("count")} value={expenseSummary.count} icon={ShoppingBag} color="orange" />
            </div>
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">{t("byCategory")}</CardTitle></CardHeader>
            <CardContent>
              {expenseSummary?.byCategory && Object.entries(expenseSummary.byCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between py-2 border-b last:border-0">
                  <span>{cat}</span>
                  <span className="font-medium">${Number(amount).toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          {inventorySummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title={t("totalProducts")} value={inventorySummary.totalProducts} icon={BarChart} color="emerald" />
              <StatCard title="Stock Value" value={`$${inventorySummary.totalStockValue.toFixed(0)}`} icon={DollarSign} color="cyan" />
              <StatCard title="Retail Value" value={`$${inventorySummary.totalRetailValue.toFixed(0)}`} icon={TrendingUp} color="violet" />
              <StatCard title={t("lowStock")} value={inventorySummary.lowStockCount} icon={ShoppingBag} color="amber" />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-500 to-green-500",
    cyan: "from-cyan-500 to-blue-500",
    violet: "from-violet-500 to-purple-500",
    amber: "from-amber-500 to-orange-500",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
  };
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colors[color]} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
