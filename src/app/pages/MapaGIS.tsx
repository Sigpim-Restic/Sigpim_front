import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Layers, MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { api } from "../api/client";

// react-leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige o bug clássico dos ícones do Leaflet com bundlers
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl       from "leaflet/dist/images/marker-icon.png";
import shadowUrl     from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Ícones coloridos por status
const makeIcon = (color: string) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      width:24px;height:24px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,.35);
      transform:rotate(-45deg);
    "></div>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 24],
    popupAnchor:[0, -26],
  });

const ICON_MAP: Record<string, L.DivIcon> = {
  VALIDADO:     makeIcon("#16a34a"),
  PRE_CADASTRO: makeIcon("#ca8a04"),
  default:      makeIcon("#6b7280"),
};

interface ImovelPin {
  id: number;
  codigoSigpim: string;
  nomeReferencia: string | null;
  statusCadastro: string;
  latitude:  number | null;
  longitude: number | null;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
}

// Componente auxiliar: voa até o imóvel quando selecionado pelo deeplink
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

const STATUS_DOT: Record<string, string> = {
  VALIDADO:     "bg-green-500",
  PRE_CADASTRO: "bg-yellow-500",
  default:      "bg-gray-400",
};

// Centro de São Luís — MA
const SLZ: [number, number] = [-2.5297, -44.3028];

export function MapaGIS() {
  const [searchParams] = useSearchParams();
  const imovelIdParam  = searchParams.get("imovel");

  const [camada,  setCamada]  = useState("bairro");
  const [origem,  setOrigem]  = useState("semurh");
  const [search,  setSearch]  = useState("");
  const [imoveis, setImoveis] = useState<ImovelPin[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [flyTo,   setFlyTo]   = useState<{ lat: number; lng: number } | null>(null);

  // Carrega imóveis
  useEffect(() => {
    setLoading(true);
    api
      .get<PageResponse<ImovelPin>>("/imoveis?size=200&sort=codigoSigpim")
      .then((data) => {
        setImoveis(data.content);
        setTotal(data.totalElements);
      })
      .catch(() => setImoveis([]))
      .finally(() => setLoading(false));
  }, []);

  // Deeplink: quando vem de "Ver no Mapa" na listagem, voa até o imóvel
  useEffect(() => {
    if (!imovelIdParam || imoveis.length === 0) return;
    const alvo = imoveis.find((im) => String(im.id) === imovelIdParam);
    if (alvo?.latitude && alvo?.longitude) {
      setFlyTo({ lat: alvo.latitude, lng: alvo.longitude });
    }
  }, [imovelIdParam, imoveis]);

  // Separa imóveis com e sem coordenadas
  const comCoordenadas    = imoveis.filter((im) => im.latitude  != null && im.longitude != null);
  const semCoordenadas    = imoveis.filter((im) => im.latitude  == null || im.longitude == null);

  const contagem = imoveis.reduce<Record<string, number>>((acc, im) => {
    acc[im.statusCadastro] = (acc[im.statusCadastro] ?? 0) + 1;
    return acc;
  }, {});

  const filtrados = imoveis.filter(
    (im) =>
      !search ||
      im.nomeReferencia?.toLowerCase().includes(search.toLowerCase()) ||
      im.codigoSigpim?.toLowerCase().includes(search.toLowerCase())
  );

  const filtradosComCoordenadas = filtrados.filter(
    (im) => im.latitude != null && im.longitude != null
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Visualização georreferenciada dos imóveis — Selo GIS-SEMURH como fonte autoritativa
      </p>

      {/* Selos de contagem */}
      <div className="flex flex-wrap gap-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando imóveis...
          </div>
        ) : (
          Object.entries(contagem).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status] ?? STATUS_DOT.default}`} />
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
        {!loading && semCoordenadas.length > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            <span className="text-xs text-orange-700">Sem coordenadas</span>
            <span className="text-xs font-semibold text-orange-900">{semCoordenadas.length}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Painel lateral */}
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

          {/* Camadas */}
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

          {/* Lista de imóveis */}
          <Card className="p-4">
            <h3 className="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Imóveis na área {!loading && `(${filtrados.length})`}
            </h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : filtrados.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                {search ? "Nenhum imóvel encontrado." : "Nenhum imóvel cadastrado."}
              </p>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {filtrados.map((im) => {
                  const temPin = im.latitude != null && im.longitude != null;
                  return (
                    <div
                      key={im.id}
                      className={`flex items-start gap-2 rounded-md p-2 hover:bg-gray-50 cursor-pointer ${
                        String(im.id) === imovelIdParam ? "bg-blue-50 ring-1 ring-blue-200" : ""
                      }`}
                      onClick={() => {
                        if (temPin) {
                          setFlyTo({ lat: im.latitude!, lng: im.longitude! });
                        }
                      }}
                    >
                      <MapPin className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                        !temPin               ? "text-gray-300" :
                        im.statusCadastro === "VALIDADO"     ? "text-green-600" :
                        im.statusCadastro === "PRE_CADASTRO" ? "text-yellow-600" : "text-gray-400"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-semibold text-[#1351B4]">{im.codigoSigpim}</p>
                        <p className="text-xs text-gray-700 truncate">{im.nomeReferencia ?? "—"}</p>
                        {!temPin && (
                          <p className="text-xs text-orange-500 mt-0.5">Sem coordenadas</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Mapa Leaflet */}
        <div
          className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          style={{ minHeight: "520px" }}
        >
          <MapContainer
            center={SLZ}
            zoom={12}
            style={{ height: "100%", width: "100%", minHeight: "520px" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Pins dos imóveis com coordenadas */}
            {filtradosComCoordenadas.map((im) => (
              <Marker
                key={im.id}
                position={[im.latitude!, im.longitude!]}
                icon={ICON_MAP[im.statusCadastro] ?? ICON_MAP.default}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[160px]">
                    <p className="font-mono font-bold text-[#1351B4] text-sm">{im.codigoSigpim}</p>
                    <p className="font-medium text-gray-800">{im.nomeReferencia ?? "—"}</p>
                    <Badge
                      variant="secondary"
                      className={`text-xs mt-1 ${
                        im.statusCadastro === "VALIDADO"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {im.statusCadastro.replace("_", " ")}
                    </Badge>
                    <p className="text-gray-400 pt-1">
                      {im.latitude?.toFixed(6)}, {im.longitude?.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Voa até imóvel quando vem do deeplink ou clique na lista */}
            {flyTo && <FlyTo lat={flyTo.lat} lng={flyTo.lng} />}
          </MapContainer>

          {/* Badge de camada sobreposta ao mapa */}
          <div className="absolute bottom-3 left-3 z-[1000]">
            <Badge className="bg-white/90 text-gray-700 shadow-sm text-xs" variant="secondary">
              <Layers className="mr-1.5 h-3 w-3" />
              Camada: {camada} · Fonte: {origem.toUpperCase()}
            </Badge>
          </div>

          {/* Aviso quando nenhum imóvel tem coordenadas */}
          {!loading && filtradosComCoordenadas.length === 0 && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-xl px-6 py-4 shadow-md text-center">
                <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">
                  {search ? "Nenhum imóvel encontrado com coordenadas." : "Nenhum imóvel possui coordenadas cadastradas."}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Preencha latitude e longitude na etapa de Localização do cadastro.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
