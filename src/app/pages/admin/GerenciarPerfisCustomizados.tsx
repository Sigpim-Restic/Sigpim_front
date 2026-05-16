import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Plus, Pencil, ArrowLeft, RefreshCw, AlertCircle, Shield,
  Power, PowerOff, Trash2, AlertTriangle, ChevronDown, ChevronRight,
  Save, CheckSquare, Square, Info, Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  perfisCustomizadosApi,
  type PerfilCustomizadoResponse,
  type PerfilCustomizadoRequest,
} from "../../api/perfisCustomizados";
import { permissoesApi, type PermissoesPerfilResponse, type PermissaoItem } from "../../api/permissoes";
import type { PerfilUsuario } from "../../api/usuarios";

// ── Meta ──────────────────────────────────────────────────────────────────────

const DO_ZERO = "__DO_ZERO__";

const PERFIS_BASE: { value: PerfilUsuario | typeof DO_ZERO; label: string; descricao: string; destaque?: boolean }[] = [
  {
    value: DO_ZERO,
    label: "Do zero — sem herança",
    descricao: "Você define todas as permissões livremente. Não herda nenhum comportamento de perfil padrão.",
    destaque: true,
  },
  { value: "ADMINISTRADOR_PATRIMONIAL", label: "Adm. Patrimonial",    descricao: "Herda: cadastro mestre, validação patrimonial, vistorias" },
  { value: "CADASTRADOR_SETORIAL",      label: "Cadastrador Setorial", descricao: "Herda: criar e editar imóveis da secretaria" },
  { value: "VALIDADOR_DOCUMENTAL",      label: "Validador Documental", descricao: "Herda: validar documentação e situação dominial" },
  { value: "VISTORIADOR",               label: "Vistoriador",          descricao: "Herda: vistorias, conservação e risco" },
  { value: "PLANEJAMENTO",              label: "Planejamento",         descricao: "Herda: carteira de projetos e uso planejado" },
  { value: "AUDITOR",                   label: "Auditor",              descricao: "Herda: somente leitura e exportações" },
];

const MODULOS_META: Record<string, { nome: string; descricao: string; critical?: boolean }> = {
  imoveis:       { nome: "Gestão de Imóveis", descricao: "Cadastro, edição e consulta de imóveis" },
  pendencias:    { nome: "Pendências",         descricao: "Gestão de pendências e validações" },
  gis:           { nome: "Mapa GIS",           descricao: "Visualização georreferenciada" },
  relatorios:    { nome: "Relatórios",          descricao: "Geração e exportação de relatórios" },
  usuarios:      { nome: "Usuários e Perfis",  descricao: "Gestão de usuários do sistema", critical: true },
  auditoria:     { nome: "Auditoria",           descricao: "Logs e rastreamento de ações", critical: true },
  configuracoes: { nome: "Configurações",       descricao: "Configurações gerais do sistema", critical: true },
};

const ACOES = [
  { id: "visualizar", nome: "Ver" },
  { id: "criar",      nome: "Criar" },
  { id: "editar",     nome: "Editar" },
  { id: "excluir",    nome: "Excluir" },
  { id: "validar",    nome: "Validar" },
];
const ACOES_IDS = ACOES.map((a) => a.id);
const MODULOS_IDS = Object.keys(MODULOS_META);

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormState {
  aberto: boolean;
  modo: "criar" | "editar";
  id: number | null;
  nome: string;
  descricao: string;
  perfilBase: PerfilUsuario | typeof DO_ZERO | "";
}

const formVazio: FormState = {
  aberto: false, modo: "criar", id: null, nome: "", descricao: "", perfilBase: "",
};

