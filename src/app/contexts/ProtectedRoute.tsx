import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";
import { orgaosApi } from "../api/orgaos";
import { permissoesApi } from "../api/permissoes";
import type { PerfilUsuario } from "../api/usuarios";

/**
 * Redireciona para /login se o usuário não estiver autenticado.
 *
 * Também inicializa siglaOrgao no AuthContext logo após o login.
 * siglaOrgao é necessária para canValidarDominio() em usePermissoes,
 * que verifica se o VALIDADOR_DOCUMENTAL pertence ao órgão responsável
 * pelo domínio que está tentando validar.
 *
 * Estratégia: busca /orgaos/ativos uma única vez por sessão e encontra
 * a sigla pelo idOrgao do usuário logado. Usa useRef para não repetir
 * a chamada em re-renders.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { autenticado, usuario, atualizarSiglaOrgao, atualizarPermissoesPerfil } = useAuth();
  const inicializado = useRef(false);
  const permissoesCarregadas = useRef(false);

  useEffect(() => {
    // Só executa uma vez por sessão e apenas quando há idOrgao e siglaOrgao ainda não populada
    if (!autenticado || !usuario?.idOrgao || usuario.siglaOrgao || inicializado.current) return;

    inicializado.current = true;

    orgaosApi.listarAtivos()
      .then((orgaos) => {
        const orgao = orgaos.find((o) => o.id === usuario.idOrgao);
        if (orgao?.sigla) {
          atualizarSiglaOrgao(orgao.sigla);
        }
      })
      .catch(() => {
        // Falha silenciosa — canValidarDominio retornará false para VALIDADOR_DOCUMENTAL
        // até a próxima tentativa, mas não bloqueia o restante da aplicação
      });
  }, [autenticado, usuario?.idOrgao, usuario?.siglaOrgao, atualizarSiglaOrgao]);

  // Reseta o flag quando o perfil muda (ex: logout + login com outro usuário)
  useEffect(() => {
    permissoesCarregadas.current = false;
  }, [usuario?.perfil]);

  // Busca permissões do perfil do usuário e armazena no contexto
  // Executado uma vez por sessão — resultado usado como OR com regras hardcoded
  useEffect(() => {
    if (!autenticado || !usuario?.perfil || permissoesCarregadas.current) return;
    permissoesCarregadas.current = true;

    permissoesApi.buscarPerfil(usuario.perfil as PerfilUsuario)
      .then((data) => {
        const lista: string[] = [];
        for (const mod of data.modulos) {
          const acoes = ["visualizar", "criar", "editar", "excluir", "validar"] as const;
          for (const acao of acoes) {
            if (mod[acao]?.concedida) lista.push(`${mod.modulo}:${acao}`);
          }
        }
        atualizarPermissoesPerfil(lista);
      })
      .catch(() => {
        // Falha silenciosa — usePermissoes cai no fallback hardcoded
      });
  }, [autenticado, usuario?.perfil, atualizarPermissoesPerfil]);

  if (!autenticado) return <Navigate to="/login" replace />;
  return <>{children}</>;
}