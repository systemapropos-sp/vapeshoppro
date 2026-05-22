import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { History, User, ShoppingCart, Package, DollarSign, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function HistoryPage() {
  const { t } = useTranslation();
  const { data: activities } = trpc.notification.activityList.useQuery({ limit: 100 });

  const icons: Record<string, any> = {
    sale: ShoppingCart, product: Package, expense: DollarSign, user: User, inventory: AlertTriangle,
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">{t("history")}</h1>
      <div className="space-y-2">
        {activities?.map((a) => {
          const Icon = icons[a.entity] || History;
          return (
            <Card key={a.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{a.action} - {a.entity}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-muted-foreground">{a.userName} - {format(new Date(a.createdAt), "MMM dd, yyyy HH:mm")}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!activities || activities.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("noResults")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
