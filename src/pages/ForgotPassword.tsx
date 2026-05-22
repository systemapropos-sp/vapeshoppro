import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const forgotMutation = trpc.localAuth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-cyan-400 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-500 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> {t("back")}
        </Link>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="VapeShopPro" className="w-16 h-16 mx-auto mb-3 rounded-xl" />
            <h1 className="text-2xl font-bold text-white">{t("forgotPassword")}</h1>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-white">{t("resetSent")}</p>
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">{t("login")}</Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); forgotMutation.mutate({ email }); }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="email" placeholder={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-slate-800/50 border-slate-600 text-white" />
                </div>
              </div>
              <Button type="submit" disabled={forgotMutation.isPending} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                {forgotMutation.isPending ? "..." : t("resetPassword")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
