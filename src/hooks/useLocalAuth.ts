import { trpc } from "@/providers/trpc";
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

  const {
    data: user,
    isLoading,
    error,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("vapeshopro_token");
    window.location.reload();
  }, []);

  const typedUser: AuthUser | null = user
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
      isLoading,
      error,
      logout,
    }),
    [typedUser, isLoading, error, logout]
  );
}
