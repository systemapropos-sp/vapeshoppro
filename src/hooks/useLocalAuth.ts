import { trpc } from "@/providers/trpc";
import { useDemoStore } from "@/stores/demoStore";
import { useCallback, useMemo } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email?: string;
  role: string;
  avatar?: string | null;
  storeId?: number | null;
  position?: string;
  type?: string;
};

export function useLocalAuth() {
  const isDemo = useDemoStore((s) => s.isDemo);
  const setDemo = useDemoStore((s) => s.setDemo);

  // Check if demo mode is stored
  const demoStored = typeof window !== "undefined" && localStorage.getItem("vapeshopro_demo") === "true";
  if (demoStored && !isDemo) {
    setDemo(true);
  }

  const {
    data: user,
    isLoading,
    error,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !isDemo && !demoStored,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("vapeshopro_token");
    localStorage.removeItem("vapeshopro_demo");
    setDemo(false);
    window.location.reload();
  }, [setDemo]);

  // Demo user
  const demoUser: AuthUser = {
    id: 1,
    name: "Demo Admin",
    email: "demo@vapeshopro.com",
    role: "admin",
    avatar: null,
    storeId: 1,
    type: "demo",
  };

  const typedUser: AuthUser | null = (isDemo || demoStored)
    ? demoUser
    : user
      ? {
          id: user.id,
          name: user.name,
          email: "email" in user ? (user as any).email : undefined,
          role: user.role || "employee",
          avatar: "avatar" in user ? (user as any).avatar : null,
          storeId: "storeId" in user ? (user as any).storeId : null,
          position: "position" in user ? (user as any).position : undefined,
          type: "type" in user ? (user as any).type : undefined,
        }
      : null;

  return useMemo(
    () => ({
      user: typedUser,
      isAuthenticated: !!typedUser,
      isLoading: isDemo || demoStored ? false : isLoading,
      error: isDemo || demoStored ? null : error,
      logout,
      isDemo: isDemo || demoStored,
    }),
    [typedUser, isLoading, error, logout, isDemo, demoStored]
  );
}
