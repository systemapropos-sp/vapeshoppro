import { useTranslation } from "react-i18next";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, Package, Users, UserCog,
  TrendingUp, AlertTriangle, Receipt, ArrowRight
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useLocalAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = trpc.report.dashboard.useQuery();
  const { data: lowStock } = trpc.product.lowStock.useQuery();
  const { data: recentSales } = trpc.sale.list.useQuery({ limit: 5 });

  const statCards = [
    { title: t("dailySales"), value: stats?.todayRevenue || 0, prefix: "$", icon: DollarSign, color: "from-emerald-500 to-green-500", path: "/sales" },
    { title: t("transactions"), value: stats?.todayTransactions || 0, icon: ShoppingCart, color: "from-cyan-500 to-blue-500", path: "/sales" },
    { title: t("totalProducts"), value: stats?.totalProducts || 0, icon: Package, color: "from-violet-500 to-purple-500", path: "/products" },
    { title: t("totalCustomers"), value: stats?.totalCustomers || 0, icon: Users, color: "from-amber-500 to-orange-500", path: "/customers" },
    { title: t("activeEmployees"), value: stats?.totalEmployees || 0, icon: UserCog, color: "from-pink-500 to-rose-500", path: "/employees" },
    { title: t("lowStockProducts"), value: stats?.lowStock || 0, icon: AlertTriangle, color: "from-red-500 to-red-600", path: "/inventory" },
  ];

  const quickActions = [
    { label: t("pos"), icon: Receipt, path: "/pos", color: "bg-gradient-to-r from-cyan-500 to-blue-500" },
    { label: t("addProduct"), icon: Package, path: "/products", color: "bg-gradient-to-r from-violet-500 to-purple-500" },
    { label: t("addCustomer"), icon: Users, path: "/customers", color: "bg-gradient-to-r from-emerald-500 to-green-500" },
    { label: t("reports"), icon: TrendingUp, path: "/reports", color: "bg-gradient-to-r from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{t("welcomeBack")}, {user?.name}</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
        </div>
        <Button onClick={() => navigate("/pos")} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <Receipt className="w-4 h-4 mr-2" /> {t("pos")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={() => navigate(card.path)}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              {isLoading ? <Skeleton className="h-6 w-16" /> : (
                <p className="text-2xl font-bold">{card.prefix}{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3 dark:text-white">{t("quickAccess")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white h-16 text-base font-medium hover:opacity-90 transition-opacity`}
            >
              <action.icon className="w-5 h-5 mr-2" /> {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              {t("lowStockAlert")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock && lowStock.length > 0 ? (
              <div className="space-y-2">
                {lowStock.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center"><Package className="w-4 h-4 text-gray-400" /></div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                      </div>
                    </div>
                    <Badge variant={product.quantity === 0 ? "destructive" : "secondary"} className="text-xs">
                      {product.quantity} / {product.minStock || 5}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noResults")}</p>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate("/inventory")}>
              {t("viewAll")} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-500" />
              {t("recentSales")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales && recentSales.length > 0 ? (
              <div className="space-y-2">
                {recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">#{sale.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.customer?.name || "Walk-in"} - {format(new Date(sale.createdAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                    <p className="text-sm font-bold">${Number(sale.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noResults")}</p>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate("/sales")}>
              {t("viewAll")} <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
