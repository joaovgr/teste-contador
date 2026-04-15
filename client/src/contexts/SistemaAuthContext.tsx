import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface SistemaUser {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface SistemaAuthContextType {
  user: SistemaUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const SistemaAuthContext = createContext<SistemaAuthContextType | null>(null);

export function SistemaAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SistemaUser | null>(null);
  const [loading, setLoading] = useState(true);

  const meQuery = trpc.sistema.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = trpc.sistema.login.useMutation();
  const logoutMutation = trpc.sistema.logout.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!meQuery.isLoading) {
      setUser(meQuery.data ?? null);
      setLoading(false);
    }
  }, [meQuery.data, meQuery.isLoading]);

  const login = async (email: string, senha: string) => {
    const result = await loginMutation.mutateAsync({ email, senha });
    // Save token in localStorage for cross-origin Bearer auth (Manus preview environment)
    if (result.token) {
      localStorage.setItem("sos_auth_token", result.token);
    }
    await utils.sistema.me.invalidate();
    const me = await utils.sistema.me.fetch();
    setUser(me ?? null);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    localStorage.removeItem("sos_auth_token");
    setUser(null);
    await utils.sistema.me.invalidate();
  };

  return (
    <SistemaAuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </SistemaAuthContext.Provider>
  );
}

export function useSistemaAuth() {
  const ctx = useContext(SistemaAuthContext);
  if (!ctx) throw new Error("useSistemaAuth must be used within SistemaAuthProvider");
  return ctx;
}
