import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";

export default function Products() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState("all");

  const { data: products, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    isActive: activeTab === "inactive" ? false : activeTab === "low" ? undefined : true,
    lowStock: activeTab === "low" ? true : undefined,
  });
  const { data: categories } = trpc.product.categoryList.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.product.create.useMutation({ onSuccess: () => { utils.product.list.invalidate(); setShowForm(false); } });
  const updateMutation = trpc.product.update.useMutation({ onSuccess: () => { utils.product.list.invalidate(); setShowForm(false); setEditing(null); } });
  const deleteMutation = trpc.product.delete.useMutation({ onSuccess: () => utils.product.list.invalidate() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, ...form });
    else createMutation.mutate(form);
  };

  const openEdit = (product: any) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      barcode: product.barcode || "",
      sku: product.sku || "",
      image: product.image || "",
      categoryId: product.categoryId || undefined,
      costPrice: product.costPrice || "",
      salePrice: product.salePrice || "",
      wholesalePrice: product.wholesalePrice || "",
      quantity: product.quantity,
      minStock: product.minStock || 5,
      unit: product.unit || "unidad",
      taxRate: product.taxRate || "0",
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", salePrice: "", quantity: 0, minStock: 5 });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold dark:text-white">{t("products")}</h1>
        <Button onClick={openCreate} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <Plus className="w-4 h-4 mr-2" /> {t("addProduct")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t("all")}</TabsTrigger>
          <TabsTrigger value="low" className="text-amber-600"><AlertTriangle className="w-3 h-3 mr-1" /> {t("lowStock")}</TabsTrigger>
          <TabsTrigger value="inactive">{t("inactive")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><div className="h-32 bg-gray-100 dark:bg-slate-700 rounded-lg mb-3" /><div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg bg-gray-100 dark:bg-slate-700 mb-3 overflow-hidden flex items-center justify-center relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => openEdit(product)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => deleteMutation.mutate({ id: product.id })}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {product.quantity <= (product.minStock || 5) && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                      {product.quantity === 0 ? t("outOfStock") : t("lowStock")}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm font-bold text-cyan-600">${Number(product.salePrice).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Stock: {product.quantity}</p>
                </div>
                {product.barcode && <p className="text-[10px] text-muted-foreground font-mono mt-1">{product.barcode}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("editProduct") : t("addProduct")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("name")} *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("category")}</Label>
                <select value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : undefined })} className="w-full h-9 rounded-md border border-input bg-transparent px-3">
                  <option value="">{t("select")}</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>{t("description")}</Label><Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t("barcode")}</Label><Input value={form.barcode || ""} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></div>
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t("uploadImage")} URL</Label><Input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t("costPrice")}</Label><Input type="number" step="0.01" value={form.costPrice || ""} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("salePrice")} *</Label><Input type="number" step="0.01" value={form.salePrice || ""} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required /></div>
              <div className="space-y-2"><Label>{t("wholesalePrice")}</Label><Input type="number" step="0.01" value={form.wholesalePrice || ""} onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t("stock")}</Label><Input type="number" value={form.quantity || 0} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>{t("minStock")}</Label><Input type="number" value={form.minStock || 5} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>{t("taxRate")} (%)</Label><Input type="number" step="0.01" value={form.taxRate || "0"} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t("unit")}</Label><Input value={form.unit || "unidad"} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                {t("save")}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
