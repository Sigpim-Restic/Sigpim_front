import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle, RefreshCw, AlertCircle, Building2,
  ArrowRight, CheckCircle2, Clock, Search, Inbox,
  Plus, Loader2, Trash2, X, Calendar, User, Users,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  pendenciasApi,
  type PendenciaResponse, type PendenciaRequest,
  type StatusPendencia, type PrioridadePendencia,
  PRIORIDADE_CFG,
} from "../../api/pendencias";
import { usePermissoes } from "../../hooks/usePermissoes";
import { usuariosApi } from "../../api/usuarios";
import { orgaosApi } from "../../api/orgaos";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatarPrazo(iso: string | null, vencida: boolean): React.ReactNode {
  if (!iso) return <span className="text-gray-400">—</span>;
  const d = new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
  if (vencida) {
    return (
      <span className="flex items-center gap-1 text-red-600 font-medium text-xs">
        <AlertTriangle className="h-3 w-3" />{d} (vencida)
      </span>
    );
  }
  return <span className="text-xs text-gray-600">{d}</span>;
}

function formatarDestino(p: PendenciaResponse): React.ReactNode {
  if (p.nomeUsuarioDestino) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-700">
        <User className="h-3 w-3 text-gray-400 shrink-0" />{p.nomeUsuarioDestino}
      </span>
    );
  }
  if (p.nomeOrgaoDestino) {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-700">
        <Users className="h-3 w-3 text-gray-400 shrink-0" />{p.nomeOrgaoDestino}
      </span>
    );
  }
  return <span className="text-gray-400 text-xs">—</span>;
}

// ── Tabela reutilizável ───────────────────────────────────────────────────────

interface TabelaProps {
  pendencias: PendenciaResponse[];
  loading: boolean;
  podeResolver: boolean;
  podeExcluir: boolean;
  onResolver: (p: PendenciaResponse) => void;
  onExcluir:  (p: PendenciaResponse) => void;
  acaoId: number | null;
  emptyMsg: string;
}

