import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Package } from "lucide-react";

export default function Inventory() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data: products } = trpc.product.list.useQuery({ search: search || undefined });
  const { data: summary } = trpc.report.inventorySummary.useQuery();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("inventory")}</h1>
        {summary && (
          <div className="flex gap-4 text-sm">
            <div className="text-right"><p className="text-muted-foreground">{t("totalProducts")}</p><p className="font-bold text-lg">{summary.totalProducts}</p></div>
            <div className="text-right"><p className="text-muted-foreground">{t("lowStock")}</p><p className="font-bold text-lg text-amber-600">{summary.lowStockCount}</p></div>
            <div className="text-right"><p className="text-muted-foreground">Value</p><p className="font-bold text-lg text-cyan-600">${summary.totalStockValue.toFixed(0)}</p></div>
          </div>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="space-y-2">
        {products?.map((product) => {
          const stockPercent = Math.min(100, (product.quantity / Math.max(product.minStock || 5, 1)) * 100);
          return (
            <Card key={product.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{product.name}</p>
                      {product.quantity === 0 && <Badge variant="destructive" className="text-[10px]">{t("outOfStock")}</Badge>}
                      {product.quantity > 0 && product.quantity <= (product.minStock || 5) && <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">{t("lowStock")}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{product.category?.name} - {product.barcode}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Stock: {product.quantity} / {product.minStock || 5}</span>
                        <span className="font-medium">${Number(product.costPrice || 0).toFixed(2)} cost</span>
                      </div>
                      <Progress value={stockPercent} className={`h-2 ${stockPercent <= 30 ? "bg-red-100" : stockPercent <= 70 ? "bg-amber-100" : "bg-emerald-100"}`} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
