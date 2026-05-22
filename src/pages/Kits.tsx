import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Zap } from "lucide-react";

export default function Kits() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ isKit: true });

  const { data: products } = trpc.product.list.useQuery({ isActive: true });
  const kits = products?.filter((p) => p.isKit);
  const utils = trpc.useUtils();
  const createMut = trpc.product.create.useMutation({ onSuccess: () => { utils.product.list.invalidate(); setShowForm(false); } });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("kits")}</h1>
        <Button onClick={() => { setForm({ isKit: true }); setShowForm(true); }} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"><Plus className="w-4 h-4 mr-2" /> {t("createKit")}</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kits?.map((kit) => (
          <Card key={kit.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                  <Zap className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{kit.name}</p>
                  <p className="text-sm text-cyan-600 font-bold">${Number(kit.salePrice).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{kit.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!kits || kits.length === 0) && <p className="text-muted-foreground col-span-full text-center py-8">{t("noResults")}</p>}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("createKit")}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
            <div className="space-y-2"><Label>{t("name")} *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>{t("description")}</Label><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>{t("salePrice")} *</Label><Input type="number" step="0.01" value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
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
