import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  ClipboardCheck, RefreshCw, AlertCircle, Filter,
  ChevronDown, ChevronUp, Search, AlertTriangle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { api } from "../../api/client";
import { type VistoriaResponse } from "../../api/vistorias";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: string | null | undefined) {
  if (!v) return "—";
  return v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatarData(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

const CRITICIDADE_CFG: Record<string, { cls: string; label: string }> = {
  BAIXO:   { cls: "bg-green-100 text-green-800",   label: "Baixo" },
  MEDIO:   { cls: "bg-yellow-100 text-yellow-800", label: "Médio" },
  ALTO:    { cls: "bg-orange-100 text-orange-800", label: "Alto" },
  CRITICO: { cls: "bg-red-100 text-red-800",       label: "Crítico" },
};

const CONSERVACAO_CFG: Record<string, string> = {
  OTIMO:   "bg-green-100 text-green-800",
  BOM:     "bg-emerald-100 text-emerald-800",
  REGULAR: "bg-yellow-100 text-yellow-800",
  RUIM:    "bg-orange-100 text-orange-800",
  PESSIMO: "bg-red-100 text-red-800",
};

interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; }

// ── Componente ────────────────────────────────────────────────────────────────

export function ListaVistorias() {
  const [vistorias,    setVistorias]    = useState<VistoriaResponse[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState<string | null>(null);
  const [page,         setPage]         = useState(0);
  const [search,       setSearch]       = useState("");
  const [filtCrit,     setFiltCrit]     = useState("todos");
  const [expandido,    setExpandido]    = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: "20",
        sort: "dataVistoria,desc",
      });
      if (filtCrit !== "todos") params.set("criticidade", filtCrit);
      const res = await api.get<PageResponse<VistoriaResponse>>(`/vistorias?${params}`);
      setVistorias(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar vistorias.");
    } finally { setLoading(false); }
  }, [page, filtCrit]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { setPage(0); }, [filtCrit]);

  const filtradas = vistorias.filter((v) => {
    if (!search) return true;
    const txt = search.toLowerCase();
    return (
      String(v.idImovel).includes(txt) ||
      (v.equipeDescricao ?? "").toLowerCase().includes(txt) ||
      (v.numeroProcesso  ?? "").toLowerCase().includes(txt) ||
      (v.parecer         ?? "").toLowerCase().includes(txt)
    );
  });

  // Contagens por criticidade
  const porCrit = vistorias.reduce<Record<string, number>>((acc, v) => {
    acc[v.criticidadeRisco] = (acc[v.criticidadeRisco] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Histórico global de vistorias técnicas
          {!loading && (
            <span className="ml-2 text-gray-400">({total} no total)</span>
          )}
        </p>
        <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Selos de criticidade */}
      {!loading && vistorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(CRITICIDADE_CFG).map(([crit, cfg]) => (
            porCrit[crit] ? (
              <button
                key={crit}
                onClick={() => setFiltCrit(filtCrit === crit ? "todos" : crit)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  filtCrit === crit
                    ? `${cfg.cls} border-transparent ring-2 ring-offset-1 ring-current`
                    : `${cfg.cls} border-transparent opacity-70 hover:opacity-100`
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                {cfg.label} — {porCrit[crit]}
              </button>
            ) : null
          ))}
          {filtCrit !== "todos" && (
            <button
              onClick={() => setFiltCrit("todos")}
              className="text-xs text-gray-500 hover:underline px-2"
            >
              Limpar filtro
            </button>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por imóvel, equipe, processo, parecer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtCrit} onValueChange={setFiltCrit}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Criticidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as criticidades</SelectItem>
            <SelectItem value="BAIXO">Risco Baixo</SelectItem>
            <SelectItem value="MEDIO">Risco Médio</SelectItem>
            <SelectItem value="ALTO">Risco Alto</SelectItem>
            <SelectItem value="CRITICO">Risco Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Erros */}
      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>Tentar novamente</Button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <ClipboardCheck className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhuma vistoria encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((v) => {
            const crit = CRITICIDADE_CFG[v.criticidadeRisco] ?? CRITICIDADE_CFG.BAIXO;
            const aberto = expandido === v.id;
            return (
              <div key={v.id} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandido(aberto ? null : v.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/dashboard/imoveis/${v.idImovel}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-bold text-[#1351B4] hover:underline"
                        >
                          Imóvel #{v.idImovel}
                        </Link>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatarData(v.dataVistoria)}
                        </span>
                        {v.vistoriaInicial && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">Inicial</Badge>
                        )}
                        <Badge variant="secondary" className={`text-xs ${crit.cls}`}>
                          {crit.label}
                        </Badge>
                        {v.estadoConservacao && (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${CONSERVACAO_CFG[v.estadoConservacao] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {fmt(v.estadoConservacao)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {v.equipeDescricao ?? "—"}
                        {v.numeroProcesso ? ` · Proc. ${v.numeroProcesso}` : ""}
                      </p>
                    </div>
                  </div>
                  {aberto
                    ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                </button>

                {aberto && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {v.parecer && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Parecer técnico</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{v.parecer}</p>
                      </div>
                    )}
                    {v.recomendacoes && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Recomendações</p>
                        <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3 border border-amber-100">
                          {v.recomendacoes}
                        </p>
                      </div>
                    )}
                    {v.itensChecklist && v.itensChecklist.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Checklist ({v.itensChecklist.length} itens)
                        </p>
                        <div className="space-y-1.5">
                          {v.itensChecklist.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 text-xs">
                              <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                                item.situacao === "CONFORME"       ? "bg-green-500" :
                                item.situacao === "NAO_CONFORME"   ? "bg-red-500"   :
                                "bg-gray-300"
                              }`} />
                              <span className="text-gray-500 font-medium">{item.categoria}:</span>
                              <span className="text-gray-700 flex-1">{item.item}</span>
                              <span className={`shrink-0 ${
                                item.situacao === "CONFORME"     ? "text-green-600" :
                                item.situacao === "NAO_CONFORME" ? "text-red-600"   :
                                "text-gray-400"
                              }`}>
                                {fmt(item.situacao)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Link
                        to={`/dashboard/imoveis/${v.idImovel}?tab=vistorias`}
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
            {filtradas.length} de {total} vistorias · página {page + 1}
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