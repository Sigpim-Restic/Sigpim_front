import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { api } from "../../api/client";

// BUG 1 CORRIGIDO: interface alinhada com o DTO do back-end.
// Antes usava "criadoEm" e "registroId" que não existem na API — corrigido
// para "realizadoEm" e "idRegistro". Adicionados nomeUsuario e perfilUsuario.
interface LogAuditoria {
  id: number;
  tabela: string;
  idRegistro: number;       // era "registroId" — campo inexistente na API
  acao: string;
  idUsuario: number | null;
  nomeUsuario: string | null;    // novo: vem do back enriquecido
  perfilUsuario: string | null;  // novo: vem do back enriquecido
  ipOrigem: string | null;
  realizadoEm: string;      // era "criadoEm" — campo inexistente na API
  descricao: string | null;
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

const PAGE_SIZE = 20;

export function Auditoria() {
  const [logs, setLogs]                 = useState<LogAuditoria[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterAcao, setFilterAcao]     = useState("todas");
  const [filterTabela, setFilterTabela] = useState("todas");
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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

  const handlePageChange = (newPage: number) => {
    carregar(newPage);
  };

  // Filtros client-side aplicados sobre a página atual
  const filtered = logs.filter((l) => {
    const s =
      !search ||
      [
        l.tabela,
        String(l.idRegistro),
        l.nomeUsuario ?? "",
        l.descricao ?? "",
        l.ipOrigem ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
    const a = filterAcao === "todas"   || l.acao   === filterAcao;
    const t = filterTabela === "todas" || l.tabela === filterTabela;
    return s && a && t;
  });

  // BUG 1 CORRIGIDO: formata realizadoEm (antes usava criadoEm que era undefined → "Invalid Date")
  const formatarData = (iso: string | null | undefined): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Trilha completa de auditoria — quem fez o quê, quando e de onde
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => carregar(page)}
            disabled={loading}
            title="Atualizar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAcao} onValueChange={setFilterAcao}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Ação" />
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
                <TableHead className="text-xs">Data/Hora</TableHead>
                <TableHead className="text-xs">Ação</TableHead>
                <TableHead className="text-xs">Tabela</TableHead>
                <TableHead className="text-xs">Registro</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">IP</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Carregando logs...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    {search || filterAcao !== "todas" || filterTabela !== "todas"
                      ? "Nenhum registro encontrado com esses filtros."
                      : "Nenhum registro de auditoria disponível ainda."}
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((l) => (
                  <TableRow key={l.id} className="hover:bg-gray-50/80">
                    {/* BUG 1 CORRIGIDO: usa realizadoEm em vez de criadoEm */}
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
                      {l.tabela}
                    </TableCell>
                    {/* BUG 1 CORRIGIDO: usa idRegistro em vez de registroId */}
                    <TableCell className="font-mono text-xs font-semibold text-[#1351B4]">
                      #{l.idRegistro}
                    </TableCell>
                    <TableCell>
                      {/* BUG 1 CORRIGIDO: exibe nomeUsuario vindo do back; fallback para #id */}
                      <p className="text-xs font-medium text-gray-900">
                        {l.nomeUsuario ?? (l.idUsuario != null ? `#${l.idUsuario}` : "—")}
                      </p>
                      {l.perfilUsuario && (
                        <p className="text-xs text-gray-400">{l.perfilUsuario}</p>
                      )}
                    </TableCell>
                    {/* BUG 2 CORRIGIDO: IP agora vem preenchido do back */}
                    <TableCell className="font-mono text-xs text-gray-400">
                      {l.ipOrigem || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                      {l.descricao || "—"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Rodapé com paginação */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-xs text-gray-500">
            {loading
              ? "Carregando..."
              : `${totalElements} registros no total — exibindo página ${page + 1} de ${totalPages || 1}`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}