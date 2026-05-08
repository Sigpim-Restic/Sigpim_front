import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Shield, AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { AlertBox } from "../../components/layout/States";
import { Badge } from "../../components/ui/badge";
import { usuariosApi, type UsuarioResponse, type PerfilUsuario } from "../../api/usuarios";

// ─── Mapeamento de perfis ────────────────────────────────────────────────────

const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  ADMINISTRADOR_SISTEMA:     "Adm. Sistema",
  ADMINISTRADOR_PATRIMONIAL: "Adm. Patrimonial",
  CADASTRADOR_SETORIAL:      "Cadastrador Setorial",
  VALIDADOR_DOCUMENTAL:      "Validador Documental",
  VISTORIADOR:               "Vistoriador",
  PLANEJAMENTO:              "Planejamento",
  AUDITOR:                   "Auditor",
};

// ─── O que cada perfil pode fazer, por módulo ────────────────────────────────
// Baseado em SecurityExpressions.java — fonte da verdade é o backend.

interface PermissaoModulo {
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

type MatrizPermissoes = Record<string, PermissaoModulo>;

const NENHUMA: PermissaoModulo = { visualizar: false, criar: false, editar: false, excluir: false };
const SOMENTE_LEITURA: PermissaoModulo = { visualizar: true, criar: false, editar: false, excluir: false };
const LEITURA_ESCRITA: PermissaoModulo = { visualizar: true, criar: true, editar: true, excluir: false };
const COMPLETO: PermissaoModulo = { visualizar: true, criar: true, editar: true, excluir: true };

function resolverPermissoesDoPerfil(perfil: PerfilUsuario | null): MatrizPermissoes {
  if (!perfil) {
    return {
      dashboard:     NENHUMA,
      imoveis:       NENHUMA,
      pendencias:    NENHUMA,
      gis:           NENHUMA,
      relatorios:    NENHUMA,
      usuarios:      NENHUMA,
      auditoria:     NENHUMA,
      configuracoes: NENHUMA,
    };
  }

  switch (perfil) {
    case "ADMINISTRADOR_SISTEMA":
      return {
        dashboard:     SOMENTE_LEITURA,
        imoveis:       SOMENTE_LEITURA,          // lê, mas não cria/valida
        pendencias:    { visualizar: true, criar: true, editar: true, excluir: true },
        gis:           SOMENTE_LEITURA,
        relatorios:    { visualizar: true, criar: true, editar: false, excluir: false },
        usuarios:      COMPLETO,                  // dono da plataforma
        auditoria:     SOMENTE_LEITURA,
        configuracoes: COMPLETO,
      };

    case "ADMINISTRADOR_PATRIMONIAL":
      return {
        dashboard:     SOMENTE_LEITURA,
        imoveis:       COMPLETO,
        pendencias:    LEITURA_ESCRITA,
        gis:           SOMENTE_LEITURA,
        relatorios:    { visualizar: true, criar: true, editar: false, excluir: false },
        usuarios:      NENHUMA,
        auditoria:     NENHUMA,
        configuracoes: NENHUMA,
      };

    case "CADASTRADOR_SETORIAL":
      return {
        dashboard:     SOMENTE_LEITURA,
        imoveis:       LEITURA_ESCRITA,
        pendencias:    SOMENTE_LEITURA,
        gis:           SOMENTE_LEITURA,
        relatorios:    { visualizar: true, criar: true, editar: false, excluir: false },
        usuarios:      NENHUMA,
        auditoria:     NENHUMA,
        configuracoes: NENHUMA,
      };

    case "VALIDADOR_DOCUMENTAL":
      return {
        dashboard:     SOMENTE_LEITURA,
        imoveis:       { visualizar: true, criar: false, editar: true, excluir: false },
        pendencias:    SOMENTE_LEITURA,
        gis:           SOMENTE_LEITURA,
        relatorios:    NENHUMA,
        usuarios:      NENHUMA,
        auditoria:     NENHUMA,
        configuracoes: NENHUMA,
      };

    case "VISTORIADOR":
      return {
        dashboard:     SOMENTE_LEITURA,
        imoveis:       SOMENTE_LEITURA,
        pendencias:    NENHUMA,
        gis:           SOMENTE_LEITURA,
        relatorios:    NENHUMA,
        usuarios:      NENHUMA,
        auditoria:     NENHUMA,
        configuracoes: NENHUMA,
      };

    case "PLANEJAMENTO":
      return {
        dashboard:     SOMENTE_LEITURA,
        imoveis:       SOMENTE_LEITURA,
        pendencias:    NENHUMA,
        gis:           SOMENTE_LEITURA,
        relatorios:    { visualizar: true, criar: true, editar: false, excluir: false },
        usuarios:      NENHUMA,
        auditoria:     NENHUMA,
        configuracoes: NENHUMA,
      };

    case "AUDITOR":
      return {
        dashboard:     SOMENTE_LEITURA,
        imoveis:       SOMENTE_LEITURA,
        pendencias:    SOMENTE_LEITURA,
        gis:           SOMENTE_LEITURA,
        relatorios:    { visualizar: true, criar: true, editar: false, excluir: false },
        usuarios:      NENHUMA,
        auditoria:     SOMENTE_LEITURA,
        configuracoes: NENHUMA,
      };
  }
}

// ─── Módulos exibidos na tabela ──────────────────────────────────────────────

const MODULOS = [
  { id: "dashboard",     name: "Painel Geral",      description: "Visualização de estatísticas e indicadores" },
  { id: "imoveis",       name: "Gestão de Imóveis",  description: "Cadastro, edição e consulta de imóveis" },
  { id: "pendencias",    name: "Pendências",          description: "Gestão de pendências e validações" },
  { id: "gis",           name: "Mapa GIS",            description: "Visualização georreferenciada" },
  { id: "relatorios",    name: "Relatórios",           description: "Geração e exportação de relatórios" },
  { id: "usuarios",      name: "Usuários e Perfis",   description: "Gestão de usuários do sistema", critical: true },
  { id: "auditoria",     name: "Auditoria",            description: "Logs e rastreamento de ações", critical: true },
  { id: "configuracoes", name: "Configurações",        description: "Configurações gerais do sistema", critical: true },
];

const ACOES: { id: keyof PermissaoModulo; name: string }[] = [
  { id: "visualizar", name: "Visualizar" },
  { id: "criar",      name: "Criar" },
  { id: "editar",     name: "Editar" },
  { id: "excluir",    name: "Excluir" },
];

// ─── Componente principal ────────────────────────────────────────────────────

export function Permissoes() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [usuario,  setUsuario]  = useState<UsuarioResponse | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setErro("ID de usuário não informado."); setLoading(false); return; }

    usuariosApi.buscarPorId(Number(id))
      .then(setUsuario)
      .catch((e) => setErro(e?.message ?? "Erro ao carregar usuário."))
      .finally(() => setLoading(false));
  }, [id]);

  const permissoes = resolverPermissoesDoPerfil(usuario?.perfil ?? null);
  const modulosCriticos = MODULOS.filter((m) => m.critical);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
      </div>
    );
  }

  // ── Erro ─────────────────────────────────────────────────────────────────
  if (erro || !usuario) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/usuarios")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{erro ?? "Usuário não encontrado."}</span>
        </div>
      </div>
    );
  }

  const perfilLabel = usuario.perfil ? (PERFIL_LABELS[usuario.perfil] ?? usuario.perfil) : "Sem perfil";
  const ehAdmin = usuario.perfil?.startsWith("ADMINISTRADOR");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/usuarios")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Permissões do Perfil
          </h2>
          <p className="text-sm text-gray-600">
            Usuário:{" "}
            <span className="font-medium">{usuario.nomeCompleto}</span>
            {" • "}
            {usuario.perfil ? (
              <Badge className={ehAdmin ? "bg-[#1351B4]" : "bg-gray-500"}>
                {perfilLabel}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-700 border-yellow-400 bg-yellow-50">
                Sem perfil
              </Badge>
            )}
          </p>
        </div>
      </div>

      {/* Aviso de módulos críticos */}
      {modulosCriticos.length > 0 && (
        <AlertBox variant="warning" title="Atenção - Módulos Críticos">
          <p>
            Os módulos marcados com{" "}
            <AlertTriangle className="inline h-4 w-4 text-yellow-600" />{" "}
            possuem permissões críticas que afetam a segurança e governança do
            sistema. Conceda acesso apenas a usuários autorizados.
          </p>
        </AlertBox>
      )}

      {/* Aviso: sem perfil */}
      {!usuario.perfil && (
        <AlertBox variant="warning" title="Usuário sem perfil">
          <p>
            Este usuário ainda não possui perfil definido. Todas as permissões
            estão bloqueadas até que um administrador atribua um perfil.
          </p>
        </AlertBox>
      )}

      {/* Tabela de permissões */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">Módulo</span>
                  </div>
                </th>
                {ACOES.map((a) => (
                  <th key={a.id} className="px-4 py-4 text-center font-semibold text-gray-900">
                    {a.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULOS.map((modulo, index) => {
                const perm = permissoes[modulo.id] ?? NENHUMA;
                return (
                  <tr
                    key={modulo.id}
                    className={[
                      "border-b border-gray-100",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                      modulo.critical ? "bg-yellow-50/30" : "",
                    ].join(" ")}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {modulo.critical && (
                          <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{modulo.name}</p>
                          <p className="text-xs text-gray-500">{modulo.description}</p>
                        </div>
                      </div>
                    </td>
                    {ACOES.map((acao) => (
                      <td key={acao.id} className="px-4 py-4 text-center">
                        {perm[acao.id] ? (
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700"
                            title="Permitido"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                          </span>
                        ) : (
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-300"
                            title="Não permitido"
                          >
                            <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor">
                              <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legenda */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-sm text-blue-900">
          Sobre estas permissões
        </h4>
        <p className="text-sm text-blue-800">
          As permissões exibidas são <strong>derivadas automaticamente do perfil</strong> do
          usuário conforme o Manual Operacional do SIGPIM v1.1. Para alterar as permissões,
          altere o perfil do usuário na tela de Usuários e Perfis.
        </p>
      </div>

      {/* Ação */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/usuarios")}
        >
          Voltar para Usuários
        </Button>
      </div>
    </div>
  );
}