import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus, Search, Filter, MoreVertical, Edit, Eye,
  MapPin, Download, RefreshCw, AlertCircle, Trash2, Loader2, FileText,
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

// ─── helpers de exportação ────────────────────────────────────────────────────

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
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }); // BOM para Excel PT-BR
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `imoveis-sigpim-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ListaImoveis() {
  const navigate = useNavigate();
  const perm = usePermissoes();

  const [imoveis,       setImoveis]       = useState<ImovelResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState<string | null>(null);
  const [totalElements, setTotal]         = useState(0);
  const [page,          setPage]          = useState(0);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setStatus]        = useState("todos");
  const [filterTipo,    setTipo]          = useState("todos");

  // PDF individual
  const [pdfLoadingId,  setPdfLoadingId]  = useState<number | null>(null);
  const [erroPdf,       setErroPdf]       = useState<string | null>(null);

  // Exclusão
  const [confirmando,   setConfirmando]   = useState<ImovelResponse | null>(null);
  const [excluindo,     setExcluindo]     = useState(false);
  const [erroExclusao,  setErroExclusao]  = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const res = await imoveisApi.listar(page, 20);
      setImoveis(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar imóveis.");
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleExcluir = async () => {
    if (!confirmando) return;
    setExcluindo(true); setErroExclusao(null);
    try {
      await imoveisApi.deletar(confirmando.id);
      setConfirmando(null);
      carregar();
    } catch (e: unknown) {
      setErroExclusao(e instanceof Error ? e.message : "Erro ao excluir imóvel.");
    } finally { setExcluindo(false); }
  };

  // "Exportar Ficha" nos 3 pontos → PDF com QR Code
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
    const matchTipo   = filterTipo   === "todos" || im.tipoImovel     === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  return (
    <div className="space-y-5">

      {/* Dialog exclusão */}
      <Dialog open={!!confirmando} onOpenChange={(v) => !v && setConfirmando(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Excluir imóvel</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir o imóvel{" "}
              <span className="font-semibold text-gray-900">
                {confirmando?.codigoSigpim}
                {confirmando?.nomeReferencia ? ` — ${confirmando.nomeReferencia}` : ""}
              </span>?
            </p>
            <p className="text-sm text-red-600">
              Esta ação não pode ser desfeita. Documentos e ocupações vinculados serão mantidos no histórico.
            </p>
            {erroExclusao && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erroExclusao}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(null)} disabled={excluindo}>Cancelar</Button>
            <Button variant="destructive" onClick={handleExcluir} disabled={excluindo}>
              {excluindo ? "Excluindo..." : "Excluir imóvel"}
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

      {/* Erro geral */}
      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1"><p className="font-medium">Falha ao carregar imóveis</p><p className="mt-1">{erro}</p></div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>Tentar novamente</Button>
        </div>
      )}

      {/* Erro PDF */}
      {erroPdf && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erroPdf}</div>
          <button onClick={() => setErroPdf(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Filtros + Exportar */}
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
            <SelectItem value="PROPRIO">Próprio</SelectItem>
            <SelectItem value="LOCADO">Locado</SelectItem>
            <SelectItem value="INCERTO">Incerto</SelectItem>
          </SelectContent>
        </Select>

        {/* Botão Exportar — exporta CSV da listagem atual com filtros aplicados */}
        <Button
          variant="outline"
          onClick={() => exportarCSV(filtrados)}
          disabled={filtrados.length === 0 || loading}
          title={`Exportar ${filtrados.length} imóvel(is) como CSV`}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar {filtrados.length > 0 && !loading ? `(${filtrados.length})` : ""}
        </Button>
      </div>

      {/* Tabela */}
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
                          <Button variant="ghost" size="icon" disabled={gerandoPdf}>
                            {gerandoPdf
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
                          {/* Exportar Ficha → PDF institucional com QR Code */}
                          <DropdownMenuItem onClick={() => handleExportarFicha(im)}>
                            <FileText className="mr-2 h-4 w-4" />Exportar Ficha PDF
                          </DropdownMenuItem>
                          {perm.canDeleteImovel && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-700"
                                onClick={() => { setErroExclusao(null); setConfirmando(im); }}
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

        {/* Paginação */}
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
    </div>
  );
}