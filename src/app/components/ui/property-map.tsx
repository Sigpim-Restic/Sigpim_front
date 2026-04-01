import React, { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para ícones padrão do Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetinaUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface Coordinate {
  lat: number;
  lng: number;
}

interface PropertyMapProps {
  points: Coordinate[];
  className?: string;
}

export function PropertyMap({ points, className = "" }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonRef = useRef<L.Polygon | null>(null);

  // Centro padrão: São Luís - MA
  const defaultCenter: [number, number] = [-2.5296, -44.3028];

  // Determinar tipo de geometria baseado no número de pontos
  const geometryType = useMemo(() => {
    if (points.length < 3) return "Pontos insuficientes";
    if (points.length === 3) return "Triângulo";
    if (points.length === 4) return "Quadrilátero";
    if (points.length === 5) return "Pentágono";
    return "Polígono irregular";
  }, [points.length]);

  // Inicializar o mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      scrollWheelZoom: true,
      dragging: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualizar marcadores e polígono quando os pontos mudarem
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remover marcadores existentes
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remover polígono existente
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    // Adicionar novos marcadores
    if (points.length > 0) {
      points.forEach((point, index) => {
        const marker = L.marker([point.lat, point.lng], {
          title: `P${String(index + 1).padStart(3, "0")}`,
        }).addTo(map);

        marker.bindPopup(`<b>P${String(index + 1).padStart(3, "0")}</b><br>
          Lat: ${point.lat.toFixed(6)}<br>
          Lng: ${point.lng.toFixed(6)}`);

        markersRef.current.push(marker);
      });

      // Adicionar polígono se houver 3 ou mais pontos
      if (points.length >= 3) {
        const polygon = L.polygon(
          points.map((p) => [p.lat, p.lng]),
          {
            color: "#1351B4",
            fillColor: "#1351B4",
            fillOpacity: 0.2,
            weight: 3,
          }
        ).addTo(map);

        polygonRef.current = polygon;
      }

      // Ajustar o zoom para mostrar todos os pontos
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Voltar ao centro padrão se não houver pontos
      map.setView(defaultCenter, 13);
    }
  }, [points]);

  return (
    <div className={`relative ${className}`}>
      {/* Informações sobre a geometria */}
      {points.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000] rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-md">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#1351B4]" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {points.length} {points.length === 1 ? "ponto" : "pontos"}
              </span>
              {points.length >= 3 && (
                <span className="ml-2 text-gray-600">• {geometryType}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aviso quando não há pontos suficientes */}
      {points.length > 0 && points.length < 3 && (
        <div className="absolute top-16 left-4 z-[1000] rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 shadow-md">
          <p className="text-xs text-yellow-800">
            Adicione pelo menos 3 pontos para formar um polígono
          </p>
        </div>
      )}

      {/* Mapa */}
      <div className="h-full w-full overflow-hidden rounded-lg border border-gray-300">
        <div
          ref={mapRef}
          style={{ height: "400px", width: "100%" }}
          className="z-0"
        />
      </div>

      {/* Estado vazio */}
      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-50/90 pointer-events-none">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <svg
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">
              Nenhum ponto cadastrado
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Preencha as coordenadas dos pontos para visualizar o terreno
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
