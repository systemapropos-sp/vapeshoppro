import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, Star } from "lucide-react";

export default function Customers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const { data: customers } = trpc.customer.list.useQuery({ search: search || undefined });
  const utils = trpc.useUtils();
  const createMut = trpc.customer.create.useMutation({ onSuccess: () => { utils.customer.list.invalidate(); setShowForm(false); } });
  const updateMut = trpc.customer.update.useMutation({ onSuccess: () => { utils.customer.list.invalidate(); setShowForm(false); setEditing(null); } });
  const deleteMut = trpc.customer.delete.useMutation({ onSuccess: () => utils.customer.list.invalidate() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMut.mutate({ id: editing.id, ...form });
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("customers")}</h1>
        <Button onClick={() => { setEditing(null); setForm({}); setShowForm(true); }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> {t("addCustomer")}
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers?.map((c) => (
          <Card key={c.id} className="group hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    {c.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{c.name}</p>
                    {c.isVip && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.phone}</p>
                  <p className="text-sm text-muted-foreground">{c.email}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.idCard}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">{t("creditLimit")}</p>
                  <p className="text-sm font-medium">${Number(c.creditLimit || 0).toFixed(2)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditing(c); setForm(c); setShowForm(true); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500" onClick={() => deleteMut.mutate({ id: c.id })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t("editCustomer") : t("addCustomer")}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("name")} *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("phone")}</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("email")}</Label><Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("idCard")}</Label><Input value={form.idCard || ""} onChange={(e) => setForm({ ...form, idCard: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t("address")}</Label><Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("creditLimit")}</Label><Input type="number" value={form.creditLimit || ""} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.isVip || false} onChange={(e) => setForm({ ...form, isVip: e.target.checked })} />
              <Label>VIP</Label>
            </div>
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
