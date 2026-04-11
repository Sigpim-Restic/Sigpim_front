import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus, Search, Filter, MoreVertical, Edit, Eye,
  MapPin, Download, RefreshCw, AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
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
import { usePermissoes } from "../../hooks/usePermissoes";

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  VALIDADO:     { label: "Validado",     cls: "bg-green-100 text-green-800" },
  PRE_CADASTRO: { label: "Pré-cadastro", cls: "bg-yellow-100 text-yellow-800" },
};

const TIPO_LABEL: Record<string, string> = {
  PROPRIO: "Próprio",
  LOCADO:  "Locado",
  INCERTO: "Incerto",
};

export function ListaImoveis() {
  const navigate = useNavigate();
  const perm = usePermissoes();

  const [imoveis, setImoveis]     = useState<ImovelResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState<string | null>(null);
  const [totalElements, setTotal] = useState(0);
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState("");
  const [filterStatus, setStatus] = useState("todos");
  const [filterTipo, setTipo]     = useState("todos");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await imoveisApi.listar(page, 20);
      setImoveis(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar imóveis.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { carregar(); }, [carregar]);

  // Exportar ficha individual como JSON (PDF virá na Fase 2)
  const handleExportarFicha = (im: ImovelResponse) => {
    const blob = new Blob([JSON.stringify(im, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ficha-${im.codigoSigpim}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtrados = imoveis.filter((im) => {
    const txt = search.toLowerCase();
    const matchSearch = !search ||
      [im.codigoSigpim, im.nomeReferencia ?? "", im.tipologia ?? ""]
        .join(" ").toLowerCase().includes(txt);
    const matchStatus = filterStatus === "todos" || im.statusCadastro === filterStatus;
    const matchTipo   = filterTipo   === "todos" || im.tipoImovel === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  return (
    <div className="space-y-5">
      {/* Topo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Gerencie o cadastro dos imóveis públicos municipais
          {!loading && (
            <span className="ml-2 text-gray-400">({totalElements} no total)</span>
          )}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {perm.canCreateImovel && (
            <Link to="/imoveis/novo/etapa-1">
              <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Plus className="mr-2 h-4 w-4" />Novo Imóvel
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Falha ao carregar imóveis</p>
            <p className="mt-1 text-red-600">{erro}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={carregar}>
            Tentar novamente
          </Button>
        </div>
      )}

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
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />Exportar
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
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Carregando imóveis...
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
                return (
                  <TableRow key={im.id} className="hover:bg-gray-50/80">
                    <TableCell className="font-mono text-xs font-semibold text-[#1351B4]">
                      {im.codigoSigpim}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900">
                        {im.nomeReferencia ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500">{im.tipologia ?? "—"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          im.tipoImovel === "PROPRIO"
                            ? "bg-blue-50 text-blue-700"
                            : im.tipoImovel === "LOCADO"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {TIPO_LABEL[im.tipoImovel] ?? im.tipoImovel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {im.estadoConservacaoAtual ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${st.cls}`} variant="secondary">
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Visualizar — todos os perfis que podem ler */}
                          <DropdownMenuItem onClick={() => navigate(`/imoveis/${im.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />Visualizar
                          </DropdownMenuItem>

                          {/* Editar — apenas quem pode atualizar */}
                          {perm.canUpdateImovel && (
                            <DropdownMenuItem onClick={() => navigate(`/imoveis/${im.id}/editar`)}>
                              <Edit className="mr-2 h-4 w-4" />Editar
                            </DropdownMenuItem>
                          )}

                          {/* Ver no Mapa — navega para /mapa passando o id */}
                          <DropdownMenuItem onClick={() => navigate(`/mapa?imovel=${im.id}`)}>
                            <MapPin className="mr-2 h-4 w-4" />Ver no Mapa
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Exportar Ficha — todos os perfis com leitura */}
                          <DropdownMenuItem onClick={() => handleExportarFicha(im)}>
                            <Download className="mr-2 h-4 w-4" />Exportar Ficha
                          </DropdownMenuItem>
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
              <Button
                variant="outline" size="sm"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline" size="sm"
                disabled={(page + 1) * 20 >= totalElements || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
