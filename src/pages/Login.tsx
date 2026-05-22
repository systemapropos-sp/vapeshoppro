import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, KeyRound, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("vapeshopro_token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (err) => setError(err.message),
  });

  const loginPinMutation = trpc.localAuth.loginPin.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("vapeshopro_token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (err) => setError(err.message),
  });

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill all fields"); return; }
    loginMutation.mutate({ email, password });
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!pin || pin.length < 4) { setError("PIN must be at least 4 digits"); return; }
    loginPinMutation.mutate({ pin });
  };

  const isLoading = loginMutation.isPending || loginPinMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-cyan-400 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
      </div>

      {/* Floating vape icons decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-6 h-16 border-2 border-cyan-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="VapeShopPro" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-2xl shadow-cyan-500/20" />
          <h1 className="text-3xl font-bold text-white">{t("appName")}</h1>
          <p className="text-slate-400 mt-1">{t("loginSubtitle")}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="email" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <Mail className="w-4 h-4 mr-2" /> {t("adminLogin")}
              </TabsTrigger>
              <TabsTrigger value="pin" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                <KeyRound className="w-4 h-4 mr-2" /> {t("employeeLogin")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">{t("email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">{t("password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium">
                  {isLoading ? "..." : t("login")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="pin">
              <form onSubmit={handlePinLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">{t("enterPin")}</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="password"
                      placeholder={t("pinPlaceholder")}
                      maxLength={10}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      className="pl-10 text-center tracking-[0.5em] text-xl bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium">
                  {isLoading ? "..." : t("login")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center">
            <Link to="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              {t("forgotPassword")}
            </Link>
            <p className="text-sm text-slate-400">
              {t("noAccount")}{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                {t("register")}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">{t("poweredBy")}</p>
      </div>
    </div>
  );
}
