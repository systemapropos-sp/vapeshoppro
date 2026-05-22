import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Phone, Globe, CreditCard } from "lucide-react";

export default function Stores() {
  const { t } = useTranslation();
  const { data: stores } = trpc.store.storeList.useQuery();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">{t("stores")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores?.map((store) => (
          <Card key={store.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white">
                    <Store className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-base">{store.name}</CardTitle>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${store.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {store.isActive ? t("active") : t("inactive")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{store.address}{store.city ? `, ${store.city}` : ""}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{store.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>{store.currency} - {store.timezone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="w-4 h-4" />
                <span className="font-mono">{store.rnc || "N/A"}</span>
              </div>
              {store.membershipExpiry && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">{t("membershipInfo")}: {t("membershipPrice")}</p>
                  <p className="text-xs text-muted-foreground">{t("trialInfo")}: {new Date(store.membershipExpiry).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
