import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function Vouchers() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: vouchers } = trpc.voucher.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.voucher.create.useMutation({ onSuccess: () => { utils.voucher.list.invalidate(); setShowForm(false); } });
  const updateMut = trpc.voucher.update.useMutation({ onSuccess: () => utils.voucher.list.invalidate() });

  const totalIncome = vouchers?.filter((v) => v.type === "income" && v.status === "active").reduce((s, v) => s + Number(v.amount), 0) || 0;
  const totalExpense = vouchers?.filter((v) => v.type === "expense" && v.status === "active").reduce((s, v) => s + Number(v.amount), 0) || 0;

  const typeIcons: Record<string, any> = { income: ArrowDownCircle, expense: ArrowUpCircle, transfer: RefreshCw, adjustment: RefreshCw };
  const typeColors: Record<string, string> = { income: "text-emerald-600", expense: "text-red-600", transfer: "text-blue-600", adjustment: "text-amber-600" };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("vouchers")}</h1>
        <div className="flex gap-4 text-sm">
          <div className="text-right"><p className="text-muted-foreground">{t("income")}</p><p className="font-bold text-emerald-600">${totalIncome.toFixed(2)}</p></div>
          <div className="text-right"><p className="text-muted-foreground">{t("expense")}</p><p className="font-bold text-red-600">${totalExpense.toFixed(2)}</p></div>
        </div>
      </div>
      <Button onClick={() => { setForm({}); setShowForm(true); }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"><Plus className="w-4 h-4 mr-2" /> {t("addVoucher")}</Button>
      <div className="space-y-2">
        {vouchers?.map((v) => {
          const Icon = typeIcons[v.type] || FileText;
          return (
            <Card key={v.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center ${typeColors[v.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">#{v.voucherNumber}</p>
                    <p className="text-xs text-muted-foreground">{v.description} - {format(new Date(v.createdAt), "MMM dd, yyyy")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{v.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-bold ${typeColors[v.type]}`}>${Number(v.amount).toFixed(2)}</p>
                  {v.status === "active" && (
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => updateMut.mutate({ id: v.id, status: "cancelled" })}>Cancel</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("addVoucher")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMut.mutate({ ...form, voucherNumber: `VCH-${Date.now().toString(36).toUpperCase()}` }); }} className="space-y-3">
            <div className="space-y-2"><Label>{t("voucherType")}</Label>
              <select value={form.type || "income"} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3">
                <option value="income">{t("incomeVoucher")}</option><option value="expense">{t("expenseVoucher")}</option><option value="transfer">{t("transferVoucher")}</option><option value="adjustment">{t("adjustment")}</option>
              </select>
            </div>
            <div className="space-y-2"><Label>{t("description")} *</Label><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="space-y-2"><Label>{t("amount")} *</Label><Input type="number" step="0.01" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
            <div className="space-y-2"><Label>{t("notes")}</Label><Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
