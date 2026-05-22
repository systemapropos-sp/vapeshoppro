import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDemoStore } from "@/stores/demoStore";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, Truck } from "lucide-react";

export default function Suppliers() {
  const { t } = useTranslation();
  const { isDemo } = useLocalAuth();
  const demoStore = useDemoStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const suppliers = isDemo ? demoStore.getSuppliers().filter((s: any) => !search || s.name.toLowerCase().includes(search.toLowerCase())) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) { if (editing) demoStore.update("suppliers", editing.id, form); else demoStore.add("suppliers", { ...form, isActive: true }); setShowForm(false); setEditing(null); setForm({}); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("suppliers")}</h1>
        <Button onClick={() => { setEditing(null); setForm({}); setShowForm(true); }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"><Plus className="w-4 h-4 mr-2" /> {t("addSupplier")}</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers?.map((s: any) => (
          <Card key={s.id} className="hover:shadow-lg transition-all"><CardContent className="p-4">
            <div className="flex items-start gap-4">
              {s.image ? <img src={s.image} alt={s.name} className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white"><Truck className="w-8 h-8" /></div>}
              <div className="flex-1 min-w-0"><p className="font-semibold truncate">{s.name}</p><p className="text-sm text-muted-foreground">{s.contactName}</p><p className="text-sm text-muted-foreground">{s.phone}</p><p className="text-xs font-mono text-muted-foreground">{s.rnc}</p></div>
              <div className="flex flex-col gap-1"><Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditing(s); setForm(s); setShowForm(true); }}><Pencil className="w-3 h-3" /></Button><Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => isDemo && demoStore.update("suppliers", s.id, { isActive: false })}><Trash2 className="w-3 h-3" /></Button></div>
            </div>
          </CardContent></Card>
        ))}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editing ? t("editSupplier") : t("addSupplier")}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2"><Label>{t("name")} *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>{t("contactName")}</Label><Input value={form.contactName || ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></div><div className="space-y-2"><Label>{t("phone")}</Label><Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div></div>
            <div className="space-y-2"><Label>{t("email")}</Label><Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t("address")}</Label><Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>{t("rnc")}</Label><Input value={form.rnc || ""} onChange={(e) => setForm({ ...form, rnc: e.target.value })} /></div><div className="space-y-2"><Label>Image URL</Label><Input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div></div>
            <div className="flex gap-2 pt-2"><Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
