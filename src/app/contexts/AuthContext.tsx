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
  /**
   * Sigla do órgão do usuário — necessária para canValidarDominio() no
   * usePermissoes, que verifica se o VALIDADOR_DOCUMENTAL pertence ao órgão
   * responsável pelo domínio que está tentando validar.
   * Preenchida via endpoint GET /orgaos/{id} após o login, ou enviada
   * diretamente no LoginResponse quando o backend for atualizado.
   */
  siglaOrgao: string | null;
  fotoPerfil: string | null;
  /** Conjunto de "modulo:acao" concedidas pelo admin via tela de permissões */
  permissoesPerfil: string[] | null; // array para sobreviver ao JSON.stringify/parse do localStorage
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
  atualizarSiglaOrgao: (sigla: string) => void;
  atualizarPermissoesPerfil: (perms: string[]) => void;
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
    // siglaOrgao vem direto no LoginResponse — sem GET extra em /orgaos/{id}
    siglaOrgao:   res.siglaOrgao ?? null,
    fotoPerfil:        res.fotoPerfil ?? null,
    permissoesPerfil:  null,
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

  // Marca esta aba como ativa ao montar (refresh ou abertura direta)
  // sessionStorage some automaticamente quando a aba e fechada
  React.useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) {
      sessionStorage.setItem("sigpim_tab_ativa", "1");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    sessionStorage.removeItem("sigpim_tab_ativa");
    setToken(null);
    setUsuario(null);
  }, []);

  const salvarSessao = useCallback((res: LoginResponse) => {
    const u = resParaUsuario(res);
    localStorage.setItem(TOKEN_KEY,   res.accessToken!);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(u));
    sessionStorage.setItem("sigpim_tab_ativa", "1");
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

  /**
   * Atualiza a sigla do órgão após o login.
   * Chamar após GET /orgaos/{idOrgao} retornar a sigla.
   * Exemplo de uso no componente de login ou no AppInitializer:
   *
   *   if (usuario?.idOrgao) {
   *     const orgao = await orgaosApi.buscarPorId(usuario.idOrgao);
   *     atualizarSiglaOrgao(orgao.sigla);
   *   }
   */
  const atualizarSiglaOrgao = useCallback((sigla: string) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const atualizado = { ...prev, siglaOrgao: sigla };
      localStorage.setItem(USUARIO_KEY, JSON.stringify(atualizado));
      return atualizado;
    });
  }, []);

  const atualizarPermissoesPerfil = useCallback((perms: string[]) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const atualizado = { ...prev, permissoesPerfil: perms };
      localStorage.setItem(USUARIO_KEY, JSON.stringify(atualizado));
      return atualizado;
    });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      // Bloqueia login apenas se ha uma aba ativamente aberta com sessao
      // sessionStorage e por aba e some quando a aba e fechada
      const tokenExistente = localStorage.getItem(TOKEN_KEY);
      const usuarioExistente = localStorage.getItem(USUARIO_KEY);
      const tabAtiva = sessionStorage.getItem("sigpim_tab_ativa");
      if (tokenExistente && usuarioExistente && tabAtiva) {
        try {
          const u = JSON.parse(usuarioExistente);
          const nome = u?.nomeCompleto || u?.email || "outro usuario";
          throw new Error(`Ja existe uma sessao ativa para ${nome}. Faca logout antes de entrar com outra conta.`);
        } catch (parseErr) {
          if (!(parseErr instanceof SyntaxError)) throw parseErr;
        }
      }
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
      value={{
        usuario, token, loading, autenticado: !!token,
        login, logout, salvarSessao, atualizarMfa, atualizarSiglaOrgao, atualizarPermissoesPerfil,
      }}
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