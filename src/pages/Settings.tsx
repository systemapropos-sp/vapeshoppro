import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Store, Receipt, Printer, Users, Globe, Bell } from "lucide-react";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user } = useLocalAuth();
  const [tab, setTab] = useState("store");
  const [storeForm, setStoreForm] = useState<any>({});
  const [receiptForm, setReceiptForm] = useState<any>({});
  const [printerForm, setPrinterForm] = useState<any>({});
  const [showPrinterForm, setShowPrinterForm] = useState(false);

  const { data: store } = trpc.store.storeGetById.useQuery({ id: user?.storeId || 1 }, { enabled: !!user?.storeId });
  const { data: printers } = trpc.store.printerList.useQuery({ storeId: user?.storeId || undefined });
  const { data: receiptSettings } = trpc.store.receiptSettingsGet.useQuery({ storeId: user?.storeId || 1 }, { enabled: !!user?.storeId });
  const utils = trpc.useUtils();

  const updateStore = trpc.store.storeUpdate.useMutation({ onSuccess: () => { utils.store.storeGetById.invalidate(); } });
  const updateReceipt = trpc.store.receiptSettingsUpdate.useMutation({ onSuccess: () => utils.store.receiptSettingsGet.invalidate() });
  const createPrinter = trpc.store.printerCreate.useMutation({ onSuccess: () => { utils.store.printerList.invalidate(); setShowPrinterForm(false); } });

  useEffect(() => { if (store) setStoreForm(store); }, [store]);
  useEffect(() => { if (receiptSettings) setReceiptForm(receiptSettings); }, [receiptSettings]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">{t("settings")}</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="store"><Store className="w-4 h-4 mr-1" /> {t("storeSettings")}</TabsTrigger>
          <TabsTrigger value="receipt"><Receipt className="w-4 h-4 mr-1" /> {t("receiptSettings")}</TabsTrigger>
          <TabsTrigger value="printers"><Printer className="w-4 h-4 mr-1" /> {t("printers")}</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> {t("users")}</TabsTrigger>
          <TabsTrigger value="language"><Globe className="w-4 h-4 mr-1" /> {t("language")}</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" /> {t("notifications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("storeSettings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>{t("businessName")}</Label><Input value={storeForm.name || ""} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("phone")}</Label><Input value={storeForm.phone || ""} onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t("email")}</Label><Input value={storeForm.email || ""} onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>{t("address")}</Label><Input value={storeForm.address || ""} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>{t("city")}</Label><Input value={storeForm.city || ""} onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t("rnc")}</Label><Input value={storeForm.rnc || ""} onChange={(e) => setStoreForm({ ...storeForm, rnc: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t("taxId")}</Label><Input value={storeForm.taxId || ""} onChange={(e) => setStoreForm({ ...storeForm, taxId: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("currency")}</Label><Input value={storeForm.currency || "DOP"} onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })} /></div>
                <div className="space-y-2"><Label>{t("timezone")}</Label><Input value={storeForm.timezone || "America/Santo_Domingo"} onChange={(e) => setStoreForm({ ...storeForm, timezone: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Logo URL</Label><Input value={storeForm.logo || ""} onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })} /></div>
              {storeForm.logo && <img src={storeForm.logo} alt="Logo preview" className="w-20 h-20 rounded-lg object-contain border" />}
              <Button onClick={() => updateStore.mutate({ id: user?.storeId || 1, ...storeForm })} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("receiptSettings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>{t("headerText")}</Label><Input value={receiptForm.headerText || ""} onChange={(e) => setReceiptForm({ ...receiptForm, headerText: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("footerText")}</Label><Input value={receiptForm.footerText || ""} onChange={(e) => setReceiptForm({ ...receiptForm, footerText: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("thankYouMessage")}</Label><Input value={receiptForm.thankYouMessage || ""} onChange={(e) => setReceiptForm({ ...receiptForm, thankYouMessage: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t("paperWidth")} (mm)</Label><Input type="number" value={receiptForm.paperWidth || 80} onChange={(e) => setReceiptForm({ ...receiptForm, paperWidth: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-3"><Switch checked={receiptForm.showLogo || false} onCheckedChange={(c) => setReceiptForm({ ...receiptForm, showLogo: c })} /><Label>{t("showLogo")}</Label></div>
              <div className="flex items-center gap-3"><Switch checked={receiptForm.showBarcode || false} onCheckedChange={(c) => setReceiptForm({ ...receiptForm, showBarcode: c })} /><Label>{t("showBarcode")}</Label></div>
              <div className="flex items-center gap-3"><Switch checked={receiptForm.autoPrint || false} onCheckedChange={(c) => setReceiptForm({ ...receiptForm, autoPrint: c })} /><Label>{t("autoPrint")}</Label></div>
              <Button onClick={() => updateReceipt.mutate({ storeId: user?.storeId || 1, ...receiptForm })} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printers" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowPrinterForm(true)}>+ {t("addPrinter")}</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {printers?.map((printer) => (
              <Card key={printer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img src={printer.image || "/printer-thermal.jpg"} alt={printer.name} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{printer.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{printer.type} - {printer.connectionType}</p>
                      <p className="text-xs text-muted-foreground">{printer.ipAddress}:{printer.port}</p>
                      <p className="text-xs text-muted-foreground">{printer.paperWidth}mm</p>
                      {printer.isDefault && <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Default</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {showPrinterForm && (
            <Card>
              <CardHeader><CardTitle>{t("addPrinter")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2"><Label>{t("name")}</Label><Input value={printerForm.name || ""} onChange={(e) => setPrinterForm({ ...printerForm, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t("type")}</Label>
                    <select value={printerForm.type || "thermal"} onChange={(e) => setPrinterForm({ ...printerForm, type: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3">
                      <option value="thermal">Thermal</option><option value="inkjet">Inkjet</option><option value="laser">Laser</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label>{t("connectionType")}</Label>
                    <select value={printerForm.connectionType || "usb"} onChange={(e) => setPrinterForm({ ...printerForm, connectionType: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3">
                      <option value="usb">USB</option><option value="network">Network</option><option value="bluetooth">Bluetooth</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t("ipAddress")}</Label><Input value={printerForm.ipAddress || ""} onChange={(e) => setPrinterForm({ ...printerForm, ipAddress: e.target.value })} placeholder="192.168.1.100" /></div>
                  <div className="space-y-2"><Label>{t("port")}</Label><Input value={printerForm.port || ""} onChange={(e) => setPrinterForm({ ...printerForm, port: e.target.value })} placeholder="9100" /></div>
                </div>
                <div className="space-y-2"><Label>{t("paperWidth")} (mm)</Label><Input type="number" value={printerForm.paperWidth || 80} onChange={(e) => setPrinterForm({ ...printerForm, paperWidth: Number(e.target.value) })} /></div>
                <div className="flex items-center gap-3"><Switch checked={printerForm.isDefault || false} onCheckedChange={(c) => setPrinterForm({ ...printerForm, isDefault: c })} /><Label>{t("isDefault")}</Label></div>
                <div className="space-y-2"><Label>Image URL</Label><Input value={printerForm.image || ""} onChange={(e) => setPrinterForm({ ...printerForm, image: e.target.value })} /></div>
                <div className="flex gap-2">
                  <Button onClick={() => createPrinter.mutate({ ...printerForm, storeId: user?.storeId || undefined })} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
                  <Button variant="outline" onClick={() => setShowPrinterForm(false)}>{t("cancel")}</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("language")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant={i18n.language === "es" ? "default" : "outline"} onClick={() => i18n.changeLanguage("es")} className={i18n.language === "es" ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" : ""}>Español</Button>
                <Button variant={i18n.language === "en" ? "default" : "outline"} onClick={() => i18n.changeLanguage("en")} className={i18n.language === "en" ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" : ""}>English</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("notifications")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Low stock alerts</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>New sale notifications</Label></div>
              <div className="flex items-center gap-3"><Switch /><Label>Payroll reminders</Label></div>
              <div className="flex items-center gap-3"><Switch defaultChecked /><Label>Daily summary</Label></div>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UsersManager() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const { data: users } = trpc.store.userList.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.store.userCreate.useMutation({ onSuccess: () => { utils.store.userList.invalidate(); setShowForm(false); } });
  const deleteMut = trpc.store.userDelete.useMutation({ onSuccess: () => utils.store.userList.invalidate() });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setForm({}); setShowForm(true); }}>+ {t("addUser")}</Button>
      </div>
      <div className="space-y-2">
        {users?.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">{u.name.charAt(0)}</div>
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email} - {u.role}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteMut.mutate({ id: u.id })}>Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>{t("addUser")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder={t("name")} value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input type="email" placeholder={t("email")} value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="password" placeholder={t("password")} value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select value={form.role || "cashier"} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-9 rounded-md border border-input bg-transparent px-3">
              <option value="admin">Admin</option><option value="manager">Manager</option><option value="cashier">Cashier</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={() => createMut.mutate(form)} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">{t("save")}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
