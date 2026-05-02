import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";
import { orgaosApi } from "../api/orgaos";

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
  const { autenticado, usuario, atualizarSiglaOrgao } = useAuth();
  const inicializado = useRef(false);

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

  if (!autenticado) return <Navigate to="/login" replace />;
  return <>{children}</>;
}