function BaseLabel({ perfil }: { perfil: PerfilCustomizadoResponse }) {
  if (!perfil.perfilBase) {
    return (
      <Badge className="text-xs bg-purple-50 text-purple-700 border-purple-200 gap-1">
        <Sparkles className="h-2.5 w-2.5" />Do zero
      </Badge>
    );
  }
  const label = PERFIS_BASE.find((b) => b.value === perfil.perfilBase)?.label ?? perfil.perfilBase;
  return (
    <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
      herda: {label}
    </Badge>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export function GerenciarPerfisCustomizados() {
  const navigate = useNavigate();

  const [perfis,      setPerfis]      = useState<PerfilCustomizadoResponse[]>([]);
  const [permissoes,  setPermissoes]  = useState<Record<string, PermissoesPerfilResponse>>({});
  // "carregados" rastreia quais chaves já foram buscadas (mesmo que vazias ou com erro)
  const [carregados,  setCarregados]  = useState<Set<string>>(new Set());
  const [expanded,    setExpanded]    = useState<Set<number>>(new Set());
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [acaoLoading, setAcaoLoading] = useState<number | null>(null);

  const [form,        setForm]        = useState<FormState>(formVazio);
  const [formErro,    setFormErro]    = useState<string | null>(null);
  const [salvando,    setSalvando]    = useState(false);
  const [excluirConf, setExcluirConf] = useState<PerfilCustomizadoResponse | null>(null);

  const [pending,      setPending]      = useState<Record<string, Record<string, boolean>>>({});
  const [salvandoPerm, setSalvandoPerm] = useState<string | null>(null);

  // ── Carregamento ─────────────────────────────────────────────────────────────

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    perfisCustomizadosApi.listarTodos()
      .then(setPerfis)
      .catch(() => setErro("Não foi possível carregar os perfis."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const carregarPermissoes = useCallback(async (chave: string) => {
    // Marca como "em carregamento" adicionando ao Set antes da requisição
    // para evitar chamadas duplicadas se o usuário expandir/recolher rápido
    setCarregados((prev) => new Set(prev).add(chave));
    try {
      const data = await permissoesApi.buscarPerfilCustomizado(chave);
      setPermissoes((p) => ({ ...p, [chave]: data }));
    } catch {
      // Backend retornou erro (ex: perfil recém-criado sem permissões ainda)
      // Cria uma resposta vazia para que a matriz seja exibida com tudo desmarcado
      const vazio: PermissoesPerfilResponse = {
        perfil: null as unknown as PerfilUsuario,
        chave,
        nome: null,
        descricao: null,
        customizado: true,
        modulos: MODULOS_IDS.map((modulo) => ({
          modulo,
          visualizar: { concedida: false, doPerfil: false, grantExtra: false, concedidaPor: null, concedidaEm: null },
          criar:      { concedida: false, doPerfil: false, grantExtra: false, concedidaPor: null, concedidaEm: null },
          editar:     { concedida: false, doPerfil: false, grantExtra: false, concedidaPor: null, concedidaEm: null },
          excluir:    { concedida: false, doPerfil: false, grantExtra: false, concedidaPor: null, concedidaEm: null },
          validar:    { concedida: false, doPerfil: false, grantExtra: false, concedidaPor: null, concedidaEm: null },
        })),
      };
      setPermissoes((p) => ({ ...p, [chave]: vazio }));
    }
  }, []);

  // ── Toggle expansão ──────────────────────────────────────────────────────────

  const toggleExpand = (perfil: PerfilCustomizadoResponse) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(perfil.id)) { next.delete(perfil.id); return next; }
      next.add(perfil.id);
      // Carrega apenas se ainda não foi tentado (evita re-fetch ao expandir novamente)
      if (!carregados.has(perfil.chave)) carregarPermissoes(perfil.chave);
      return next;
    });
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const abrirCriar = () => setForm({ ...formVazio, aberto: true });

  const abrirEditar = (p: PerfilCustomizadoResponse) =>
    setForm({
      aberto: true, modo: "editar", id: p.id, nome: p.nome,
      descricao: p.descricao ?? "",
      perfilBase: p.perfilBase ?? DO_ZERO,
    });

  const fecharForm = () => { setForm(formVazio); setFormErro(null); };

  const handleSalvar = async () => {
    setFormErro(null);
    if (!form.nome.trim()) { setFormErro("Nome é obrigatório."); return; }
    if (!form.perfilBase)  { setFormErro("Selecione uma origem das permissões."); return; }

    const req: PerfilCustomizadoRequest = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      perfilBase: form.perfilBase === DO_ZERO ? undefined : form.perfilBase as PerfilUsuario,
    };

    setSalvando(true);
    try {
      if (form.modo === "criar") {
        const criado = await perfisCustomizadosApi.criar(req);
        toast.success("Perfil criado com sucesso.");
        fecharForm();
        carregar();
        // Pré-carrega as permissões (vazias) já que o usuário provavelmente vai configurar agora
        await carregarPermissoes(criado.chave);
        // Expande automaticamente após criação para o usuário já configurar as permissões
        setExpanded((prev) => new Set(prev).add(criado.id));
      } else {
        await perfisCustomizadosApi.atualizar(form.id!, req);
        toast.success("Perfil atualizado.");
        fecharForm();
        carregar();
      }
    } catch (e: unknown) {
      setFormErro((e as Error)?.message ?? "Erro ao salvar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (p: PerfilCustomizadoResponse) => {
    setAcaoLoading(p.id);
    try {
      const atualizado = p.ativo
        ? await perfisCustomizadosApi.desativar(p.id)
        : await perfisCustomizadosApi.ativar(p.id);
      setPerfis((prev) => prev.map((x) => x.id === p.id ? atualizado : x));
      toast.success(p.ativo ? "Perfil desativado." : "Perfil ativado.");
    } catch { toast.error("Erro ao alterar perfil."); }
    finally { setAcaoLoading(null); }
  };

  const handleExcluir = async (p: PerfilCustomizadoResponse) => {
    setExcluirConf(null);
    setAcaoLoading(p.id);
    try {
      await perfisCustomizadosApi.excluir(p.id);
      setPerfis((prev) => prev.filter((x) => x.id !== p.id));
      // Limpa o estado de permissões do perfil excluído
      setPermissoes((prev) => { const n = { ...prev }; delete n[p.chave]; return n; });
      setCarregados((prev) => { const n = new Set(prev); n.delete(p.chave); return n; });
      toast.success(`Perfil "${p.nome}" excluído.`);
    } catch { toast.error("Erro ao excluir perfil."); }
    finally { setAcaoLoading(null); }
  };

  // ── Permissões ────────────────────────────────────────────────────────────────

  const getEfetiva = (chave: string, modulo: string, acao: string): boolean => {
    const k = `${modulo}:${acao}`;
    const pp = pending[chave] ?? {};
    if (k in pp) return pp[k];
    const perm = permissoes[chave];
    if (!perm) return false;
    const mod = perm.modulos.find((m) => m.modulo === modulo);
    const ac = mod?.[acao as keyof typeof mod] as { concedida: boolean } | undefined;
    return ac?.concedida ?? false;
  };

  const handleCelula = (chave: string, modulo: string, acao: string, conceder: boolean) => {
    const k = `${modulo}:${acao}`;
    const perm = permissoes[chave];
    const mod = perm?.modulos.find((m) => m.modulo === modulo);
    const ac = mod?.[acao as keyof typeof mod] as { concedida: boolean } | undefined;
    const original = ac?.concedida ?? false;
    setPending((prev) => {
      const pp = { ...(prev[chave] ?? {}) };
      if (conceder === original) delete pp[k]; else pp[k] = conceder;
      return { ...prev, [chave]: pp };
    });
  };

  const handleSelecionarTudo = (chave: string, marcar: boolean) => {
    const perm = permissoes[chave];
    setPending((prev) => {
      const pp: Record<string, boolean> = {};
      for (const modulo of MODULOS_IDS) {
        for (const acao of ACOES_IDS) {
          const k = `${modulo}:${acao}`;
          const mod = perm?.modulos.find((m) => m.modulo === modulo);
          const ac = mod?.[acao as keyof typeof mod] as { concedida: boolean } | undefined;
          if (marcar !== (ac?.concedida ?? false)) pp[k] = marcar;
        }
      }
      return { ...prev, [chave]: pp };
    });
  };

  const handleSalvarPermissoes = async (chave: string) => {
    const pp = pending[chave] ?? {};
    if (Object.keys(pp).length === 0) return;

    setSalvandoPerm(chave);
    const conceder: PermissaoItem[] = [];
    const revogar:  PermissaoItem[] = [];
    for (const [k, flag] of Object.entries(pp)) {
      const [modulo, acao] = k.split(":");
      if (flag) conceder.push({ modulo, acao }); else revogar.push({ modulo, acao });
    }
    try {
      const novo = await permissoesApi.salvarPerfilCustomizado(chave, { conceder, revogar });
      setPermissoes((p) => ({ ...p, [chave]: novo }));
      setPending((p) => { const n = { ...p }; delete n[chave]; return n; });
      const nome = perfis.find((p) => p.chave === chave)?.nome ?? chave;
      toast.success(`Permissões do perfil "${nome}" salvas.`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Erro ao salvar permissões.");
    } finally {
      setSalvandoPerm(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/permissoes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1351B4]" />
            Perfis Customizados
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Crie perfis com permissões específicas. Pode partir do zero ou herdar de um perfil existente.
          </p>
        </div>
        <Button onClick={abrirCriar} className="bg-[#1351B4] hover:bg-[#0c3b8d] gap-1.5">
          <Plus className="h-4 w-4" />Novo Perfil
        </Button>
      </div>

      {/* Cards informativos */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 rounded-lg bg-purple-50 border border-purple-200 px-4 py-3 text-xs text-purple-800">
          <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-purple-500" />
          <div>
            <p className="font-semibold mb-0.5">Do zero</p>
            <p>Você define todas as permissões livremente. Ideal para perfis sem análogo nos padrões: Supervisor, Secretário, Sub-prefeito, etc.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-xs text-blue-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Com herança</p>
            <p>Parte de um perfil existente e expande ou restringe. Ideal para variações conhecidas: Cadastrador Sênior, Validador Externo, etc.</p>
          </div>
        </div>
      </div>

      {erro && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{erro}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Carregando...
        </div>
      ) : perfis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Shield className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nenhum perfil customizado criado ainda.</p>
          <Button variant="outline" size="sm" onClick={abrirCriar} className="gap-1.5">
            <Plus className="h-4 w-4" />Criar primeiro perfil
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {perfis.map((p) => {
            const isExpanded    = expanded.has(p.id);
            const chave         = p.chave;
            const perfilPending = pending[chave] ?? {};
            const temMudancas   = Object.keys(perfilPending).length > 0;
            const isSalvando    = salvandoPerm === chave;
            const isAcao        = acaoLoading === p.id;
            // Permissões carregadas quando chave já está no Set E no mapa de permissões
            const permCarregadas = carregados.has(chave) && chave in permissoes;

            return (
              <div key={p.id} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => toggleExpand(p)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-gray-400" />
                      : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{p.nome}</span>
                        <BaseLabel perfil={p} />
                        {!p.ativo && (
                          <Badge className="text-xs bg-red-50 text-red-500 border-red-200">Inativo</Badge>
                        )}
                        {temMudancas && (
                          <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                            {Object.keys(perfilPending).length} alteração(ões)
                          </Badge>
                        )}
                      </div>
                      {p.descricao && (
                        <p className="text-xs text-gray-500 mt-0.5">{p.descricao}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {isExpanded && permCarregadas && (
                      <>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                          onClick={() => handleSelecionarTudo(chave, true)} disabled={isSalvando}>
                          <CheckSquare className="h-3.5 w-3.5" />Todas
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1"
                          onClick={() => handleSelecionarTudo(chave, false)} disabled={isSalvando}>
                          <Square className="h-3.5 w-3.5" />Nenhuma
                        </Button>
                        {temMudancas && (
                          <>
                            <div className="w-px h-5 bg-gray-200 mx-1" />
                            <Button variant="outline" size="sm" className="h-7 text-xs"
                              onClick={() => setPending((prev) => { const n = { ...prev }; delete n[chave]; return n; })}
                              disabled={isSalvando}>
                              Descartar
                            </Button>
                            <Button size="sm" className="h-7 text-xs bg-[#1351B4] hover:bg-[#0c3b8d]"
                              onClick={() => handleSalvarPermissoes(chave)} disabled={isSalvando}>
                              {isSalvando
                                ? <><RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />Salvando...</>
                                : <><Save className="mr-1.5 h-3 w-3" />Salvar</>}
                            </Button>
                          </>
                        )}
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                      </>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-[#1351B4]"
                      title="Editar" onClick={() => abrirEditar(p)} disabled={isAcao}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm"
                      className={`h-7 w-7 p-0 text-gray-400 ${p.ativo ? "hover:text-yellow-600" : "hover:text-green-600"}`}
                      title={p.ativo ? "Desativar" : "Ativar"}
                      onClick={() => handleToggleAtivo(p)} disabled={isAcao}>
                      {p.ativo ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                      title="Excluir" onClick={() => setExcluirConf(p)} disabled={isAcao}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Banner de tipo */}
                {isExpanded && p.perfilBase && (
                  <div className="border-t border-blue-100 bg-blue-50/50 px-5 py-2 flex items-center gap-2 text-xs text-blue-700">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Herda as verificações estruturais de <strong>{PERFIS_BASE.find((b) => b.value === p.perfilBase)?.label}</strong>.
                      As permissões de módulo abaixo complementam essa herança.
                    </span>
                  </div>
                )}
                {isExpanded && !p.perfilBase && (
                  <div className="border-t border-purple-100 bg-purple-50/50 px-5 py-2 flex items-center gap-2 text-xs text-purple-700">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Perfil <strong>do zero</strong> — todas as permissões são definidas exclusivamente pela matriz abaixo.
                    </span>
                  </div>
                )}

                {/* Matriz de permissões */}
                {isExpanded && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    {!permCarregadas ? (
                      // Loading real — apenas enquanto a requisição está em voo
                      <div className="flex items-center gap-2 px-5 py-5 text-sm text-gray-400">
                        <RefreshCw className="h-4 w-4 animate-spin" />Carregando permissões...
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-5 py-2.5 font-medium text-gray-600 w-64">Módulo</th>
                            {ACOES.map((a) => (
                              <th key={a.id} className="text-center px-3 py-2.5 font-medium text-gray-600">{a.nome}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {MODULOS_IDS.map((modulo, idx) => {
                            const mmeta = MODULOS_META[modulo];
                            return (
                              <tr key={modulo}
                                className={[
                                  "border-b border-gray-50 transition-colors hover:bg-gray-50/50",
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/30",
                                ].join(" ")}>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-1.5">
                                    {mmeta?.critical && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
                                    <div>
                                      <p className="font-medium text-gray-800 text-sm">{mmeta?.nome ?? modulo}</p>
                                      <p className="text-xs text-gray-400">{mmeta?.descricao}</p>
                                    </div>
                                  </div>
                                </td>
                                {ACOES.map((acao) => {
                                  const efetiva = getEfetiva(chave, modulo, acao.id);
                                  const k = `${modulo}:${acao.id}`;
                                  const pendente = k in (pending[chave] ?? {}) ? (pending[chave] ?? {})[k] : null;
                                  return (
                                    <td key={acao.id} className="px-3 py-3 text-center">
                                      <button
                                        onClick={() => handleCelula(chave, modulo, acao.id, !efetiva)}
                                        title={efetiva ? "Clique para revogar" : "Clique para conceder"}
                                        className={[
                                          "inline-flex h-7 w-7 items-center justify-center rounded-full transition-all border-2 text-xs font-bold",
                                          pendente !== null ? "ring-2 ring-amber-400 ring-offset-1" : "",
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
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog — Criar/Editar */}
      <Dialog open={form.aberto} onOpenChange={(open) => !open && fecharForm()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {form.modo === "criar" ? "Novo Perfil Customizado" : "Editar Perfil"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pf-nome">Nome do perfil *</Label>
              <Input id="pf-nome" placeholder="Ex: Supervisor, Secretário, Cadastrador Sênior..."
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-desc">Descrição</Label>
              <Textarea id="pf-desc" placeholder="Descreva brevemente as responsabilidades deste perfil..."
                rows={2}
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Origem das permissões *</Label>
              <Select
                value={form.perfilBase}
                onValueChange={(v) => setForm((f) => ({ ...f, perfilBase: v as PerfilUsuario | typeof DO_ZERO }))}
                disabled={form.modo === "editar"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {PERFIS_BASE.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      <div className="py-0.5">
                        <p className={`font-medium ${b.destaque ? "text-purple-700" : ""}`}>{b.label}</p>
                        <p className="text-xs text-gray-500">{b.descricao}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.modo === "editar" && (
                <p className="text-xs text-gray-500">A origem não pode ser alterada após a criação.</p>
              )}
              {form.perfilBase === DO_ZERO && form.modo === "criar" && (
                <div className="rounded-md bg-purple-50 border border-purple-200 px-3 py-2 text-xs text-purple-700">
                  Nenhuma permissão estará ativa por padrão. A matriz de permissões abrirá automaticamente após criar.
                </div>
              )}
              {form.perfilBase && form.perfilBase !== DO_ZERO && form.modo === "criar" && (
                <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
                  Herda as verificações estruturais de <strong>
                    {PERFIS_BASE.find((b) => b.value === form.perfilBase)?.label}
                  </strong>. Permissões de módulo configuráveis livremente após criar.
                </div>
              )}
            </div>
            {formErro && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />{formErro}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fecharForm} disabled={salvando}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={salvando} className="bg-[#1351B4] hover:bg-[#0c3b8d]">
              {salvando ? "Criando..." : form.modo === "criar" ? "Criar Perfil" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!excluirConf} onOpenChange={(open) => !open && setExcluirConf(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />Excluir Perfil
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja excluir o perfil <strong>"{excluirConf?.nome}"</strong>?
              <br /><br />
              Usuários com este perfil ficarão sem perfil atribuído até que o administrador redefina.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700"
              onClick={() => excluirConf && handleExcluir(excluirConf)}>
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}