import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Wrench, RefreshCw, AlertCircle, Filter,
  ChevronDown, ChevronUp, Search,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { api } from "../../api/client";
import { type IntervencaoResponse } from "../../api/intervencoes";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: string | null | undefined) {
  if (!v) return "—";
  return v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatarData(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  PLANEJADA:             { cls: "bg-gray-100 text-gray-700",    label: "Planejada" },
  AGUARDANDO_PARECER:    { cls: "bg-purple-100 text-purple-800", label: "Aguard. Parecer" },
  EM_CONTRATACAO:        { cls: "bg-blue-100 text-blue-800",    label: "Em Contratação" },
  EM_EXECUCAO:           { cls: "bg-yellow-100 text-yellow-800", label: "Em Execução" },
  SUSPENSA:              { cls: "bg-orange-100 text-orange-800", label: "Suspensa" },
  CONCLUIDA:             { cls: "bg-green-100 text-green-800",   label: "Concluída" },
  CANCELADA:             { cls: "bg-red-100 text-red-800",       label: "Cancelada" },
};

const NIVEL_CFG: Record<string, string> = {
  N0: "bg-gray-100 text-gray-600",
  N1: "bg-blue-100 text-blue-700",
  N2: "bg-yellow-100 text-yellow-700",
  N3: "bg-red-100 text-red-700",
};

interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; }

// ── Componente ────────────────────────────────────────────────────────────────

export function ListaIntervencoes() {
  const [intervencoes, setIntervencoes] = useState<IntervencaoResponse[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState<string | null>(null);
  const [page,         setPage]         = useState(0);
  const [search,       setSearch]       = useState("");
  const [filtStatus,   setFiltStatus]   = useState("todos");
  const [expandido,    setExpandido]    = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: "20",
        sort: "criadoEm,desc",
      });
      if (filtStatus !== "todos") params.set("status", filtStatus);
      const res = await api.get<PageResponse<IntervencaoResponse>>(`/intervencoes?${params}`);
      setIntervencoes(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar intervenções.");
    } finally { setLoading(false); }
  }, [page, filtStatus]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { setPage(0); }, [filtStatus]);

  const filtradas = intervencoes.filter((i) => {
    if (!search) return true;
    const txt = search.toLowerCase();
    return (
      String(i.idImovel).includes(txt) ||
      i.titulo.toLowerCase().includes(txt) ||
      (i.numeroProcesso ?? "").toLowerCase().includes(txt) ||
      (i.escopo ?? "").toLowerCase().includes(txt)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Histórico global de intervenções
          {!loading && (
            <span className="ml-2 text-gray-400">({total} no total)</span>
          )}
        </p>
        <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por imóvel, título, processo, escopo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtStatus} onValueChange={setFiltStatus}>
          <SelectTrigger className="w-full sm:w-52">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Erros */}
      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <Wrench className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhuma intervenção encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((i) => {
            const status = STATUS_CFG[i.statusIntervencao] ?? STATUS_CFG.PLANEJADA;
            const aberto = expandido === i.id;
            return (
              <div key={i.id} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandido(aberto ? null : i.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/dashboard/imoveis/${i.idImovel}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-bold text-[#1351B4] hover:underline"
                        >
                          Imóvel #{i.idImovel}
                        </Link>
                        <span className="text-sm font-semibold text-gray-900 truncate max-w-xs">
                          {i.titulo}
                        </span>
                        <Badge variant="secondary" className={`text-xs ${status.cls}`}>
                          {status.label}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs ${NIVEL_CFG[i.nivelIntervencao] ?? ""}`}>
                          {i.nivelIntervencao}
                        </Badge>
                        {i.requerParecerFumph && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                            FUMPH
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmt(i.tipoIntervencao)}
                        {i.numeroProcesso ? ` · Proc. ${i.numeroProcesso}` : ""}
                        {i.dataPrevistaInicio ? ` · Início: ${formatarData(i.dataPrevistaInicio)}` : ""}
                      </p>
                    </div>
                  </div>
                  {aberto
                    ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                </button>

                {aberto && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                    {i.escopo && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Escopo</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{i.escopo}</p>
                      </div>
                    )}
                    {i.justificativa && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Justificativa</p>
                        <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3 border border-amber-100">
                          {i.justificativa}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {i.custoEstimado != null && (
                        <span>Custo est.: <strong className="text-gray-700">R$ {i.custoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                      )}
                      {i.dataPrevistaFim && (
                        <span>Prazo: <strong className="text-gray-700">{formatarData(i.dataPrevistaFim)}</strong></span>
                      )}
                      {i.dataConclusaoReal && (
                        <span>Concluída em: <strong className="text-gray-700">{formatarData(i.dataConclusaoReal)}</strong></span>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Link
                        to={`/dashboard/imoveis/${i.idImovel}?tab=intervencoes`}
                        className="text-xs text-[#1351B4] hover:underline"
                      >
                        Ver no imóvel →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {filtradas.length} de {total} intervenções · página {page + 1}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={(page + 1) * 20 >= total || loading}
              onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}
    </div>
  );
}