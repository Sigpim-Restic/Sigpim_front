import React, { createContext, useContext, useState, useCallback } from "react";
import { authApi, type LoginRequest, type LoginResponse } from "../api/auth";

export interface UsuarioLogado {
  id: number;
  email: string;
  nomeCompleto: string;
  perfil: string;
  idOrgao: number | null;
  idUnidade: number | null;
  mfaAtivo: boolean;
}

interface AuthContextValue {
  usuario: UsuarioLogado | null;
  token: string | null;
  loading: boolean;
  autenticado: boolean;
  login: (data: LoginRequest) => Promise<{
    mfaRequired: boolean;
    mfaToken?: string;
    trocarSenhaNoProximoLogin?: boolean;
    mfaSetupObrigatorio?: boolean;
  }>;
  logout: () => void;
  salvarSessao: (res: LoginResponse) => void;
  atualizarMfa: (ativo: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY   = "sigpim_token";
const USUARIO_KEY = "sigpim_usuario";

function resParaUsuario(res: LoginResponse): UsuarioLogado {
  return {
    id:           res.idUsuario!,
    email:        res.email!,
    nomeCompleto: res.nomeCompleto ?? res.email ?? "",
    perfil:       res.perfil as string ?? "",
    idOrgao:      res.idOrgao ?? null,
    idUnidade:    res.idUnidade ?? null,
    mfaAtivo:     false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => {
    try {
      const raw = localStorage.getItem(USUARIO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const salvarSessao = useCallback((res: LoginResponse) => {
    const u = resParaUsuario(res);
    localStorage.setItem(TOKEN_KEY,   res.accessToken!);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(u));
    setToken(res.accessToken!);
    setUsuario(u);
  }, []);

  const atualizarMfa = useCallback((ativo: boolean) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const atualizado = { ...prev, mfaAtivo: ativo };
      localStorage.setItem(USUARIO_KEY, JSON.stringify(atualizado));
      return atualizado;
    });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);

      if (res.mfaRequired && res.mfaToken) {
        return { mfaRequired: true, mfaToken: res.mfaToken };
      }

      // Setup MFA obrigatório — salva sessão para poder chamar endpoints autenticados
      if (res.mfaSetupObrigatorio) {
        salvarSessao(res);
        return { mfaRequired: false, mfaSetupObrigatorio: true };
      }

      salvarSessao(res);
      return {
        mfaRequired: false,
        trocarSenhaNoProximoLogin: res.trocarSenhaNoProximoLogin,
      };
    } finally {
      setLoading(false);
    }
  }, [salvarSessao]);

  return (
    <AuthContext.Provider
      value={{ usuario, token, loading, autenticado: !!token, login, logout, salvarSessao, atualizarMfa }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}