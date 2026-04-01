import React, { useState } from "react";
import { MapPin, Layers, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";

export function MapaGIS() {
  const [camada, setCamada] = useState("base");
  const [filtro, setFiltro] = useState("todos");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600">
          Visualização georreferenciada dos imóveis públicos municipais
        </p>
      </div>

      {/* Map Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Select value={camada} onValueChange={setCamada}>
            <SelectTrigger className="w-48">
              <Layers className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Mapa Base</SelectItem>
              <SelectItem value="satelite">Satélite</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
              <SelectItem value="topografico">Topográfico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Imóveis</SelectItem>
              <SelectItem value="educacao">Educação</SelectItem>
              <SelectItem value="saude">Saúde</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
              <SelectItem value="patrimonio">Patrimônio Histórico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <div className="relative h-[600px] bg-gray-100">
          {/* Map Placeholder */}
          <div className="flex h-full items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <MapPin className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Sistema de Mapeamento GIS
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Visualização georreferenciada integrada
              </p>
              <p className="text-xs text-gray-400 mt-1">
                1.247 imóveis georreferenciados
              </p>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 rounded-lg bg-white p-4 shadow-lg">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              Legenda
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600">Administrativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Educação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Saúde</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                <span className="text-xs text-gray-600">Patrimônio Histórico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                <span className="text-xs text-gray-600">Outros</span>
              </div>
            </div>
          </div>

          {/* Map Info Panel */}
          <div className="absolute right-4 top-4 w-80 rounded-lg bg-white p-4 shadow-lg">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              Estatísticas do Mapa
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total de Imóveis</span>
                <Badge>1.247</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Georreferenciados</span>
                <Badge className="bg-green-100 text-green-800">1.189</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pendente GIS</span>
                <Badge className="bg-yellow-100 text-yellow-800">58</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Exportar KML</Button>
        <Button variant="outline">Exportar Shapefile</Button>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
          Gerar Relatório Geográfico
        </Button>
      </div>
    </div>
  );
}
