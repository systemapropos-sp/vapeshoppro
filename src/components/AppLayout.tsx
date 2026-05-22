import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingCart, Package, Users, UserCog,
  Truck, ClipboardList, Receipt, BarChart3, FileText,
  Settings, HelpCircle, Store, ChevronLeft, ChevronRight,
  Bell, Moon, Sun, LogOut, Menu, Zap, Box, CreditCard, Printer, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent,
} from "@/components/ui/sheet";

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useLocalAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, darkMode, toggleSidebarCollapsed, toggleDarkMode, notifications, markNotificationRead } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuGroups: MenuGroup[] = [
    {
      label: t("dashboard"),
      items: [
        { label: t("dashboard"), path: "/dashboard", icon: LayoutDashboard },
        { label: t("pos"), path: "/pos", icon: ShoppingCart },
      ],
    },
    {
      label: t("products"),
      items: [
        { label: t("products"), path: "/products", icon: Package },
        { label: t("inventory"), path: "/inventory", icon: Box },
        { label: t("kits"), path: "/kits", icon: Zap },
        { label: t("suppliers"), path: "/suppliers", icon: Truck },
      ],
    },
    {
      label: t("sales"),
      items: [
        { label: t("sales"), path: "/sales", icon: Receipt },
        { label: t("purchases"), path: "/purchases", icon: ClipboardList },
        { label: t("expenses"), path: "/expenses", icon: CreditCard },
        { label: t("vouchers"), path: "/vouchers", icon: FileText },
      ],
    },
    {
      label: t("people"),
      items: [
        { label: t("customers"), path: "/customers", icon: Users },
        { label: t("employees"), path: "/employees", icon: UserCog },
      ],
    },
    {
      label: t("reports"),
      items: [
        { label: t("reports"), path: "/reports", icon: BarChart3 },
        { label: t("history"), path: "/history", icon: Clock },
      ],
    },
    {
      label: t("settings"),
      items: [
        { label: t("stores"), path: "/stores", icon: Store },
        { label: t("settings"), path: "/settings", icon: Settings },
        { label: t("help"), path: "/help", icon: HelpCircle },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleNotificationClick = (id: number) => {
    markNotificationRead(id);
  };

  return (
    <div className={cn("min-h-screen flex", darkMode && "dark")}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="flex items-center gap-3 p-4 border-b border-slate-700">
              <img src="/logo.png" alt="VapeShopPro" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <h1 className="text-lg font-bold">{t("appName")}</h1>
                <p className="text-xs text-slate-400">{t("poweredBy")}</p>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <nav className="p-3 space-y-1">
                {menuGroups.map((group) => (
                  <div key={group.label} className="mb-4">
                    <p className="px-3 py-1 text-xs font-medium text-slate-400 uppercase">{group.label}</p>
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                          isActive(item.path)
                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-slate-900 text-white transition-all duration-300 fixed left-0 top-0 h-full z-30",
          sidebarCollapsed ? "w-[70px]" : "w-[250px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700 shrink-0">
          <img src="/logo.png" alt="VapeShopPro" className="w-9 h-9 rounded-lg object-cover shrink-0" />
          {!sidebarCollapsed && (
            <div className="overflow-hidden transition-all duration-300">
              <h1 className="text-base font-bold truncate">{t("appName")}</h1>
              <p className="text-[10px] text-slate-400 truncate">{t("poweredBy")}</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {menuGroups.map((group) => (
              <div key={group.label} className="mb-3">
                {!sidebarCollapsed && (
                  <p className="px-3 py-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider">{group.label}</p>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative",
                      isActive(item.path)
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("shrink-0", sidebarCollapsed ? "w-5 h-5 mx-auto" : "w-5 h-5")} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebarCollapsed}
          className="flex items-center justify-center h-10 border-t border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300 bg-gray-50 dark:bg-slate-950", sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[250px]")}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={toggleSidebarCollapsed} className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === "es" ? "en" : "es")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              {i18n.language === "es" ? "EN" : "ES"}
            </button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-[10px]">
                      {unreadNotifications.length}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>{t("notifications")}</span>
                  {unreadNotifications.length > 0 && (
                    <button onClick={() => unreadNotifications.forEach((n) => markNotificationRead(n.id))} className="text-xs text-cyan-600 hover:underline">
                      {t("markAllRead")}
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadNotifications.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">{t("noNotifications")}</div>
                ) : (
                  <ScrollArea className="max-h-[300px]">
                    {notifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id)}
                        className={cn("cursor-pointer", !n.read && "bg-blue-50 dark:bg-blue-900/20")}
                      >
                        <div className="flex flex-col gap-1 py-1">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-gray-500">{n.message}</p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" /> {t("settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/help")}>
                  <HelpCircle className="w-4 h-4 mr-2" /> {t("help")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
                  <LogOut className="w-4 h-4 mr-2" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>

        {/* Floating Quick Menu */}
        <div className="fixed bottom-4 right-4 z-40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
                <Zap className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
              <DropdownMenuItem onClick={() => navigate("/pos")}>
                <ShoppingCart className="w-4 h-4 mr-2" /> {t("pos")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/products")}>
                <Package className="w-4 h-4 mr-2" /> {t("products")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/sales")}>
                <Receipt className="w-4 h-4 mr-2" /> {t("sales")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Printer className="w-4 h-4 mr-2" /> {t("printers")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
