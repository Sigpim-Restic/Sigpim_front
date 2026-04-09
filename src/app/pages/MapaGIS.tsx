import React, { useState } from "react";
import { Layers, MapPin, Search, ZoomIn, ZoomOut, Maximize2, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card } from "../components/ui/card";

const imovelPins = [
  { id: 1, codigo: "SIGPIM-000001", nome: "Ed. Sede SEMAD", bairro: "Centro", status: "VALIDADO" },
  { id: 2, codigo: "SIGPIM-000045", nome: "UBS Cohama", bairro: "Cohama", status: "VALIDADO" },
  { id: 3, codigo: "SIGPIM-000046", nome: "Escola Municipal Turu", bairro: "Turu", status: "PRE_CADASTRO" },
  { id: 4, codigo: "SIGPIM-000043", nome: "Palácio da Cultura", bairro: "Centro Histórico", status: "VALIDADO" },
  { id: 5, codigo: "SIGPIM-000042", nome: "Parque Bom Menino", bairro: "Calhau", status: "PENDENTE" },
];

const seloGis = [
  { label: "Validado", count: 891, cor: "bg-green-500" },
  { label: "Conflito", count: 47, cor: "bg-yellow-500" },
  { label: "Não validado", count: 309, cor: "bg-gray-400" },
];

export function MapaGIS() {
  const [camada, setCamada] = useState("bairro");
  const [origem, setOrigem] = useState("semurh");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Visualização georreferenciada dos imóveis — Selo GIS-SEMURH como fonte autoritativa
      </p>

      {/* Selos resumo */}
      <div className="flex flex-wrap gap-3">
        {seloGis.map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${s.cor}`} />
            <span className="text-xs text-gray-700">{s.label}</span>
            <span className="text-xs font-semibold text-gray-900">{s.count}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Controls */}
        <div className="flex flex-col gap-3 lg:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Buscar imóvel..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
            <h3 className="mb-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Filtrar por status</h3>
            <div className="space-y-1.5">
              {["Todos", "Validado", "Pré-cadastro", "Pendente"].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-xs text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Imóveis na área</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {imovelPins.filter(im => !search || im.nome.toLowerCase().includes(search.toLowerCase()) || im.codigo.toLowerCase().includes(search.toLowerCase())).map((im) => (
                <div key={im.id} className="flex items-start gap-2 rounded-md p-2 hover:bg-gray-50 cursor-pointer">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 text-[#1351B4] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-[#1351B4]">{im.codigo}</p>
                    <p className="text-xs text-gray-700 truncate">{im.nome}</p>
                    <p className="text-xs text-gray-400">{im.bairro}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Map area */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm" style={{ minHeight: "520px" }}>
          {/* Placeholder map with São Luís feel */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-gray-100 to-green-50 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-md">
                <MapPin className="h-8 w-8 text-[#1351B4]" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Mapa Interativo</p>
              <p className="text-xs text-gray-500 mt-1">
                Integração com Leaflet + OpenStreetMap
              </p>
              <p className="text-xs text-gray-400 mt-1">
                São Luís, Maranhão — WGS84
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {imovelPins.map((p) => (
                  <Badge key={p.id} variant="secondary" className={`text-xs cursor-pointer ${p.status === "VALIDADO" ? "bg-green-100 text-green-800" : p.status === "PRE_CADASTRO" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                    <MapPin className="mr-1 h-2.5 w-2.5" />{p.codigo}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Map controls overlay */}
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

          {/* Camada badge */}
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
