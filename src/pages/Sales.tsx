import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Receipt, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function Sales() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const { data: sales } = trpc.sale.list.useQuery({ startDate: startDate || undefined, endDate: endDate || undefined });
  const utils = trpc.useUtils();
  const cancelMut = trpc.sale.cancel.useMutation({ onSuccess: () => utils.sale.list.invalidate() });

  const totalRevenue = sales?.reduce((s, v) => v.status === "completed" ? s + Number(v.total) : s, 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("sales")}</h1>
        <div className="text-right"><p className="text-sm text-muted-foreground">{t("totalRevenue")}</p><p className="text-2xl font-bold text-cyan-600">${totalRevenue.toFixed(2)}</p></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto" />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto" />
        </div>
      </div>
      <div className="space-y-2">
        {sales?.map((sale) => (
          <Card key={sale.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedSale(sale)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">#{sale.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{sale.customer?.name || "Walk-in"} - {format(new Date(sale.createdAt), "MMM dd, yyyy HH:mm")}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sale.paymentMethod === "cash" ? "bg-emerald-100 text-emerald-700" : sale.paymentMethod === "card" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{sale.paymentMethod}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${sale.status === "completed" ? "bg-emerald-100 text-emerald-700" : sale.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{sale.status}</span>
                  </div>
                </div>
              </div>
              <p className="text-lg font-bold">${Number(sale.total).toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Sale #{selectedSale?.invoiceNumber}</DialogTitle></DialogHeader>
          {selectedSale && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Customer</p><p className="font-medium">{selectedSale.customer?.name || "Walk-in"}</p></div>
                <div><p className="text-muted-foreground">Employee</p><p className="font-medium">{selectedSale.employee?.name || "N/A"}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{format(new Date(selectedSale.createdAt), "MMM dd, yyyy HH:mm")}</p></div>
                <div><p className="text-muted-foreground">Payment</p><p className="font-medium capitalize">{selectedSale.paymentMethod}</p></div>
              </div>
              <div className="border rounded-lg">
                <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-slate-800 text-xs font-medium">
                  <span>Product</span><span className="text-right">Qty</span><span className="text-right">Price</span><span className="text-right">Total</span>
                </div>
                {selectedSale.saleItems?.map((item: any) => (
                  <div key={item.id} className="grid grid-cols-4 gap-2 p-2 text-sm border-t">
                    <span className="truncate">{item.product?.name}</span>
                    <span className="text-right">{item.quantity}</span>
                    <span className="text-right">${Number(item.unitPrice).toFixed(2)}</span>
                    <span className="text-right">${Number(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${Number(selectedSale.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${Number(selectedSale.tax || 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>${Number(selectedSale.discount || 0).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t"><span>Total</span><span className="text-cyan-600">${Number(selectedSale.total).toFixed(2)}</span></div>
              </div>
              {selectedSale.status === "completed" && (
                <Button variant="destructive" onClick={() => { cancelMut.mutate({ id: selectedSale.id }); setSelectedSale(null); }} className="w-full">
                  <XCircle className="w-4 h-4 mr-2" /> Cancel Sale
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
