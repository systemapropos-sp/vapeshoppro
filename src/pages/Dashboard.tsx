import { useTranslation } from "react-i18next";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useDemoStore } from "@/stores/demoStore";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import {
  DollarSign, Package, Users, UserCog,
  TrendingUp, AlertTriangle, Receipt
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isDemo } = useLocalAuth();
  const navigate = useNavigate();
  const demoStore = useDemoStore();

  // Backend queries
  const { data: statsBe } = trpc.report.dashboard.useQuery(undefined, { enabled: !isDemo });
  const { data: lowStockBe } = trpc.product.lowStock.useQuery(undefined, { enabled: !isDemo });
  const { data: recentSalesBe } = trpc.sale.list.useQuery({ limit: 5 }, { enabled: !isDemo });

  // Demo data
  const products = isDemo ? demoStore.getProducts() : [];
  const customers = isDemo ? demoStore.getCustomers() : [];
  const employees = isDemo ? demoStore.getEmployees() : [];
  const sales = isDemo ? demoStore.getSales() : [];
  const allProducts = isDemo ? demoStore.getProducts() : [];

  const todayRevenue = isDemo
    ? sales.filter((s: any) => new Date(s.createdAt) >= new Date(new Date().setHours(0, 0, 0, 0))).reduce((sum: number, s: any) => sum + Number(s.total), 0)
    : (statsBe?.todayRevenue || 0);
  const _todayTransactions = isDemo
    ? sales.filter((s: any) => new Date(s.createdAt) >= new Date(new Date().setHours(0, 0, 0, 0))).length
    : (statsBe?.todayTransactions || 0);
  void _todayTransactions;
  const monthRevenue = isDemo
    ? sales.reduce((sum: number, s: any) => sum + Number(s.total), 0)
    : (statsBe?.monthRevenue || 0);
  const totalProducts = isDemo ? products.length : (statsBe?.totalProducts || 0);
  const totalCustomers = isDemo ? customers.length : (statsBe?.totalCustomers || 0);
  const totalEmployees = isDemo ? employees.filter((e: any) => e.isActive).length : (statsBe?.totalEmployees || 0);
  const lowStock = isDemo ? allProducts.filter((p: any) => p.quantity <= (p.minStock || 5)) : (lowStockBe || []);
  const recentSales = isDemo ? sales.slice(0, 5) : (recentSalesBe || []);

  const statCards = [
    { title: t("dailySales"), value: todayRevenue, prefix: "$", icon: DollarSign, color: "from-emerald-500 to-green-500", path: "/sales" },
    { title: t("monthlySales"), value: monthRevenue, prefix: "$", icon: DollarSign, color: "from-teal-500 to-emerald-500", path: "/sales" },
    { title: t("totalProducts"), value: totalProducts, icon: Package, color: "from-violet-500 to-purple-500", path: "/products" },
    { title: t("totalCustomers"), value: totalCustomers, icon: Users, color: "from-amber-500 to-orange-500", path: "/customers" },
    { title: t("activeEmployees"), value: totalEmployees, icon: UserCog, color: "from-pink-500 to-rose-500", path: "/employees" },
    { title: t("lowStockProducts"), value: lowStock.length, icon: AlertTriangle, color: "from-red-500 to-red-600", path: "/inventory" },
  ];

  const quickActions = [
    { label: t("pos"), icon: Receipt, path: "/pos", color: "bg-gradient-to-r from-cyan-500 to-blue-500" },
    { label: t("products"), icon: Package, path: "/products", color: "bg-gradient-to-r from-violet-500 to-purple-500" },
    { label: t("customers"), icon: Users, path: "/customers", color: "bg-gradient-to-r from-emerald-500 to-green-500" },
    { label: t("reports"), icon: TrendingUp, path: "/reports", color: "bg-gradient-to-r from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-3 text-center">
          <p className="text-amber-300 text-sm font-medium">Demo Mode - All features working with sample data</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{t("welcomeBack")}, {user?.name}</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
        </div>
        <Button onClick={() => navigate("/pos")} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <Receipt className="w-4 h-4 mr-2" /> {t("pos")}
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={() => navigate(card.path)}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{card.prefix}{typeof card.value === "number" ? card.value.toLocaleString("en", { minimumFractionDigits: card.prefix === "$" ? 2 : 0, maximumFractionDigits: 2 }) : card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-3 dark:text-white">{t("quickAccess")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button key={action.label} onClick={() => navigate(action.path)} className={`${action.color} text-white h-16 text-base font-medium hover:opacity-90 transition-opacity`}>
              <action.icon className="w-5 h-5 mr-2" /> {action.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />{t("lowStockAlert")}
            </h3>
            {lowStock.length > 0 ? (
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>
                      <div><p className="text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.category?.name}</p></div>
                    </div>
                    <Badge variant={product.quantity === 0 ? "destructive" : "secondary"} className="text-xs">{product.quantity} / {product.minStock || 5}</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">{t("noResults")}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-cyan-500" />{t("recentSales")}
            </h3>
            {recentSales.length > 0 ? (
              <div className="space-y-2">
                {recentSales.map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div><p className="text-sm font-medium">#{sale.invoiceNumber}</p><p className="text-xs text-muted-foreground">{sale.customer?.name || "Walk-in"} - {format(new Date(sale.createdAt), "MMM dd, HH:mm")}</p></div>
                    <p className="text-sm font-bold">${Number(sale.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">{t("noResults")}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
