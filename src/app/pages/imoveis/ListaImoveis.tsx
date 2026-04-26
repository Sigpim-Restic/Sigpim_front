import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus, Search, Filter, MoreVertical, Edit, Eye, Save,
  MapPin, Download, RefreshCw, AlertCircle, Trash2, Loader2,
  FileText, RotateCcw,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { tiposImovelApi, type TipoImovelResponse } from "../../api/tipos-imovel-alertas";
import { imoveisApi, type ImovelResponse } from "../../api/imoveis";
import { relatoriosApi } from "../../api/relatorios";
import { usePermissoes } from "../../hooks/usePermissoes";

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  VALIDADO:     { label: "Validado",     cls: "bg-green-100 text-green-800" },
  PRE_CADASTRO: { label: "Pré-cadastro", cls: "bg-yellow-100 text-yellow-800" },
  GESTAO_PLENA: { label: "Gestão Plena", cls: "bg-blue-100 text-blue-800" },
};

const TIPO_LABEL: Record<string, string> = {
  PROPRIO: "Próprio",
  LOCADO:  "Locado",
  INCERTO: "Incerto",
};

// ── helpers de exportação ──────────────────────────────────────────────────────

function exportarCSV(imoveis: ImovelResponse[]) {
  const cabecalho = [
    "Código SIGPIM", "Nome / Referência", "Tipologia", "Tipo",
    "Status", "Estado Conservação", "Área Terreno (m²)", "Área Construída (m²)",
    "Nº Pavimentos", "Ano Construção", "Inscrição Imobiliária",
    "Matrícula", "Cartório", "Cadastrado Em",
  ];
  const linhas = imoveis.map((im) => [
    im.codigoSigpim ?? "",
    im.nomeReferencia ?? "",
    im.tipologia ?? "",
    TIPO_LABEL[im.tipoImovel] ?? im.tipoImovel ?? "",
    STATUS_CONFIG[im.statusCadastro]?.label ?? im.statusCadastro ?? "",
    im.estadoConservacaoAtual ?? "",
    im.areaTerrenoM2 ?? "",
    im.areaConstruidaM2 ?? "",
    im.numeroPavimentos ?? "",
    im.anoConstrucao ?? "",
    im.inscricaoImobiliaria ?? "",
    im.matriculaRegistro ?? "",
    im.cartorio ?? "",
    im.criadoEm ? new Date(im.criadoEm).toLocaleDateString("pt-BR") : "",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`));

  const csv = [cabecalho.map((c) => `"${c}"`).join(";"), ...linhas.map((l) => l.join(";"))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `imoveis-sigpim-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Tipos internos ─────────────────────────────────────────────────────────────

interface ConfirmacaoState {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  variante: "default" | "destrutivo";
  onConfirmar: () => Promise<void>;
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ListaImoveis() {
  const navigate = useNavigate();
  const perm = usePermissoes();

  const [imoveis,       setImoveis]       = useState<ImovelResponse[]>([]);
  const [deletados,     setDeletados]     = useState<ImovelResponse[]>([]);
  const [tiposImovel,   setTiposImovel]   = useState<TipoImovelResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState<string | null>(null);
  const [totalElements, setTotal]         = useState(0);
  const [page,          setPage]          = useState(0);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setStatus]        = useState("todos");
  const [filterTipo,    setTipo]          = useState("todos");
  const [acaoLoading,   setAcaoLoading]   = useState<number | null>(null);

  const [pdfLoadingId,  setPdfLoadingId]  = useState<number | null>(null);
  const [erroPdf,       setErroPdf]       = useState<string | null>(null);

  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState>({
    aberto: false, titulo: "", mensagem: "",
    variante: "default", onConfirmar: async () => {},
  });

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const res = await imoveisApi.listar(page, 20);
      setImoveis(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar imóveis.");
    } finally { setLoading(false); }

    // Lixeira é carregada separadamente — perfis sem canDeleteImovel
    // recebem 403 neste endpoint e isso não deve afetar a listagem principal
    if (perm.canDeleteImovel) {
      try {
        const excluidos = await imoveisApi.listarDeletados();
        setDeletados(excluidos);
      } catch {
        setDeletados([]);
      }
    }
  }, [page, perm.canDeleteImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  // Carrega tipos uma única vez ao montar — reflete tipos criados pelo admin nos catálogos
  useEffect(() => {
    tiposImovelApi.listarAtivos().then(setTiposImovel).catch(() => {});
  }, []);

  const executarAcao = async (idImovel: number, acao: () => Promise<void>) => {
    setAcaoLoading(idImovel);
    try { await acao(); carregar(); }
    catch (e: unknown) { setErro((e as Error).message ?? "Erro ao executar ação."); }
    finally { setAcaoLoading(null); }
  };

  const confirmar = (cfg: Omit<ConfirmacaoState, "aberto">) =>
    setConfirmacao({ ...cfg, aberto: true });

  const fecharConfirmacao = () =>
    setConfirmacao((c) => ({ ...c, aberto: false }));

  // ── Ações ────────────────────────────────────────────────────────────────────

  const handleExcluir = (im: ImovelResponse) => {
    confirmar({
      titulo:   "Excluir imóvel",
      mensagem: `Tem certeza que deseja excluir "${im.codigoSigpim}${im.nomeReferencia ? ` — ${im.nomeReferencia}` : ""}"? O imóvel será movido para a lixeira e poderá ser restaurado depois.`,
      variante: "destrutivo",
      onConfirmar: () => executarAcao(im.id, () => imoveisApi.deletar(im.id)),
    });
  };

  const handleRestaurar = (im: ImovelResponse) => {
    confirmar({
      titulo:   "Restaurar imóvel",
      mensagem: `Deseja restaurar "${im.codigoSigpim}${im.nomeReferencia ? ` — ${im.nomeReferencia}` : ""}"? O imóvel voltará com status Pré-cadastro.`,
      variante: "default",
      onConfirmar: () => executarAcao(im.id, () => imoveisApi.restaurar(im.id)),
    });
  };

  const handleExcluirPermanente = (im: ImovelResponse) => {
    confirmar({
      titulo:   "⚠️ Exclusão permanente",
      mensagem: `Esta ação é IRREVERSÍVEL. O imóvel "${im.codigoSigpim}${im.nomeReferencia ? ` — ${im.nomeReferencia}` : ""}" será removido definitivamente do banco de dados. O histórico de auditoria será preservado. Deseja continuar?`,
      variante: "destrutivo",
      onConfirmar: () => executarAcao(im.id, () => imoveisApi.excluirPermanentemente(im.id)),
    });
  };

  const handleExportarFicha = async (im: ImovelResponse) => {
    setPdfLoadingId(im.id); setErroPdf(null);
    try {
      const { blob, nomeArquivo } = await relatoriosApi.gerarFichaPdf(im.id);
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href = url; a.download = nomeArquivo; a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setErroPdf(`Erro ao gerar PDF de ${im.codigoSigpim}: ${e instanceof Error ? e.message : "erro desconhecido"}`);
    } finally { setPdfLoadingId(null); }
  };

  const filtrados = imoveis.filter((im) => {
    const txt = search.toLowerCase();
    const matchSearch = !search ||
      [im.codigoSigpim, im.nomeReferencia ?? "", im.tipologia ?? ""]
        .join(" ").toLowerCase().includes(txt);
    const matchStatus = filterStatus === "todos" || im.statusCadastro === filterStatus;
    const matchTipo   = filterTipo === "todos" || String(im.idTipoImovel) === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  return (
    <div className="space-y-5">

      {/* Modal de confirmação unificado */}
      <Dialog open={confirmacao.aberto} onOpenChange={(v) => !v && fecharConfirmacao()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{confirmacao.titulo}</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">{confirmacao.mensagem}</p>
          <DialogFooter>
            <Button variant="outline" onClick={fecharConfirmacao}>Cancelar</Button>
            <Button
              variant={confirmacao.variante === "destrutivo" ? "destructive" : "default"}
              className={confirmacao.variante === "default" ? "bg-[#1351B4] hover:bg-[#0c3b8d]" : ""}
              onClick={async () => { fecharConfirmacao(); await confirmacao.onConfirmar(); }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Gerencie o cadastro dos imóveis públicos municipais
          {!loading && <span className="ml-2 text-gray-400">({totalElements} no total)</span>}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {perm.canCreateImovel && (
            <Link to="/dashboard/imoveis/novo/etapa-1">
              <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Plus className="mr-2 h-4 w-4" />Novo Imóvel
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Banner rascunho */}
      {(() => {
        try {
          const r = localStorage.getItem("sigpim_rascunho_imovel");
          if (!r) return null;
          const d = JSON.parse(r);
          const nome = d?.etapa1?.nomeReferencia;
          return (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <Save className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="flex-1 text-sm text-amber-800">
                Você tem um rascunho salvo{nome ? `: "${nome}"` : ""}. Deseja continuar de onde parou?
              </p>
              <div className="flex gap-2">
                <Link to="/dashboard/imoveis/novo/etapa-1">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">Continuar Rascunho</Button>
                </Link>
                <Button size="sm" variant="ghost" className="text-amber-700"
                  onClick={() => { localStorage.removeItem("sigpim_rascunho_imovel"); window.location.reload(); }}>
                  Descartar
                </Button>
              </div>
            </div>
          );
        } catch { return null; }
      })()}

      {/* Erros */}
      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1"><p className="font-medium">Falha ao carregar imóveis</p><p className="mt-1">{erro}</p></div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>Tentar novamente</Button>
        </div>
      )}
      {erroPdf && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erroPdf}</div>
          <button onClick={() => setErroPdf(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="ativos">
        <TabsList>
          <TabsTrigger value="ativos">
            Imóveis
            {!loading && imoveis.length > 0 && (
              <span className="ml-2 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium">
                {totalElements}
              </span>
            )}
          </TabsTrigger>
          {perm.canDeleteImovel && (
            <TabsTrigger value="lixeira">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Lixeira
              {deletados.length > 0 && (
                <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                  {deletados.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── ABA: ATIVOS ─────────────────────────────────────────────────────── */}
        <TabsContent value="ativos" className="space-y-4 mt-4">
          {/* Filtros */}
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por código, nome, tipologia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="VALIDADO">Validado</SelectItem>
                <SelectItem value="PRE_CADASTRO">Pré-cadastro</SelectItem>
                <SelectItem value="GESTAO_PLENA">Gestão Plena</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {tiposImovel.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => exportarCSV(filtrados)}
              disabled={filtrados.length === 0 || loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar {filtrados.length > 0 && !loading ? `(${filtrados.length})` : ""}
            </Button>
          </div>

          {/* Tabela de ativos */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">Código</TableHead>
                    <TableHead className="text-xs">Nome / Tipologia</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Conservação</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-sm text-gray-400">
                        <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />Carregando imóveis...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && !erro && filtrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-sm text-gray-400">
                        {search || filterStatus !== "todos" || filterTipo !== "todos"
                          ? "Nenhum imóvel encontrado com esses filtros."
                          : 'Nenhum imóvel cadastrado. Clique em "Novo Imóvel" para começar.'}
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && filtrados.map((im) => {
                    const st = STATUS_CONFIG[im.statusCadastro] ?? STATUS_CONFIG.PRE_CADASTRO;
                    const gerandoPdf = pdfLoadingId === im.id;
                    const emAcao = acaoLoading === im.id;
                    return (
                      <TableRow key={im.id} className="hover:bg-gray-50/80">
                        <TableCell>
                          <Link
                            to={`/dashboard/imoveis/${im.id}`}
                            className="font-mono text-xs font-semibold text-[#1351B4] hover:underline"
                          >
                            {im.codigoSigpim}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-gray-900">{im.nomeReferencia ?? "—"}</p>
                          <p className="text-xs text-gray-500">{im.tipologia ?? "—"}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs ${
                            im.tipoImovel === "PROPRIO" ? "bg-blue-50 text-blue-700" :
                            im.tipoImovel === "LOCADO"  ? "bg-purple-50 text-purple-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {TIPO_LABEL[im.tipoImovel] ?? im.tipoImovel ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {im.estadoConservacaoAtual ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${st.cls}`} variant="secondary">{st.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={gerandoPdf || emAcao}>
                                {gerandoPdf || emAcao
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <MoreVertical className="h-4 w-4" />
                                }
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/dashboard/imoveis/${im.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />Visualizar
                              </DropdownMenuItem>
                              {perm.canUpdateImovel && (
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/imoveis/${im.id}/editar`)}>
                                  <Edit className="mr-2 h-4 w-4" />Editar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => navigate(`/dashboard/mapa?imovel=${im.id}`)}>
                                <MapPin className="mr-2 h-4 w-4" />Ver no Mapa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleExportarFicha(im)}>
                                <FileText className="mr-2 h-4 w-4" />Exportar Ficha PDF
                              </DropdownMenuItem>
                              {perm.canDeleteImovel && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-700"
                                    onClick={() => handleExcluir(im)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />Excluir imóvel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
              <p className="text-xs text-gray-500">
                {loading ? "Carregando..." : `${filtrados.length} imóvel(is) • página ${page + 1}`}
              </p>
              {totalElements > 20 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0 || loading}
                    onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                  <Button variant="outline" size="sm" disabled={(page + 1) * 20 >= totalElements || loading}
                    onClick={() => setPage((p) => p + 1)}>Próxima</Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── ABA: LIXEIRA ────────────────────────────────────────────────────── */}
        <TabsContent value="lixeira" className="space-y-4 mt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Imóveis removidos logicamente (soft delete). Você pode{" "}
            <strong>restaurar</strong> o imóvel (ele voltará como Pré-cadastro) ou{" "}
            <strong>excluir permanentemente</strong> do banco de dados. A exclusão permanente é
            irreversível — somente Administradores do Sistema podem realizá-la.
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
            </div>
          ) : deletados.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
              <Trash2 className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="font-medium">Nenhum imóvel na lixeira.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">Código</TableHead>
                      <TableHead className="text-xs">Nome / Tipologia</TableHead>
                      <TableHead className="text-xs">Status anterior</TableHead>
                      <TableHead className="text-xs">Excluído em</TableHead>
                      <TableHead className="text-right text-xs">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletados.map((im) => {
                      const emAcao = acaoLoading === im.id;
                      return (
                        <TableRow key={im.id} className="hover:bg-red-50/40 opacity-75">
                          <TableCell>
                            <span className="font-mono text-xs font-semibold text-gray-400 line-through">
                              {im.codigoSigpim}
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-gray-400 line-through">
                              {im.nomeReferencia ?? "—"}
                            </p>
                            <p className="text-xs text-gray-400">{im.tipologia ?? "—"}</p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs opacity-60 ${STATUS_CONFIG[im.statusCadastro]?.cls ?? ""}`}
                              variant="secondary"
                            >
                              {STATUS_CONFIG[im.statusCadastro]?.label ?? im.statusCadastro}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-400">
                            {im.atualizadoEm
                              ? new Date(im.atualizadoEm).toLocaleDateString("pt-BR")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {perm.canDeleteImovel && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-700 border-green-300 hover:bg-green-50 gap-1.5"
                                  disabled={emAcao}
                                  onClick={() => handleRestaurar(im)}
                                  title="Restaurar imóvel"
                                >
                                  {emAcao
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <RotateCcw className="h-3.5 w-3.5" />
                                  }
                                  Restaurar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50 gap-1.5"
                                  disabled={emAcao}
                                  onClick={() => handleExcluirPermanente(im)}
                                  title="Excluir permanentemente do banco"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Excluir
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}