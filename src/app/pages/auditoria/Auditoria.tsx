import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Download, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../api/client";

interface LogAuditoria {
  id: number;
  tabela: string;
  registroId: string;
  acao: string;
  idUsuario: number;
  nomeUsuario?: string;
  perfilUsuario?: string;
  ipOrigem?: string;
  criadoEm: string;
  descricao?: string;
}

const acaoConfig: Record<string, string> = {
  CRIACAO:     "bg-green-100 text-green-800",
  ATUALIZACAO: "bg-blue-100 text-blue-800",
  EXCLUSAO:    "bg-red-100 text-red-800",
  VALIDACAO:   "bg-purple-100 text-purple-800",
  LOGIN:       "bg-gray-100 text-gray-700",
  EXPORTACAO:  "bg-orange-100 text-orange-800",
};

export function Auditoria() {
  const [logs, setLogs]                   = useState<LogAuditoria[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filterAcao, setFilterAcao]       = useState("todas");
  const [filterTabela, setFilterTabela]   = useState("todas");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/auditoria?page=0&size=100");
      if (res && Array.isArray(res.content)) setLogs(res.content);
      else if (Array.isArray(res))           setLogs(res);
      else                                   setLogs([]);
    } catch {
      setLogs([]); // endpoint pode não existir ainda
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtered = logs.filter((l) => {
    const s = !search || [l.tabela, l.registroId, l.nomeUsuario ?? "", l.descricao ?? ""]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const a = filterAcao === "todas"   || l.acao   === filterAcao;
    const t = filterTabela === "todas" || l.tabela === filterTabela;
    return s && a && t;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">Trilha completa de auditoria — quem fez o quê, quando e de onde</p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />Exportar Log
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar por registro, usuário ou descrição..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />Carregando logs...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    {search || filterAcao !== "todas" || filterTabela !== "todas"
                      ? "Nenhum registro encontrado com esses filtros."
                      : "Nenhum registro de auditoria disponível ainda."}
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.map((l) => (
                <TableRow key={l.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                    {new Date(l.criadoEm).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${acaoConfig[l.acao] || "bg-gray-100 text-gray-700"}`} variant="secondary">
                      {l.acao}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">{l.tabela}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-[#1351B4]">{l.registroId}</TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-gray-900">{l.nomeUsuario ?? `#${l.idUsuario}`}</p>
                    {l.perfilUsuario && <p className="text-xs text-gray-400">{l.perfilUsuario}</p>}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">{l.ipOrigem || "—"}</TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-xs truncate">{l.descricao || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t px-6 py-3">
          <p className="text-xs text-gray-500">
            {loading ? "Carregando..." : `Exibindo ${filtered.length} de ${logs.length} registros`}
          </p>
        </div>
      </div>
    </div>
  );
}