function TabelaPendencias({ pendencias, loading, podeResolver, podeExcluir, onResolver, onExcluir, acaoId, emptyMsg }: TabelaProps) {
  const navigate = useNavigate();

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );

  if (pendencias.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center shadow-sm">
      <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">{emptyMsg}</p>
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">Prioridade</TableHead>
              <TableHead className="text-xs">Título / Descrição</TableHead>
              <TableHead className="text-xs">Imóvel</TableHead>
              <TableHead className="text-xs">Destinatário</TableHead>
              <TableHead className="text-xs">Prazo</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-right text-xs">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendencias.map((p) => {
              const prio = PRIORIDADE_CFG[p.prioridade];
              const emAcao = acaoId === p.id;
              return (
                <TableRow key={p.id} className={`transition-colors ${
                  p.vencida ? "bg-red-50/40 hover:bg-red-50"
                  : p.status === "ABERTA" ? "hover:bg-gray-50/80"
                  : "opacity-60 hover:bg-gray-50/60"
                }`}>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${prio.cls}`}>{prio.label}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className={`text-sm font-medium ${p.status === "RESOLVIDA" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {p.titulo}
                    </p>
                    {p.descricao && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.descricao}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Criado por: {p.nomeCriador ?? "—"}</p>
                  </TableCell>
                  <TableCell>
                    {p.idImovel ? (
                      <button onClick={() => navigate(`/dashboard/imoveis/${p.idImovel}`)}
                        className="flex items-center gap-1.5 text-left hover:underline">
                        <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <div>
                          <p className="font-mono text-xs font-semibold text-[#1351B4]">{p.codigoSigpim ?? "—"}</p>
                          {p.nomeImovel && <p className="text-xs text-gray-500 max-w-[120px] truncate">{p.nomeImovel}</p>}
                        </div>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Genérica</span>
                    )}
                  </TableCell>
                  <TableCell>{formatarDestino(p)}</TableCell>
                  <TableCell>{formatarPrazo(p.prazo, p.vencida)}</TableCell>
                  <TableCell>
                    {p.status === "RESOLVIDA" ? (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />Resolvida
                        </span>
                        {p.nomeResolvedor && <p className="text-xs text-gray-400">por {p.nomeResolvedor}</p>}
                        {/* Ciência formal */}
                        {p.cienteEm ? (
                          <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Ciente: {new Date(p.cienteEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                          <Clock className="h-3.5 w-3.5" />Aberta
                        </span>
                        {/* Ciência formal — mostra se já visualizou */}
                        {p.cienteEm ? (
                          <p className="text-xs text-blue-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Ciente desde {new Date(p.cienteEm).toLocaleDateString("pt-BR")}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />Aguardando ciência
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {podeResolver && p.status === "ABERTA" && (
                        <Button variant="outline" size="sm"
                          className="text-xs text-green-700 border-green-300 hover:bg-green-50 gap-1"
                          disabled={emAcao} onClick={() => onResolver(p)}>
                          {emAcao ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Resolver
                        </Button>
                      )}
                      {p.idImovel && (
                        <Button variant="ghost" size="sm"
                          className="text-xs text-[#1351B4] hover:bg-blue-50"
                          onClick={() => navigate(`/dashboard/imoveis/${p.idImovel}`)}>
                          Ver imóvel<ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button variant="ghost" size="sm"
                          className="text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                          disabled={emAcao} onClick={() => onExcluir(p)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function Pendencias() {
  const perm     = usePermissoes();
  const [minhas,        setMinhas]        = useState<PendenciaResponse[]>([]);
  const [todas,         setTodas]         = useState<PendenciaResponse[]>([]);
  const [loadingMinhas, setLoadingMinhas] = useState(true);
  const [loadingTodas,  setLoadingTodas]  = useState(false);
  const [erro,          setErro]          = useState<string | null>(null);
  const [filtroStatus,  setFiltroStatus]  = useState<StatusPendencia | "">("");
  const [search,        setSearch]        = useState("");
  const [acaoId,        setAcaoId]        = useState<number | null>(null);

  // Modal criação
  const [modalCriar,  setModalCriar]  = useState(false);
  const [salvando,    setSalvando]    = useState(false);
  const [erroCriar,   setErroCriar]   = useState<string | null>(null);
  const [usuarios,    setUsuarios]    = useState<{ id: number; nomeCompleto: string }[]>([]);
  const [orgaos,      setOrgaos]      = useState<{ id: number; sigla: string; nome: string }[]>([]);
  const [tipoDestino, setTipoDestino] = useState<"usuario" | "orgao">("orgao");
  const [form, setForm] = useState<Partial<PendenciaRequest>>({ prioridade: "NORMAL" });

  // Modal resolução
  const [modalResolver,  setModalResolver]  = useState<PendenciaResponse | null>(null);
  const [obsResolucao,   setObsResolucao]   = useState("");

  const carregarMinhas = useCallback(async () => {
    setLoadingMinhas(true); setErro(null);
    try {
      const res = await pendenciasApi.listarMinhas(filtroStatus || undefined);
      setMinhas(res.content);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar pendências.");
    } finally { setLoadingMinhas(false); }
  }, [filtroStatus]);

  const carregarTodas = useCallback(async () => {
    if (!perm.isAdmin) return;
    setLoadingTodas(true);
    try {
      const res = await pendenciasApi.listarTodas(filtroStatus || undefined);
      setTodas(res.content);
    } catch { /* silencia */ }
    finally { setLoadingTodas(false); }
  }, [filtroStatus, perm.isAdmin]);

  useEffect(() => { carregarMinhas(); }, [carregarMinhas]);
  useEffect(() => { carregarTodas();  }, [carregarTodas]);

  useEffect(() => {
    if (!modalCriar) return;
    usuariosApi.listar().then(setUsuarios).catch(() => {});
    orgaosApi.listarAtivos().then(setOrgaos).catch(() => {});
  }, [modalCriar]);

  const handleCriar = async () => {
    setErroCriar(null);
    if (!form.titulo?.trim()) { setErroCriar("Título é obrigatório."); return; }
    if (!form.idUsuarioDestino && !form.idOrgaoDestino) {
      setErroCriar("Selecione um destinatário."); return;
    }
    setSalvando(true);
    try {
      await pendenciasApi.criar(form as PendenciaRequest);
      setModalCriar(false);
      setForm({ prioridade: "NORMAL" });
      carregarMinhas(); carregarTodas();
    } catch (e: unknown) {
      setErroCriar(e instanceof Error ? e.message : "Erro ao criar.");
    } finally { setSalvando(false); }
  };

  const handleResolver = async () => {
    if (!modalResolver) return;
    setAcaoId(modalResolver.id);
    try {
      await pendenciasApi.resolver(modalResolver.id, { observacao: obsResolucao || undefined });
      setModalResolver(null); setObsResolucao("");
      carregarMinhas(); carregarTodas();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao resolver.");
    } finally { setAcaoId(null); }
  };

  // Registra ciência formal ao abrir o modal de resolução —
  // é o momento em que o destinatário confirma que visualizou a pendência
  const handleAbrirResolver = (p: PendenciaResponse) => {
    setModalResolver(p);
    setObsResolucao("");
    // Dispara em background — não bloqueia a UI
    pendenciasApi.registrarCiencia(p.id)
      .then((atualizada) => {
        // Atualiza o item na lista para mostrar "Ciente desde..." imediatamente
        setMinhas((prev) => prev.map((item) => item.id === atualizada.id ? atualizada : item));
        setTodas((prev)  => prev.map((item) => item.id === atualizada.id ? atualizada : item));
      })
      .catch(() => { /* silencia — ciência é best-effort */ });
  };

  const handleExcluir = async (p: PendenciaResponse) => {
    if (!confirm(`Excluir a pendência "${p.titulo}"?`)) return;
    setAcaoId(p.id);
    try {
      await pendenciasApi.excluir(p.id);
      carregarMinhas(); carregarTodas();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally { setAcaoId(null); }
  };

  const filtrar = (lista: PendenciaResponse[]) => {
    if (!search) return lista;
    const txt = search.toLowerCase();
    return lista.filter((p) =>
      p.titulo.toLowerCase().includes(txt) ||
      (p.codigoSigpim ?? "").toLowerCase().includes(txt) ||
      (p.nomeImovel   ?? "").toLowerCase().includes(txt) ||
      (p.nomeUsuarioDestino ?? "").toLowerCase().includes(txt) ||
      (p.nomeOrgaoDestino   ?? "").toLowerCase().includes(txt)
    );
  };

  const totalAbertasMinhas = minhas.filter((p) => p.status === "ABERTA").length;

  return (
    <div className="space-y-5">

      {/* Modal de resolução */}
      <Dialog open={!!modalResolver} onOpenChange={(v) => { if (!v) { setModalResolver(null); setObsResolucao(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />Resolver Pendência
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-gray-800">{modalResolver?.titulo}</p>
            <div className="space-y-1.5">
              <Label>Observação <span className="text-gray-400 font-normal text-xs">(opcional)</span></Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                rows={3} maxLength={2000}
                placeholder="Descreva como a pendência foi resolvida..."
                value={obsResolucao}
                onChange={(e) => setObsResolucao(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalResolver(null)}>Cancelar</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleResolver}>
              <CheckCircle2 className="mr-2 h-4 w-4" />Confirmar Resolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de criação */}
      <Dialog open={modalCriar} onOpenChange={(v) => { if (!v) { setModalCriar(false); setErroCriar(null); setForm({ prioridade: "NORMAL" }); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#1351B4]" />Nova Pendência
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {erroCriar && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erroCriar}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Título <span className="text-red-500">*</span></Label>
              <Input placeholder="Ex: Cadastrar coordenadas do imóvel" maxLength={200}
                value={form.titulo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={3} maxLength={4000}
                placeholder="Detalhe o que precisa ser feito, por que e quais informações são necessárias..."
                value={form.descricao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                ID do Imóvel <span className="text-gray-400 font-normal text-xs">(opcional — deixe em branco para pendência genérica)</span>
              </Label>
              <Input type="number" min={1} placeholder="ID numérico do imóvel"
                value={form.idImovel ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, idImovel: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <div className="space-y-2">
              <Label>Destinatário <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                {(["orgao", "usuario"] as const).map((tipo) => (
                  <button key={tipo} type="button"
                    onClick={() => {
                      setTipoDestino(tipo);
                      setForm((f) => tipo === "orgao"
                        ? { ...f, idUsuarioDestino: undefined }
                        : { ...f, idOrgaoDestino: undefined });
                    }}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      tipoDestino === tipo
                        ? "border-[#1351B4] bg-blue-50 text-[#1351B4]"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tipo === "orgao" ? <><Users className="h-4 w-4" />Órgão inteiro</> : <><User className="h-4 w-4" />Usuário específico</>}
                  </button>
                ))}
              </div>
              {tipoDestino === "orgao" ? (
                <Select value={form.idOrgaoDestino ? String(form.idOrgaoDestino) : ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, idOrgaoDestino: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o órgão" /></SelectTrigger>
                  <SelectContent>
                    {orgaos.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.sigla} – {o.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={form.idUsuarioDestino ? String(form.idUsuarioDestino) : ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, idUsuarioDestino: Number(v) }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o usuário" /></SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.nomeCompleto}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select value={form.prioridade ?? "NORMAL"}
                  onValueChange={(v) => setForm((f) => ({ ...f, prioridade: v as PrioridadePendencia }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="CRITICA">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-gray-400" />Prazo <span className="text-gray-400 font-normal text-xs">(opcional)</span></Label>
                <Input type="date" value={form.prazo ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value || undefined }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCriar(false)} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleCriar} disabled={salvando}>
              {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : <><Plus className="mr-2 h-4 w-4" />Criar Pendência</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Pendências
            {totalAbertasMinhas > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
                {totalAbertasMinhas}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Tarefas e alertas que requerem atenção do seu órgão</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { carregarMinhas(); carregarTodas(); }}>
            <RefreshCw className={`h-4 w-4 ${(loadingMinhas || loadingTodas) ? "animate-spin" : ""}`} />
          </Button>
          {perm.isAdmin && (
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={() => setModalCriar(true)}>
              <Plus className="mr-2 h-4 w-4" />Nova Pendência
            </Button>
          )}
        </div>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <button onClick={() => setErro(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar por título, imóvel, destinatário..."
            value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as StatusPendencia | "")}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            <SelectItem value="ABERTA">Abertas</SelectItem>
            <SelectItem value="RESOLVIDA">Resolvidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="minhas">
        <TabsList>
          <TabsTrigger value="minhas">
            Minhas Pendências
            {totalAbertasMinhas > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                {totalAbertasMinhas}
              </span>
            )}
          </TabsTrigger>
          {perm.isAdmin && (
            <TabsTrigger value="todas">
              Todas (Gestão)
              {todas.filter((p) => p.status === "ABERTA").length > 0 && (
                <span className="ml-2 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                  {todas.filter((p) => p.status === "ABERTA").length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="minhas" className="mt-4">
          <TabelaPendencias
            pendencias={filtrar(minhas)} loading={loadingMinhas}
            podeResolver={true} podeExcluir={perm.isAdmin}
            onResolver={handleAbrirResolver}
            onExcluir={handleExcluir} acaoId={acaoId}
            emptyMsg={filtroStatus || search ? "Nenhuma pendência encontrada com esses filtros." : "Nenhuma pendência no momento. Tudo em dia!"}
          />
        </TabsContent>

        {perm.isAdmin && (
          <TabsContent value="todas" className="mt-4">
            <TabelaPendencias
              pendencias={filtrar(todas)} loading={loadingTodas}
              podeResolver={true} podeExcluir={true}
              onResolver={handleAbrirResolver}
              onExcluir={handleExcluir} acaoId={acaoId}
              emptyMsg="Nenhuma pendência registrada no sistema."
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}