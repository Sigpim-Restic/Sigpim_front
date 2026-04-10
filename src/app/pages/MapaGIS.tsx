import React, { useState, useEffect } from "react";
import { Layers, MapPin, Search, ZoomIn, ZoomOut, Maximize2, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card } from "../components/ui/card";
import { api } from "../api/client";

interface ImovelPin {
  id: number;
  codigoSigpim: string;
  nomeReferencia: string;
  statusCadastro: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

const STATUS_COR: Record<string, string> = {
  VALIDADO: "bg-green-100 text-green-800",
  PRE_CADASTRO: "bg-yellow-100 text-yellow-800",
  PENDENTE: "bg-red-100 text-red-800",
  RASCUNHO: "bg-gray-100 text-gray-700",
};

const STATUS_DOT: Record<string, string> = {
  VALIDADO: "bg-green-500",
  PRE_CADASTRO: "bg-yellow-500",
  PENDENTE: "bg-red-400",
  RASCUNHO: "bg-gray-400",
};

export function MapaGIS() {
  const [camada, setCamada] = useState("bairro");
  const [origem, setOrigem] = useState("semurh");
  const [search, setSearch] = useState("");
  const [imoveis, setImoveis] = useState<ImovelPin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<PageResponse<ImovelPin>>("/imoveis?size=100&sort=codigoSigpim")
      .then((data) => {
        setImoveis(data.content);
        setTotal(data.totalElements);
      })
      .catch(() => setImoveis([]))
      .finally(() => setLoading(false));
  }, []);

  // Contagem por status
  const contagem = imoveis.reduce<Record<string, number>>((acc, im) => {
    acc[im.statusCadastro] = (acc[im.statusCadastro] ?? 0) + 1;
    return acc;
  }, {});

  const imoveisFiltrados = imoveis.filter(
    (im) =>
      !search ||
      im.nomeReferencia?.toLowerCase().includes(search.toLowerCase()) ||
      im.codigoSigpim?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Visualização georreferenciada dos imóveis — Selo GIS-SEMURH como fonte autoritativa
      </p>

      {/* Selos resumo */}
      <div className="flex flex-wrap gap-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando imóveis...
          </div>
        ) : (
          Object.entries(contagem).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status] ?? "bg-gray-400"}`} />
              <span className="text-xs text-gray-700">{status.replace("_", " ")}</span>
              <span className="text-xs font-semibold text-gray-900">{count}</span>
            </div>
          ))
        )}
        {!loading && total > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-700">Total</span>
            <span className="text-xs font-semibold text-gray-900">{total}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Controls */}
        <div className="flex flex-col gap-3 lg:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar imóvel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Card className="p-4">
            <h3 className="mb-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Camadas</h3>
            <div className="space-y-2">
              <Select value={camada} onValueChange={setCamada}>
                <SelectTrigger className="text-sm">
                  <Layers className="mr-2 h-4 w-4" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bairro">Bairros</SelectItem>
                  <SelectItem value="distrito">Distritos</SelectItem>
                  <SelectItem value="zoneamento">Zoneamento</SelectItem>
                  <SelectItem value="macrozona">Macrozona</SelectItem>
                </SelectContent>
              </Select>
              <Select value={origem} onValueChange={setOrigem}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="semurh">SEMURH (oficial)</SelectItem>
                  <SelectItem value="incid">INCID (revisão)</SelectItem>
                  <SelectItem value="semfaz">SEMFAZ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Imóveis na área {!loading && `(${imoveisFiltrados.length})`}
            </h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : imoveisFiltrados.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                {search ? "Nenhum imóvel encontrado." : "Nenhum imóvel cadastrado."}
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {imoveisFiltrados.map((im) => (
                  <div key={im.id} className="flex items-start gap-2 rounded-md p-2 hover:bg-gray-50 cursor-pointer">
                    <MapPin className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                      im.statusCadastro === "VALIDADO" ? "text-green-600" :
                      im.statusCadastro === "PRE_CADASTRO" ? "text-yellow-600" : "text-red-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-[#1351B4]">{im.codigoSigpim}</p>
                      <p className="text-xs text-gray-700 truncate">{im.nomeReferencia ?? "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Map area */}
        <div
          className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm"
          style={{ minHeight: "520px" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-gray-100 to-green-50 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-md">
                <MapPin className="h-8 w-8 text-[#1351B4]" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Mapa Interativo</p>
              <p className="text-xs text-gray-500 mt-1">Integração com Leaflet + OpenStreetMap</p>
              <p className="text-xs text-gray-400 mt-1">São Luís, Maranhão — WGS84</p>
              {!loading && imoveisFiltrados.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
                  {imoveisFiltrados.slice(0, 8).map((p) => (
                    <Badge
                      key={p.id}
                      variant="secondary"
                      className={`text-xs cursor-pointer ${STATUS_COR[p.statusCadastro] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      <MapPin className="mr-1 h-2.5 w-2.5" />{p.codigoSigpim}
                    </Badge>
                  ))}
                  {imoveisFiltrados.length > 8 && (
                    <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                      +{imoveisFiltrados.length - 8} mais
                    </Badge>
                  )}
                </div>
              )}
              {!loading && imoveisFiltrados.length === 0 && (
                <p className="mt-4 text-xs text-gray-400">Nenhum imóvel cadastrado para exibir no mapa.</p>
              )}
            </div>
          </div>

          {/* Map controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md bg-white hover:bg-gray-50">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md bg-white hover:bg-gray-50">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md bg-white hover:bg-gray-50">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-3 left-3">
            <Badge className="bg-white/90 text-gray-700 shadow-sm text-xs" variant="secondary">
              <Layers className="mr-1.5 h-3 w-3" />Camada: {camada} · Fonte: {origem.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
