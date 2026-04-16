import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { api } from "../../api/client";

interface LogAuditoria {
  id: number;
  tabela: string;
  idRegistro: number;
  acao: string;
  idUsuario: number | null;
  nomeUsuario: string | null;
  perfilUsuario: string | null;
  ipOrigem: string | null;
  realizadoEm: string;
  descricao: string | null;
  dadosAnteriores: Record<string, unknown> | null;
  dadosNovos: Record<string, unknown> | null;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const acaoConfig: Record<string, string> = {
  CRIACAO:     "bg-green-100 text-green-800",
  ATUALIZACAO: "bg-blue-100 text-blue-800",
  EXCLUSAO:    "bg-red-100 text-red-800",
  VALIDACAO:   "bg-purple-100 text-purple-800",
  LOGIN:       "bg-gray-100 text-gray-700",
  EXPORTACAO:  "bg-orange-100 text-orange-800",
};

const TABELA_LABEL: Record<string, string> = {
  imoveis:   "Imóveis",
  ocupacoes: "Ocupações",
  documentos: "Documentos",
  usuarios:  "Usuários",
};

const PAGE_SIZE = 20;

/** Extracts a human-readable identifier from the record's data snapshot. */
function resolverIdentificador(log: LogAuditoria): string | null {
  // For deletions the snapshot is in dadosAnteriores; for others use dadosNovos
  const dados = (log.dadosAnteriores ?? log.dadosNovos) as Record<string, unknown> | null;
  if (!dados) return null;

  // Try common identifier fields in priority order
  if (dados.codigoSigpim) return String(dados.codigoSigpim);
  if (dados.nomeCompleto) return String(dados.nomeCompleto);
  if (dados.nomeReferencia) return String(dados.nomeReferencia);
  if (dados.email) return String(dados.email);
  if (dados.nomeUsuario) return String(dados.nomeUsuario);
  if (dados.descricao) return String(dados.descricao).slice(0, 40);
  return null;
}

/** Converts logs to CSV and triggers browser download. */
function exportarCSV(logs: LogAuditoria[]) {
  const header = [
    "ID", "Data/Hora", "Ação", "Tabela", "ID Registro", "Identificador",
    "Usuário", "Perfil", "IP Origem", "Descrição",
  ];

  const rows = logs.map((l) => [
    l.id,
    new Date(l.realizadoEm).toLocaleString("pt-BR"),
    l.acao,
    l.tabela,
    l.idRegistro,
    resolverIdentificador(l) ?? "",
    l.nomeUsuario ?? (l.idUsuario != null ? `#${l.idUsuario}` : ""),
    l.perfilUsuario ?? "",
    l.ipOrigem ?? "",
    (l.descricao ?? "").replace(/"/g, "'"),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `auditoria_sigpim_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Auditoria() {
  const [logs,          setLogs]          = useState<LogAuditoria[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterAcao,    setFilterAcao]    = useState("todas");
  const [filterTabela,  setFilterTabela]  = useState("todas");
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandido,     setExpandido]     = useState<number | null>(null);

  const carregar = useCallback(async (currentPage = 0) => {
    setLoading(true);
    try {
      const res = await api.get<PageResponse<LogAuditoria>>(
        `/auditorias?page=${currentPage}&size=${PAGE_SIZE}&sort=realizadoEm,desc`
      );
      if (res && Array.isArray(res.content)) {
        setLogs(res.content);
        setTotalPages(res.totalPages ?? 0);
        setTotalElements(res.totalElements ?? 0);
        setPage(res.number ?? currentPage);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(0); }, [carregar]);

  const filtered = logs.filter((l) => {
    const s = !search || [
      l.tabela, String(l.idRegistro), l.nomeUsuario ?? "",
      l.descricao ?? "", l.ipOrigem ?? "",
      resolverIdentificador(l) ?? "",
    ].join(" ").toLowerCase().includes(search.toLowerCase());
    const a = filterAcao   === "todas" || l.acao   === filterAcao;
    const t = filterTabela === "todas" || l.tabela === filterTabela;
    return s && a && t;
  });

  const formatarData = (iso: string | null | undefined): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
  };

  const toggleExpandido = (id: number) =>
    setExpandido((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Trilha completa de auditoria — quem fez o quê, quando e de onde
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline" size="icon"
            onClick={() => carregar(page)} disabled={loading} title="Atualizar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => exportarCSV(filtered)}
            disabled={loading || filtered.length === 0}
            title="Exporta os registros visíveis como CSV"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Log
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por registro, usuário, IP ou descrição..."
            value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"
          />
        </div>
        <Select value={filterAcao} onValueChange={setFilterAcao}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as ações</SelectItem>
            <SelectItem value="CRIACAO">Criação</SelectItem>
            <SelectItem value="ATUALIZACAO">Atualização</SelectItem>
            <SelectItem value="EXCLUSAO">Exclusão</SelectItem>
            <SelectItem value="VALIDACAO">Validação</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
            <SelectItem value="EXPORTACAO">Exportação</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTabela} onValueChange={setFilterTabela}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as tabelas</SelectItem>
            <SelectItem value="imoveis">Imóveis</SelectItem>
            <SelectItem value="ocupacoes">Ocupações</SelectItem>
            <SelectItem value="documentos">Documentos</SelectItem>
            <SelectItem value="usuarios">Usuários</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-6" />
                <TableHead className="text-xs">Data/Hora</TableHead>
                <TableHead className="text-xs">Ação</TableHead>
                <TableHead className="text-xs">Tabela</TableHead>
                <TableHead className="text-xs">Registro afetado</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">IP</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Carregando logs...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    {search || filterAcao !== "todas" || filterTabela !== "todas"
                      ? "Nenhum registro encontrado com esses filtros."
                      : "Nenhum registro de auditoria disponível ainda."}
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.map((l) => {
                const identificador = resolverIdentificador(l);
                const temDetalhes   = l.dadosAnteriores != null || l.dadosNovos != null;
                const isExpandido   = expandido === l.id;

                return (
                  <React.Fragment key={l.id}>
                    <TableRow
                      className={`hover:bg-gray-50/80 ${isExpandido ? "bg-blue-50/40" : ""}`}
                    >
                      {/* Expand toggle */}
                      <TableCell className="w-6 px-2">
                        {temDetalhes && (
                          <button
                            onClick={() => toggleExpandido(l.id)}
                            className="text-gray-400 hover:text-gray-700"
                          >
                            {isExpandido
                              ? <ChevronDown className="h-3.5 w-3.5" />
                              : <ChevronRight className="h-3.5 w-3.5" />
                            }
                          </button>
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                        {formatarData(l.realizadoEm)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`text-xs ${acaoConfig[l.acao] || "bg-gray-100 text-gray-700"}`}
                          variant="secondary"
                        >
                          {l.acao}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-gray-600">
                        {TABELA_LABEL[l.tabela] ?? l.tabela}
                      </TableCell>

                      {/* Registro — ID + nome quando disponível */}
                      <TableCell>
                        <p className="font-mono text-xs font-semibold text-[#1351B4]">
                          #{l.idRegistro}
                        </p>
                        {identificador && (
                          <p className="text-xs text-gray-500 truncate max-w-[140px]" title={identificador}>
                            {identificador}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <p className="text-xs font-medium text-gray-900">
                          {l.nomeUsuario ?? (l.idUsuario != null ? `#${l.idUsuario}` : "—")}
                        </p>
                        {l.perfilUsuario && (
                          <p className="text-xs text-gray-400">{l.perfilUsuario}</p>
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-gray-400">
                        {l.ipOrigem || "—"}
                      </TableCell>

                      <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                        {l.descricao || "—"}
                      </TableCell>
                    </TableRow>

                    {/* Linha expandida — dados anteriores/novos */}
                    {isExpandido && (
                      <TableRow className="bg-blue-50/30">
                        <TableCell colSpan={8} className="px-6 py-3">
                          <div className="grid gap-4 sm:grid-cols-2 text-xs">
                            {l.dadosAnteriores && (
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">
                                  {l.acao === "EXCLUSAO" ? "Dados do registro excluído" : "Antes"}
                                </p>
                                <pre className="rounded bg-red-50 border border-red-100 p-2 text-gray-700 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                                  {JSON.stringify(l.dadosAnteriores, null, 2)}
                                </pre>
                              </div>
                            )}
                            {l.dadosNovos && (
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Depois</p>
                                <pre className="rounded bg-green-50 border border-green-100 p-2 text-gray-700 overflow-auto max-h-48 whitespace-pre-wrap break-all">
                                  {JSON.stringify(l.dadosNovos, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-xs text-gray-500">
            {loading
              ? "Carregando..."
              : `${totalElements} registros no total — página ${page + 1} de ${totalPages || 1}`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"
              disabled={loading || page === 0}
              onClick={() => carregar(page - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm"
              disabled={loading || page >= totalPages - 1}
              onClick={() => carregar(page + 1)}>
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}