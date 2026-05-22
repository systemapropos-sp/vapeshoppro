import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, ClipboardList, Check } from "lucide-react";
import { format } from "date-fns";

export default function Purchases() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ items: [] });
  const [itemInput, setItemInput] = useState<any>({});

  const { data: purchases } = trpc.purchase.list.useQuery();
  const { data: suppliers } = trpc.supplier.list.useQuery();
  const { data: products } = trpc.product.list.useQuery();
  const createMut = trpc.purchase.create.useMutation({ onSuccess: () => { setShowForm(false); setForm({ items: [] }); } });
  const updateStatus = trpc.purchase.updateStatus.useMutation({});

  const addItem = () => {
    if (!itemInput.productId || !itemInput.quantity || !itemInput.unitCost) return;
    products?.find((p) => p.id === Number(itemInput.productId));
    setForm({ ...form, items: [...form.items, { productId: Number(itemInput.productId), quantity: Number(itemInput.quantity), unitCost: itemInput.unitCost, total: (Number(itemInput.quantity) * Number(itemInput.unitCost)).toFixed(2) }] });
    setItemInput({});
  };

  const total = form.items.reduce((s: number, i: any) => s + Number(i.total), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("purchases")}</h1>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"><Plus className="w-4 h-4 mr-2" /> {t("addPurchase")}</Button>
      </div>
      <div className="space-y-2">
        {purchases?.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white"><ClipboardList className="w-5 h-5" /></div>
                <div>
                  <p className="font-medium">#{p.invoiceNumber || p.id}</p>
                  <p className="text-xs text-muted-foreground">{p.supplier?.name} - {format(new Date(p.createdAt), "MMM dd, yyyy")}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "received" ? "bg-emerald-100 text-emerald-700" : p.status === "ordered" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{p.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">${Number(p.total).toFixed(2)}</p>
                {p.status === "ordered" && <Button size="sm" onClick={() => updateStatus.mutate({ id: p.id, status: "received" })}><Check className="w-3 h-3 mr-1" /> Receive</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("addPurchase")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMut.mutate({ ...form, subtotal: total.toFixed(2), total: total.toFixed(2) }); }} className="space-y-4">
            <div className="space-y-2"><Label>{t("supplier")}</Label>
              <select value={form.supplierId || ""} onChange={(e) => setForm({ ...form, supplierId: Number(e.target.value) })} className="w-full h-9 rounded-md border border-input bg-transparent px-3">
                <option value="">Select...</option>
                {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Invoice #</Label><Input value={form.invoiceNumber || ""} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></div>
            <div className="border rounded-lg p-3 space-y-2">
              <p className="font-medium text-sm">{t("purchaseItems")}</p>
              <div className="flex gap-2">
                <select value={itemInput.productId || ""} onChange={(e) => setItemInput({ ...itemInput, productId: e.target.value })} className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Product...</option>
                  {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Input type="number" placeholder="Qty" className="w-20" value={itemInput.quantity || ""} onChange={(e) => setItemInput({ ...itemInput, quantity: e.target.value })} />
                <Input type="number" placeholder="Cost" className="w-24" value={itemInput.unitCost || ""} onChange={(e) => setItemInput({ ...itemInput, unitCost: e.target.value })} />
                <Button type="button" size="sm" onClick={addItem}><Plus className="w-4 h-4" /></Button>
              </div>
              {form.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm py-1 border-t">
                  <span>{products?.find((p) => p.id === item.productId)?.name}</span>
                  <span>{item.quantity} x ${Number(item.unitCost).toFixed(2)} = ${Number(item.total).toFixed(2)}</span>
                </div>
              ))}
              <p className="text-right font-bold">Total: ${total.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white" disabled={form.items.length === 0}>{t("save")}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
