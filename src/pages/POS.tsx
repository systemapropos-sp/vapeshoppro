import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ShoppingCart, Search, ScanBarcode, User, Minus, Plus,
  Trash2, Pause, RotateCcw, CreditCard, Banknote, ArrowRight,
  Receipt, Check, Printer
} from "lucide-react";

export default function POS() {
  const { t } = useTranslation();
  const {
    items, customerId, customerName, discount, tax, paymentMethod, amountPaid, notes,
    addItem, removeItem, updateQuantity, setCustomer, setDiscount, setTax,
    setPaymentMethod, setAmountPaid, setNotes, clearCart, getSubtotal, getTotal,
    holdOrder, heldOrders, resumeOrder, removeHeldOrder
  } = useCartStore();
  useUIStore(); // access store if needed

  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showHeldDialog, setShowHeldDialog] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  const { data: products } = trpc.product.list.useQuery({
    search: search || undefined,
    categoryId: categoryFilter,
    isActive: true,
  });
  const { data: categories } = trpc.product.categoryList.useQuery();
  const { data: customers } = trpc.customer.list.useQuery({ search: customerSearch || undefined });
  const utils = trpc.useUtils();

  const createSale = trpc.sale.create.useMutation({
    onSuccess: (data) => {
      setLastSale(data);
      setShowReceipt(true);
      clearCart();
      utils.sale.list.invalidate();
      utils.report.dashboard.invalidate();
    },
  });

  // Barcode scan handler
  const handleBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    const product = products?.find((p) => p.barcode === barcode || p.sku === barcode);
    if (product) {
      addItem({
        productId: product.id,
        name: product.name,
        image: product.image || undefined,
        price: Number(product.salePrice),
        costPrice: product.costPrice ? Number(product.costPrice) : undefined,
        quantity: 1,
        discount: 0,
        total: Number(product.salePrice),
      });
      setBarcode("");
    }
  };

  const subtotal = getSubtotal();
  const total = getTotal();
  const change = amountPaid - total;

  const handleCheckout = () => {
    if (items.length === 0) return;
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    createSale.mutate({
      invoiceNumber,
      customerId: customerId || undefined,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      paymentMethod,
      amountPaid: amountPaid.toFixed(2),
      notes: notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.price.toFixed(2),
        costPrice: i.costPrice?.toFixed(2),
        discount: i.discount.toFixed(2),
        total: (i.price * i.quantity - i.discount).toFixed(2),
      })),
    });
    setShowCheckout(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Search & Barcode */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <form onSubmit={handleBarcode} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={barcodeRef}
                placeholder={t("scanBarcode")}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">{t("scan")}</Button>
          </form>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter?.toString() || "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : Number(v))} className="mb-3">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs">{t("all")}</TabsTrigger>
            {categories?.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id.toString()} className="text-xs">{cat.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
            {products?.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    image: product.image || undefined,
                    price: Number(product.salePrice),
                    costPrice: product.costPrice ? Number(product.costPrice) : undefined,
                    quantity: 1,
                    discount: 0,
                    total: Number(product.salePrice),
                  });
                }}
                disabled={product.quantity <= 0}
                className={cn(
                  "bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-3 text-left transition-all duration-200 hover:shadow-lg hover:border-cyan-300 hover:scale-[1.02] active:scale-[0.98] group",
                  product.quantity <= 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="aspect-square rounded-lg bg-gray-100 dark:bg-slate-700 mb-2 overflow-hidden flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-medium truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{product.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-bold text-cyan-600">${Number(product.salePrice).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">x{product.quantity}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-[380px] flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        {/* Cart Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-500" />
            <h2 className="font-semibold">{t("cart")}</h2>
            <span className="bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => { setShowHeldDialog(true); }} title={t("holdSale")}>
              <Pause className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={clearCart} title={t("clear")}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Customer */}
        <button
          onClick={() => setShowCustomerDialog(true)}
          className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-slate-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{customerName || t("assignCustomer")}</span>
          <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground" />
        </button>

        {/* Cart Items */}
        <ScrollArea className="flex-1 min-h-[200px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">{t("cartEmpty")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => removeItem(item.productId)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Totals */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-2 bg-gray-50 dark:bg-slate-900/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-muted-foreground">{t("tax")} (%)</span>
            <Input
              type="number"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className="w-16 h-7 text-right text-sm"
            />
          </div>
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-muted-foreground">{t("discount")}</span>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-24 h-7 text-right text-sm"
            />
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>{t("total")}</span>
            <span className="text-cyan-600">${total.toFixed(2)}</span>
          </div>
          {change > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>{t("change")}</span>
              <span>${change.toFixed(2)}</span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowCheckout(true)}
              disabled={items.length === 0}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold h-11"
            >
              <Receipt className="w-4 h-4 mr-2" /> {t("pay")}
            </Button>
            <Button
              variant="outline"
              onClick={() => { holdOrder(); }}
              disabled={items.length === 0}
              className="h-11"
            >
              <Pause className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("assignCustomer")}</DialogTitle>
          </DialogHeader>
          <Input placeholder={t("search")} value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="mb-3" />
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-1">
              <button
                onClick={() => { setCustomer(undefined, undefined); setShowCustomerDialog(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
              >
                <User className="w-8 h-8 text-gray-400" />
                <span className="text-muted-foreground">{t("walkInCustomer")}</span>
              </button>
              {customers?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCustomer(c.id, c.name); setShowCustomerDialog(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-left"
                >
                  {c.image ? <img src={c.image} alt={c.name} className="w-8 h-8 rounded-full object-cover" /> : <User className="w-8 h-8 text-gray-400" />}
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Held Orders Dialog */}
      <Dialog open={showHeldDialog} onOpenChange={setShowHeldDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("heldOrders")}</DialogTitle>
          </DialogHeader>
          {heldOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">{t("noHeldOrders")}</p>
          ) : (
            <div className="space-y-2">
              {heldOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{order.customerName || t("walkInCustomer")}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => { resumeOrder(order.id); setShowHeldDialog(false); }}>
                      <RotateCcw className="w-3 h-3 mr-1" /> {t("resumeSale")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeHeldOrder(order.id)}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("checkout")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-cyan-600">${total.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{t("total")}</p>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "card", "transfer"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                    paymentMethod === method
                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                      : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                  )}
                >
                  {method === "cash" && <Banknote className="w-6 h-6" />}
                  {method === "card" && <CreditCard className="w-6 h-6" />}
                  {method === "transfer" && <ArrowRight className="w-6 h-6" />}
                  <span className="text-xs capitalize">{method}</span>
                </button>
              ))}
            </div>

            {/* Amount Paid */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("amountPaid")}</label>
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="text-lg text-center"
              />
            </div>

            {change >= 0 && (
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("change")}</p>
                <p className="text-xl font-bold text-emerald-600">${change.toFixed(2)}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("notes")}</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="..." />
            </div>

            <Button
              onClick={handleCheckout}
              disabled={createSale.isPending || amountPaid < total}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white h-12 text-lg font-semibold"
            >
              {createSale.isPending ? "..." : <><Check className="w-5 h-5 mr-2" /> {t("checkout")}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">{t("saleComplete")}</DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-2" />
                <p className="font-bold text-lg">{t("appName")}</p>
                <p className="text-xs text-muted-foreground">{lastSale.invoiceNumber}</p>
                <p className="text-xs text-muted-foreground">{new Date().toLocaleString()}</p>
              </div>
              <div className="space-y-1 text-sm">
                {items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.name} x{i.quantity}</span>
                    <span>${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span>{t("subtotal")}</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{t("tax")}</span><span>${(subtotal * tax / 100).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>{t("total")}</span><span className="text-cyan-600">${total.toFixed(2)}</span></div>
              </div>
              <p className="text-center text-xs text-muted-foreground">{t("thankYouMessage")}</p>
              <Button onClick={() => setShowReceipt(false)} className="w-full">
                <Printer className="w-4 h-4 mr-2" /> {t("print")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
