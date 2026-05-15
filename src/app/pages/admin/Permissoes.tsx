import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Shield, AlertTriangle, Loader2,
  AlertCircle, Save, ChevronDown, ChevronRight, Info, CheckSquare, Square, Plus,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  permissoesApi,
  type PermissoesPerfilResponse,
  type PermissaoItem,
} from "../../api/permissoes";
import type { PerfilUsuario } from "../../api/usuarios";

// ── Metadados ─────────────────────────────────────────────────────────────────

const PERFIL_META: Record<PerfilUsuario, { nome: string; descricao: string; cor: string; imutavel?: boolean }> = {
  ADMINISTRADOR_SISTEMA:     { nome: "Adm. Sistema",         descricao: "Infraestrutura, usuários, configurações e tudo mais", cor: "bg-red-100 text-red-700 border-red-200", imutavel: true },
  ADMINISTRADOR_PATRIMONIAL: { nome: "Adm. Patrimonial",     descricao: "Cadastro mestre, catálogos e validação patrimonial",   cor: "bg-[#1351B4]/10 text-[#1351B4] border-[#1351B4]/20" },
  CADASTRADOR_SETORIAL:      { nome: "Cadastrador Setorial",  descricao: "Alimenta as abas de imóveis da sua secretaria",        cor: "bg-blue-50 text-blue-700 border-blue-200" },
  VALIDADOR_DOCUMENTAL:      { nome: "Validador Documental",  descricao: "Valida documentação e situação dominial por órgão",    cor: "bg-green-50 text-green-700 border-green-200" },
  VISTORIADOR:               { nome: "Vistoriador",           descricao: "Preenche vistorias, conservação e risco",              cor: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PLANEJAMENTO:              { nome: "Planejamento",          descricao: "Carteira de projetos e uso planejado",                 cor: "bg-purple-50 text-purple-700 border-purple-200" },
  AUDITOR:                   { nome: "Auditor",               descricao: "Somente leitura e exportações",                        cor: "bg-gray-100 text-gray-600 border-gray-200" },
};

const MODULOS_META: Record<string, { nome: string; descricao: string; critical?: boolean }> = {
  dashboard:     { nome: "Painel Geral",       descricao: "Estatísticas e indicadores" },
  imoveis:       { nome: "Gestão de Imóveis",  descricao: "Cadastro, edição e consulta de imóveis" },
  pendencias:    { nome: "Pendências",          descricao: "Gestão de pendências e validações" },
  gis:           { nome: "Mapa GIS",            descricao: "Visualização georreferenciada" },
  relatorios:    { nome: "Relatórios",           descricao: "Geração e exportação de relatórios" },
  usuarios:      { nome: "Usuários e Perfis",   descricao: "Gestão de usuários do sistema",   critical: true },
  auditoria:     { nome: "Auditoria",            descricao: "Logs e rastreamento de ações",    critical: true },
  configuracoes: { nome: "Configurações",        descricao: "Configurações gerais do sistema", critical: true },
};

const ACOES: { id: string; nome: string; tooltip?: string }[] = [
  { id: "visualizar", nome: "Ver" },
  { id: "criar",      nome: "Criar" },
  { id: "editar",     nome: "Editar" },
  { id: "excluir",    nome: "Excluir" },
  { id: "validar",    nome: "Validar", tooltip: "Validar/recusar domínios de imóveis" },
];

const ACOES_IDS = ACOES.map((a) => a.id);
const MODULOS_IDS = Object.keys(MODULOS_META);

// Permissões base por perfil — não podem ser revogadas (definem a identidade do perfil)
const PERMISSOES_BASE: Partial<Record<PerfilUsuario, Set<string>>> = {
  ADMINISTRADOR_PATRIMONIAL: new Set([
    "imoveis:visualizar", "imoveis:criar", "imoveis:editar",
    "vistorias:visualizar", "vistorias:criar",
    "intervencoes:visualizar", "intervencoes:criar",
  ]),
  CADASTRADOR_SETORIAL: new Set([
    "imoveis:visualizar", "imoveis:criar", "imoveis:editar",
  ]),
  VALIDADOR_DOCUMENTAL: new Set([
    "imoveis:visualizar", "imoveis:validar",
  ]),
  VISTORIADOR: new Set([
    "imoveis:visualizar",
    "vistorias:visualizar", "vistorias:criar", "vistorias:editar",
    "intervencoes:visualizar", "intervencoes:criar", "intervencoes:editar",
  ]),
  PLANEJAMENTO: new Set([
    "imoveis:visualizar",
    "intervencoes:visualizar", "intervencoes:criar", "intervencoes:editar",
  ]),
  AUDITOR: new Set([
    "auditoria:visualizar",
  ]),
};

function ehPermissaoBase(perfil: PerfilUsuario, modulo: string, acao: string): boolean {
  return PERMISSOES_BASE[perfil]?.has(`${modulo}:${acao}`) ?? false;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function Permissoes() {
  const navigate = useNavigate();
  const [todos,    setTodos]    = useState<PermissoesPerfilResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState<string | null>(null);
  const [salvando, setSalvando] = useState<string | null>(null);

  // pending: chave → { "modulo:acao" → boolean (true=conceder, false=revogar) }
  const [pending, setPending] = useState<Record<string, Record<string, boolean>>>({});
  const [abertos, setAbertos] = useState<Set<string>>(new Set(["ADMINISTRADOR_PATRIMONIAL"]));

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const data = await permissoesApi.listarPerfis();
      setTodos(data);
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao carregar permissões.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const toggleAcordeon = (chave: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      if (next.has(chave)) next.delete(chave);
      else next.add(chave);
      return next;
    });
  };

  // ── Helpers de estado ──────────────────────────────────────────────────────

  const getEfetiva = (
    chave: string,
    modulo: string,
    acao: string,
    perfilData: PermissoesPerfilResponse
  ): boolean => {
    const k = `${modulo}:${acao}`;
    const perfilPending = pending[chave] ?? {};
    if (k in perfilPending) return perfilPending[k];
    const moduloDados = perfilData.modulos.find((m) => m.modulo === modulo);
    const acaoDados = moduloDados?.[acao as keyof typeof moduloDados] as { concedida: boolean } | undefined;
    return acaoDados?.concedida ?? false;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCelulaChange = (
    chave: string,
    modulo: string,
    acao: string,
    conceder: boolean,
    perfilData: PermissoesPerfilResponse
  ) => {
    const k = `${modulo}:${acao}`;
    const moduloDados = perfilData.modulos.find((m) => m.modulo === modulo);
    const acaoDados = moduloDados?.[acao as keyof typeof moduloDados] as { concedida: boolean } | undefined;
    const original = acaoDados?.concedida ?? false;

    setPending((prev) => {
      const perfilPending = { ...(prev[chave] ?? {}) };
      if (conceder === original) delete perfilPending[k];
      else perfilPending[k] = conceder;
      return { ...prev, [chave]: perfilPending };
    });
  };

  const handleSelecionarLinha = (
    chave: string,
    modulo: string,
    marcar: boolean,
    perfilData: PermissoesPerfilResponse
  ) => {
    setPending((prev) => {
      const perfilPending = { ...(prev[chave] ?? {}) };
      for (const acao of ACOES_IDS) {
        const k = `${modulo}:${acao}`;
        const moduloDados = perfilData.modulos.find((m) => m.modulo === modulo);
        const acaoDados = moduloDados?.[acao as keyof typeof moduloDados] as { concedida: boolean } | undefined;
        const original = acaoDados?.concedida ?? false;
        if (marcar === original) delete perfilPending[k];
        else perfilPending[k] = marcar;
      }
      return { ...prev, [chave]: perfilPending };
    });
  };

  const handleSelecionarTudo = (
    chave: string,
    marcar: boolean,
    perfilData: PermissoesPerfilResponse
  ) => {
    setPending((prev) => {
      const perfilPending: Record<string, boolean> = {};
      for (const modulo of MODULOS_IDS) {
        for (const acao of ACOES_IDS) {
          const k = `${modulo}:${acao}`;
          const moduloDados = perfilData.modulos.find((m) => m.modulo === modulo);
          const acaoDados = moduloDados?.[acao as keyof typeof moduloDados] as { concedida: boolean } | undefined;
          const original = acaoDados?.concedida ?? false;
          if (marcar !== original) perfilPending[k] = marcar;
        }
      }
      return { ...prev, [chave]: perfilPending };
    });
  };

  const handleSalvar = async (perfilData: PermissoesPerfilResponse) => {
    const chave = perfilData.chave;
    const perfilPending = pending[chave] ?? {};
    if (Object.keys(perfilPending).length === 0) return;

    setSalvando(chave);
    const conceder: PermissaoItem[] = [];
    const revogar:  PermissaoItem[] = [];
    for (const [k, flag] of Object.entries(perfilPending)) {
      const [modulo, acao] = k.split(":");
      if (flag) conceder.push({ modulo, acao });
      else      revogar.push({ modulo, acao });
    }

    try {
      let novo: PermissoesPerfilResponse;
      if (perfilData.customizado) {
        novo = await permissoesApi.salvarPerfilCustomizado(chave, { conceder, revogar });
      } else {
        novo = await permissoesApi.salvarPerfil(perfilData.perfil, { conceder, revogar });
      }
      setTodos((prev) => prev.map((p) => p.chave === chave ? novo : p));
      setPending((prev) => { const n = { ...prev }; delete n[chave]; return n; });
      const nome = perfilData.nome ?? PERFIL_META[perfilData.perfil]?.nome ?? chave;
      toast.success(`Permissões do perfil "${nome}" salvas.`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Erro ao salvar.");
    } finally {
      setSalvando(null);
    }
  };

  const descartarPerfil = (chave: string) => {
    setPending((prev) => { const n = { ...prev }; delete n[chave]; return n; });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
    </div>
  );

  if (erro && todos.length === 0) return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erro}</span>
      </div>
    </div>
  );

  // Separar padrões de customizados
  const perfisPadrao = todos.filter((p) => !p.customizado);
  const perfisCustomizados = todos.filter((p) => p.customizado);

  return (
    <div className="mx-auto max-w-5xl space-y-4">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1351B4]" />
            Permissões por Perfil
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure o que cada perfil pode fazer. Todos os usuários de um perfil herdam automaticamente as mesmas permissões.
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/permissoes/customizados")}
          variant="outline"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Perfis Customizados
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Alterações aqui afetam <strong>todos</strong> os usuários do perfil imediatamente. Módulos com{" "}
        <AlertTriangle className="inline h-3.5 w-3.5 text-yellow-600" /> são críticos para segurança do sistema.</span>
      </div>

      {/* Perfis padrão */}
      {perfisPadrao.map((perfilData) => {
        const meta          = PERFIL_META[perfilData.perfil];
        const chave         = perfilData.chave;
        const isAberto      = abertos.has(chave);
        const perfilPending = pending[chave] ?? {};
        const temMudancas   = Object.keys(perfilPending).length > 0;
        const isSalvando    = salvando === chave;
        const imutavel      = meta?.imutavel === true;

        return (
          <div key={chave} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

            {/* Cabeçalho do accordion */}
            <div
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => toggleAcordeon(chave)}
            >
              <div className="flex items-center gap-3">
                {isAberto
                  ? <ChevronDown className="h-4 w-4 text-gray-400" />
                  : <ChevronRight className="h-4 w-4 text-gray-400" />}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{meta?.nome ?? perfilData.perfil}</span>
                    <Badge className={`text-xs border ${meta?.cor ?? ""}`}>{perfilData.perfil}</Badge>
                    {imutavel && (
                      <Badge className="text-xs bg-red-50 text-red-600 border-red-200">Imutável</Badge>
                    )}
                    {temMudancas && !imutavel && (
                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                        {Object.keys(perfilPending).length} alteração(ões)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{meta?.descricao}</p>
                </div>
              </div>

              {isAberto && !imutavel && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm"
                    className="h-7 text-xs text-gray-600 gap-1"
                    onClick={() => handleSelecionarTudo(chave, true, perfilData)}
                    disabled={isSalvando}>
                    <CheckSquare className="h-3.5 w-3.5" />Todas
                  </Button>
                  <Button variant="outline" size="sm"
                    className="h-7 text-xs text-gray-600 gap-1"
                    onClick={() => handleSelecionarTudo(chave, false, perfilData)}
                    disabled={isSalvando}>
                    <Square className="h-3.5 w-3.5" />Nenhuma
                  </Button>

                  {temMudancas && (
                    <>
                      <div className="w-px h-5 bg-gray-200 mx-1" />
                      <Button variant="outline" size="sm"
                        className="h-7 text-xs text-gray-600"
                        onClick={() => descartarPerfil(chave)}
                        disabled={isSalvando}>
                        Descartar
                      </Button>
                      <Button size="sm"
                        className="h-7 text-xs bg-[#1351B4] hover:bg-[#0c3b8d]"
                        onClick={() => handleSalvar(perfilData)}
                        disabled={isSalvando}>
                        {isSalvando
                          ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Salvando...</>
                          : <><Save className="mr-1.5 h-3 w-3" />Salvar</>}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {isAberto && imutavel && (
              <div className="border-t border-gray-100 px-5 py-3 bg-red-50 flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  As permissões do <strong>Administrador do Sistema</strong> são imutáveis.
                  Este perfil tem acesso completo à plataforma por definição e não pode ser restringido.
                </span>
              </div>
            )}

            {isAberto && (
              <div className="border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-2.5 font-medium text-gray-600 w-64">Módulo</th>
                      {ACOES.map((a) => (
                        <th key={a.id} className="text-center px-3 py-2.5 font-medium text-gray-600" title={a.tooltip}>
                          {a.nome}
                        </th>
                      ))}
                      {!imutavel && (
                        <th className="text-center px-3 py-2.5 font-medium text-gray-400 text-xs w-20">Linha</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {perfilData.modulos.map((moduloData, idx) => {
                      const mmeta = MODULOS_META[moduloData.modulo];
                      const todasLinha = ACOES_IDS.every((acao) =>
                        getEfetiva(chave, moduloData.modulo, acao, perfilData)
                      );
                      const nenhumaLinha = ACOES_IDS.every((acao) =>
                        !getEfetiva(chave, moduloData.modulo, acao, perfilData)
                      );

                      return (
                        <tr key={moduloData.modulo}
                          className={[
                            "border-b border-gray-50 transition-colors hover:bg-gray-50/50",
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                          ].join(" ")}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {mmeta?.critical && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{mmeta?.nome ?? moduloData.modulo}</p>
                                <p className="text-xs text-gray-400">{mmeta?.descricao}</p>
                              </div>
                            </div>
                          </td>
                          {ACOES.map((acao) => {
                            const k = `${moduloData.modulo}:${acao.id}`;
                            const pendente = k in (pending[chave] ?? {}) ? (pending[chave] ?? {})[k] : null;
                            const efetiva  = getEfetiva(chave, moduloData.modulo, acao.id, perfilData);
                            const eBase = ehPermissaoBase(perfilData.perfil, moduloData.modulo, acao.id);
                            const bloqueado = imutavel || eBase;
                            return (
                              <td key={acao.id} className="px-3 py-3 text-center">
                                <button
                                  disabled={bloqueado}
                                  onClick={() => !bloqueado && handleCelulaChange(
                                    chave, moduloData.modulo, acao.id, !efetiva, perfilData)}
                                  title={
                                    imutavel ? "Imutável" :
                                    eBase ? "Permissão base — não pode ser revogada" :
                                    efetiva ? "Clique para revogar" : "Clique para conceder"
                                  }
                                  className={[
                                    "inline-flex h-7 w-7 items-center justify-center rounded-full transition-all border-2 text-xs font-bold",
                                    bloqueado ? "cursor-not-allowed" : "",
                                    eBase && efetiva ? "opacity-100 bg-green-100 text-green-700 border-green-400" : "",
                                    !bloqueado && pendente !== null ? "ring-2 ring-amber-400 ring-offset-1" : "",
                                    !bloqueado && efetiva
                                      ? "bg-green-100 text-green-700 border-green-400 hover:bg-red-50 hover:border-red-400 hover:text-red-600"
                                      : !bloqueado
                                      ? "bg-gray-100 text-gray-300 border-gray-200 hover:bg-blue-50 hover:border-[#1351B4] hover:text-[#1351B4]"
                                      : "",
                                    imutavel ? "opacity-60" : "",
                                  ].join(" ")}>
                                  {efetiva ? "✓" : "✕"}
                                </button>
                              </td>
                            );
                          })}
                          {!imutavel && (
                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={() => handleSelecionarLinha(chave, moduloData.modulo, !todasLinha, perfilData)}
                                title={todasLinha ? "Revogar todas desta linha" : "Conceder todas desta linha"}
                                className={[
                                  "inline-flex h-6 w-6 items-center justify-center rounded transition-all border text-xs",
                                  todasLinha
                                    ? "bg-green-50 border-green-300 text-green-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500"
                                    : nenhumaLinha
                                      ? "bg-gray-50 border-gray-200 text-gray-400 hover:bg-blue-50 hover:border-[#1351B4] hover:text-[#1351B4]"
                                      : "bg-amber-50 border-amber-300 text-amber-600 hover:bg-blue-50 hover:border-[#1351B4] hover:text-[#1351B4]",
                                ].join(" ")}>
                                {todasLinha ? "−" : "+"}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Banner de perfis customizados */}
      {perfisCustomizados.length > 0 && (
        <div className="rounded-lg border border-dashed border-[#1351B4]/30 bg-blue-50/30 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1351B4]">
              {perfisCustomizados.length} perfil(is) customizado(s) ativo(s)
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Gerencie e configure as permissões dos perfis customizados criados pelo Admin do Sistema.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/permissoes/customizados")}>
            Gerenciar
          </Button>
        </div>
      )}
    </div>
  );
}