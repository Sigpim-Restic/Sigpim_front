import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi, type LoginRequest } from "../api/auth";

export interface UsuarioLogado {
  id: number;
  email: string;
  nomeCompleto: string;
  perfil: string;
  idOrgao: number | null;
  idUnidade: number | null;
}

interface AuthContextValue {
  usuario: UsuarioLogado | null;
  token: string | null;
  loading: boolean;
  autenticado: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY   = "sigpim_token";
const USUARIO_KEY = "sigpim_usuario";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => {
    try {
      const raw = localStorage.getItem(USUARIO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      localStorage.setItem(TOKEN_KEY, res.accessToken);

      const u: UsuarioLogado = {
        id:           res.idUsuario,
        email:        res.email,
        nomeCompleto: res.nomeCompleto ?? res.email,
        perfil:       res.perfil ?? "",
        idOrgao:      res.idOrgao ?? null,
        idUnidade:    res.idUnidade ?? null,
      };
      localStorage.setItem(USUARIO_KEY, JSON.stringify(u));
      setToken(res.accessToken);
      setUsuario(u);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, token, loading, autenticado: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
