import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ClienteSession {
  clienteId: number;
  nome: string;
  cpf: string | null | undefined;
  status: string | null | undefined;
  faixa: string | null | undefined;
  honorarios: string | null | undefined;
  anoBase: number | null | undefined;
  token: string;
}

interface PortalAuthContextType {
  session: ClienteSession | null;
  login: (data: ClienteSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const PortalAuthContext = createContext<PortalAuthContextType | null>(null);

const STORAGE_KEY = "sos_portal_session";

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ClienteSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = (data: ClienteSession) => {
    setSession(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <PortalAuthContext.Provider value={{ session, login, logout, isAuthenticated: !!session }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error("usePortalAuth must be used inside PortalAuthProvider");
  return ctx;
}
