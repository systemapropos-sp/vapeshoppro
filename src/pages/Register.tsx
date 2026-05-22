import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Store, User, Mail, Lock, Phone, MapPin, Building, ArrowLeft } from "lucide-react";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    city: "",
    rnc: "",
    taxId: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: () => {
      navigate("/login");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.businessName || !form.ownerName || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (!form.acceptTerms) { setError("Please accept the terms"); return; }
    registerMutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-auto py-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-cyan-400 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-500 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> {t("back")}
        </Link>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="VapeShopPro" className="w-16 h-16 mx-auto mb-3 rounded-xl" />
            <h1 className="text-2xl font-bold text-white">{t("registerTitle")}</h1>
            <p className="text-slate-400 text-sm mt-1">{t("registerSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">{t("businessName")}</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input placeholder={t("businessNamePlaceholder")} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">{t("ownerName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input placeholder={t("ownerName")} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="email" placeholder={t("emailPlaceholder")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="password" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">{t("phone")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input placeholder={t("phonePlaceholder")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">{t("city")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input placeholder={t("cityPlaceholder")} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">{t("address")}</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input placeholder={t("addressPlaceholder")} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">RNC</Label>
                <Input placeholder={t("rncPlaceholder")} value={form.rnc} onChange={(e) => setForm({ ...form, rnc: e.target.value })} className="bg-slate-800/50 border-slate-600 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Tax ID</Label>
                <Input placeholder={t("taxIdPlaceholder")} value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="bg-slate-800/50 border-slate-600 text-white" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={form.acceptTerms} onCheckedChange={(c) => setForm({ ...form, acceptTerms: c === true })} />
              <Label className="text-sm text-slate-400">{t("termsAccept")}</Label>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button type="submit" disabled={registerMutation.isPending} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium">
              {registerMutation.isPending ? "..." : t("register")}
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            {t("trialMessage", { price: "19.99" })}
          </p>

          <p className="text-center text-sm text-slate-400 mt-4">
            {t("hasAccount")}{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">{t("login")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
