import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function Expenses() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: expenses } = trpc.expense.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.expense.create.useMutation({ onSuccess: () => { utils.expense.list.invalidate(); setShowForm(false); } });
  const updateMut = trpc.expense.update.useMutation({ onSuccess: () => { utils.expense.list.invalidate(); setShowForm(false); } });
  const deleteMut = trpc.expense.delete.useMutation({ onSuccess: () => utils.expense.list.invalidate() });

  const total = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("expenses")}</h1>
        <div className="text-right"><p className="text-sm text-muted-foreground">{t("total")}</p><p className="text-2xl font-bold text-red-500">${total.toFixed(2)}</p></div>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditing(null); setForm({ date: format(new Date(), "yyyy-MM-dd") }); setShowForm(true); }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"><Plus className="w-4 h-4 mr-2" /> {t("addExpense")}</Button>
      </div>
      <div className="space-y-2">
        {expenses?.filter((e) => !search || e.description.toLowerCase().includes(search.toLowerCase())).map((expense) => (
          <Card key={expense.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white"><CreditCard className="w-5 h-5" /></div>
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">{expense.category} - {format(new Date(expense.date), "MMM dd, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold">${Number(expense.amount).toFixed(2)}</p>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditing(expense); setForm(expense); setShowForm(true); }}><Pencil className="w-3 h-3" /></Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteMut.mutate({ id: expense.id })}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("edit") : t("addExpense")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (editing) updateMut.mutate({ id: editing.id, ...form }); else createMut.mutate(form); }} className="space-y-3">
            <div className="space-y-2"><Label>{t("expenseCategory")} *</Label><Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
            <div className="space-y-2"><Label>{t("description")} *</Label><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("amount")} *</Label><Input type="number" step="0.01" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("date")} *</Label><Input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
            </div>
            <div className="space-y-2"><Label>{t("paymentMethod")}</Label>
              <select value={form.paymentMethod || "cash"} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3">
                <option value="cash">Cash</option><option value="card">Card</option><option value="transfer">Transfer</option>
              </select>
            </div>
            <div className="space-y-2"><Label>{t("receiptNumber")}</Label><Input value={form.receiptNumber || ""} onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })} /></div>
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
