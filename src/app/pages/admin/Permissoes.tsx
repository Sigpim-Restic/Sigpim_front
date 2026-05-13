import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Shield, AlertTriangle, Loader2,
  AlertCircle, Save, ChevronDown, ChevronRight, Info,
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

const PERFIL_META: Record<PerfilUsuario, { nome: string; descricao: string; cor: string }> = {
  ADMINISTRADOR_SISTEMA:     { nome: "Adm. Sistema",        descricao: "Infraestrutura, usuários, configurações e tudo mais", cor: "bg-red-100 text-red-700 border-red-200" },
  ADMINISTRADOR_PATRIMONIAL: { nome: "Adm. Patrimonial",    descricao: "Cadastro mestre, catálogos e validação patrimonial",   cor: "bg-[#1351B4]/10 text-[#1351B4] border-[#1351B4]/20" },
  CADASTRADOR_SETORIAL:      { nome: "Cadastrador Setorial", descricao: "Alimenta as abas de imóveis da sua secretaria",         cor: "bg-blue-50 text-blue-700 border-blue-200" },
  VALIDADOR_DOCUMENTAL:      { nome: "Validador Documental", descricao: "Valida documentação e situação dominial por órgão",     cor: "bg-green-50 text-green-700 border-green-200" },
  VISTORIADOR:               { nome: "Vistoriador",          descricao: "Preenche vistorias, conservação e risco",               cor: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  PLANEJAMENTO:              { nome: "Planejamento",         descricao: "Carteira de projetos e uso planejado",                  cor: "bg-purple-50 text-purple-700 border-purple-200" },
  AUDITOR:                   { nome: "Auditor",              descricao: "Somente leitura e exportações",                         cor: "bg-gray-100 text-gray-600 border-gray-200" },
};

const MODULOS_META: Record<string, { nome: string; descricao: string; critical?: boolean }> = {
  dashboard:     { nome: "Painel Geral",       descricao: "Estatísticas e indicadores" },
  imoveis:       { nome: "Gestão de Imóveis",  descricao: "Cadastro, edição e consulta de imóveis" },
  pendencias:    { nome: "Pendências",          descricao: "Gestão de pendências e validações" },
  gis:           { nome: "Mapa GIS",            descricao: "Visualização georreferenciada" },
  relatorios:    { nome: "Relatórios",           descricao: "Geração e exportação de relatórios" },
  usuarios:      { nome: "Usuários e Perfis",   descricao: "Gestão de usuários do sistema",    critical: true },
  auditoria:     { nome: "Auditoria",            descricao: "Logs e rastreamento de ações",     critical: true },
  configuracoes: { nome: "Configurações",        descricao: "Configurações gerais do sistema",  critical: true },
};

const ACOES: { id: string; nome: string; tooltip?: string }[] = [
  { id: "visualizar", nome: "Ver" },
  { id: "criar",      nome: "Criar" },
  { id: "editar",     nome: "Editar" },
  { id: "excluir",    nome: "Excluir" },
  { id: "validar",    nome: "Validar", tooltip: "Validar/recusar domínios de imóveis" },
];

// ── Componente ────────────────────────────────────────────────────────────────

export function Permissoes() {
  const navigate = useNavigate();

  const [todos,      setTodos]      = useState<PermissoesPerfilResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState<string | null>(null);
  const [salvando,   setSalvando]   = useState<PerfilUsuario | null>(null);

  // pending: perfilKey → {modulo:acao → boolean (true=conceder, false=revogar)}
  const [pending, setPending] = useState<Record<string, Record<string, boolean>>>({});
  // perfis com accordion aberto
  const [abertos, setAbertos] = useState<Set<string>>(new Set(["ADMINISTRADOR_SISTEMA"]));

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

  const toggleAcordeon = (perfil: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      if (next.has(perfil)) next.delete(perfil);
      else next.add(perfil);
      return next;
    });
  };

  const handleCelulaChange = (perfil: string, modulo: string, acao: string, conceder: boolean) => {
    const chave = `${modulo}:${acao}`;
    // Estado original no servidor
    const perfilData = todos.find((p) => p.perfil === perfil);
    const moduloDados = perfilData?.modulos.find((m) => m.modulo === modulo);
    const acaoDados   = moduloDados?.[acao as keyof typeof moduloDados] as { concedida: boolean } | undefined;
    const original    = acaoDados?.concedida ?? false;

    setPending((prev) => {
      const perfilPending = { ...(prev[perfil] ?? {}) };
      if (conceder === original) delete perfilPending[chave];
      else perfilPending[chave] = conceder;
      return { ...prev, [perfil]: perfilPending };
    });
  };

  const handleSalvar = async (perfil: PerfilUsuario) => {
    const perfilPending = pending[perfil] ?? {};
    if (Object.keys(perfilPending).length === 0) return;

    setSalvando(perfil);
    const conceder: PermissaoItem[] = [];
    const revogar:  PermissaoItem[] = [];
    for (const [chave, flag] of Object.entries(perfilPending)) {
      const [modulo, acao] = chave.split(":");
      if (flag) conceder.push({ modulo, acao });
      else      revogar.push({ modulo, acao });
    }

    try {
      const novo = await permissoesApi.salvarPerfil(perfil, { conceder, revogar });
      setTodos((prev) => prev.map((p) => p.perfil === perfil ? novo : p));
      setPending((prev) => { const n = { ...prev }; delete n[perfil]; return n; });
      toast.success(`Permissões do perfil ${PERFIL_META[perfil]?.nome} salvas.`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Erro ao salvar.");
    } finally {
      setSalvando(null);
    }
  };

  const descartarPerfil = (perfil: string) => {
    setPending((prev) => { const n = { ...prev }; delete n[perfil]; return n; });
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
            Configure o que cada perfil pode fazer. Todos os usuários de um perfil herdam automaticamente.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Alterações aqui afetam <strong>todos</strong> os usuários do perfil imediatamente. Módulos com
        {" "}<AlertTriangle className="inline h-3.5 w-3.5 text-yellow-600" /> são críticos para segurança do sistema.</span>
      </div>

      {/* Um accordion por perfil */}
      {todos.map((perfilData) => {
        const meta         = PERFIL_META[perfilData.perfil];
        const isAberto     = abertos.has(perfilData.perfil);
        const perfilPending = pending[perfilData.perfil] ?? {};
        const temMudancas   = Object.keys(perfilPending).length > 0;
        const isSalvando    = salvando === perfilData.perfil;

        return (
          <div key={perfilData.perfil}
            className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

            {/* Cabeçalho do accordion */}
            <div
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 select-none"
              onClick={() => toggleAcordeon(perfilData.perfil)}
            >
              <div className="flex items-center gap-3">
                {isAberto
                  ? <ChevronDown className="h-4 w-4 text-gray-400" />
                  : <ChevronRight className="h-4 w-4 text-gray-400" />}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{meta?.nome ?? perfilData.perfil}</span>
                    <Badge className={`text-xs border ${meta?.cor ?? ""}`}>{perfilData.perfil}</Badge>
                    {temMudancas && (
                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                        {Object.keys(perfilPending).length} alteração(ões)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{meta?.descricao}</p>
                </div>
              </div>

              {temMudancas && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm"
                    className="h-7 text-xs text-gray-600"
                    onClick={() => descartarPerfil(perfilData.perfil)}
                    disabled={isSalvando}>
                    Descartar
                  </Button>
                  <Button size="sm"
                    className="h-7 text-xs bg-[#1351B4] hover:bg-[#0c3b8d]"
                    onClick={() => handleSalvar(perfilData.perfil)}
                    disabled={isSalvando}>
                    {isSalvando
                      ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Salvando...</>
                      : <><Save className="mr-1.5 h-3 w-3" />Salvar</>}
                  </Button>
                </div>
              )}
            </div>

            {/* Tabela de permissões */}
            {isAberto && (
              <div className="border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-2.5 font-medium text-gray-600 w-64">Módulo</th>
                      {ACOES.map((a) => (
                        <th key={a.id} className="text-center px-3 py-2.5 font-medium text-gray-600"
                          title={a.tooltip}>
                          {a.nome}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {perfilData.modulos.map((moduloData, idx) => {
                      const mmeta = MODULOS_META[moduloData.modulo];
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
                            const acaoDados = moduloData[acao.id as keyof typeof moduloData] as { concedida: boolean };
                            const chave     = `${moduloData.modulo}:${acao.id}`;
                            const pendente  = chave in perfilPending ? perfilPending[chave] : null;
                            const efetiva   = pendente !== null ? pendente : (acaoDados?.concedida ?? false);

                            return (
                              <td key={acao.id} className="px-3 py-3 text-center">
                                <button
                                  onClick={() => handleCelulaChange(
                                    perfilData.perfil, moduloData.modulo, acao.id, !efetiva)}
                                  title={efetiva ? "Clique para revogar" : "Clique para conceder"}
                                  className={[
                                    "inline-flex h-7 w-7 items-center justify-center rounded-full transition-all border-2 text-xs font-bold",
                                    pendente !== null
                                      ? "ring-2 ring-amber-400 ring-offset-1"
                                      : "",
                                    efetiva
                                      ? "bg-green-100 text-green-700 border-green-400 hover:bg-red-50 hover:border-red-400 hover:text-red-600"
                                      : "bg-gray-100 text-gray-300 border-gray-200 hover:bg-blue-50 hover:border-[#1351B4] hover:text-[#1351B4]",
                                  ].join(" ")}>
                                  {efetiva ? "✓" : "✕"}
                                </button>
                              </td>
                            );
                          })}
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
    </div>
  );
}