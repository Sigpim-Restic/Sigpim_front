import React, { useState, useMemo } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { PropertyMap, Coordinate } from "../../../components/ui/property-map";
import { AlertBox } from "../../../components/layout/States";
import { Plus, Trash2, MapPin, AlertTriangle } from "lucide-react";

interface Lateral { id: number; label: string; valor: string; }
interface Ponto { id: number; lat: string; lng: string; }

let _lateralId = 3;
let _pontoId = 5;

export function CadastroImovelStep4() {
  const [areaTerreno, setAreaTerreno] = useState("");
  const [areaConstruida, setAreaConstruida] = useState("");
  const [areaUtil, setAreaUtil] = useState("");
  const [frente, setFrente] = useState("");
  const [fundo, setFundo] = useState("");
  const [laterais, setLaterais] = useState<Lateral[]>([
    { id: 1, label: "Lateral 1", valor: "" },
    { id: 2, label: "Lateral 2", valor: "" },
  ]);
  const [topografia, setTopografia] = useState("");
  const [formatoTerreno, setFormatoTerreno] = useState("");
  const [pavimentos, setPavimentos] = useState("");
  const [estadoConservacao, setEstadoConservacao] = useState("");
  const [infraestrutura, setInfraestrutura] = useState("");
  const [pontos, setPontos] = useState<Ponto[]>([
    { id: 1, lat: "", lng: "" },
    { id: 2, lat: "", lng: "" },
    { id: 3, lat: "", lng: "" },
    { id: 4, lat: "", lng: "" },
  ]);

  const adicionarLateral = () => {
    const novoId = _lateralId++;
    setLaterais(prev => [...prev, { id: novoId, label: `Lateral ${novoId - 2}`, valor: "" }]);
  };
  const removerLateral = (id: number) => {
    if (laterais.length <= 1) return;
    setLaterais(prev => prev.filter(l => l.id !== id));
  };
  const atualizarLateral = (id: number, valor: string) =>
    setLaterais(prev => prev.map(l => l.id === id ? { ...l, valor } : l));

  const adicionarPonto = () => {
    const novoId = _pontoId++;
    setPontos(prev => [...prev, { id: novoId, lat: "", lng: "" }]);
  };
  const removerPonto = (id: number) => {
    if (pontos.length <= 3) return;
    setPontos(prev => prev.filter(p => p.id !== id));
  };
  const atualizarPonto = (id: number, campo: "lat" | "lng", valor: string) =>
    setPontos(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p));

  const coordinates: Coordinate[] = useMemo(() =>
    pontos
      .map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }))
      .filter(c => !isNaN(c.lat) && !isNaN(c.lng)),
    [pontos]
  );

  const pontosValidos = pontos.filter(p => p.lat.trim() !== "" && p.lng.trim() !== "").length;

  const latValida = (val: string) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90);
  const lngValida = (val: string) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180);

  return (
    <WizardLayout currentStep={4}>
      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dados Físicos</h3>
          <p className="text-sm text-gray-500 mt-1">Dimensões, áreas e características físicas do imóvel</p>
        </div>

        {/* Áreas */}
        <section className="space-y-4 border-b border-gray-100 pb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Áreas (m²)</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Área do Terreno <span className="text-red-500">*</span></Label>
              <Input type="number" step="0.01" min="0" value={areaTerreno} onChange={e => setAreaTerreno(e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-1.5">
              <Label>Área Construída</Label>
              <Input type="number" step="0.01" min="0" value={areaConstruida} onChange={e => setAreaConstruida(e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-1.5">
              <Label>Área Útil</Label>
              <Input type="number" step="0.01" min="0" value={areaUtil} onChange={e => setAreaUtil(e.target.value)} placeholder="0,00" />
            </div>
          </div>
        </section>

        {/* Dimensões dinâmicas */}
        <section className="space-y-4 border-b border-gray-100 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dimensões do Terreno (metros)</h4>
              <p className="text-xs text-gray-400 mt-0.5">Frente e Fundo são fixos. Adicione quantas laterais o terreno tiver.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={adicionarLateral} className="shrink-0 border-[#1351B4] text-[#1351B4] hover:bg-blue-50">
              <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar lateral
            </Button>
          </div>

          {/* Frente e Fundo fixos */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Frente</Label>
              <Input type="number" step="0.01" min="0" value={frente} onChange={e => setFrente(e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-1.5">
              <Label>Fundo</Label>
              <Input type="number" step="0.01" min="0" value={fundo} onChange={e => setFundo(e.target.value)} placeholder="0,00" />
            </div>
          </div>

          {/* Laterais dinâmicas */}
          <div className="grid gap-4 sm:grid-cols-2">
            {laterais.map(lat => (
              <div key={lat.id} className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label>{lat.label}</Label>
                  <Input type="number" step="0.01" min="0" value={lat.valor} onChange={e => atualizarLateral(lat.id, e.target.value)} placeholder="0,00" />
                </div>
                {laterais.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removerLateral(lat.id)} className="mb-0.5 h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50" title="Remover lateral">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Total: {2 + laterais.length} lados — frente + fundo + {laterais.length} {laterais.length === 1 ? "lateral" : "laterais"}
          </p>
        </section>

        {/* Características */}
        <section className="space-y-4 border-b border-gray-100 pb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Características físicas</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Topografia</Label>
              <Select value={topografia} onValueChange={setTopografia}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plano">Plano</SelectItem>
                  <SelectItem value="aclive">Aclive</SelectItem>
                  <SelectItem value="declive">Declive</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="alagadico">Alagadiço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Formato do Terreno</Label>
              <Select value={formatoTerreno} onValueChange={setFormatoTerreno}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="esquina">Esquina</SelectItem>
                  <SelectItem value="encravado">Encravado</SelectItem>
                  <SelectItem value="poligonal">Poligonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Número de Pavimentos</Label>
              <Input type="number" min="0" step="1" value={pavimentos} onChange={e => setPavimentos(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Estado de Conservação <span className="text-red-500">*</span></Label>
              <Select value={estadoConservacao} onValueChange={setEstadoConservacao}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OTIMO">Ótimo</SelectItem>
                  <SelectItem value="BOM">Bom</SelectItem>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="RUIM">Ruim</SelectItem>
                  <SelectItem value="PESSIMO">Péssimo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Infraestrutura Disponível</Label>
            <Textarea value={infraestrutura} onChange={e => setInfraestrutura(e.target.value)} placeholder="Descreva: água, esgoto, energia, pavimentação, iluminação pública, etc." rows={2} />
          </div>
        </section>

        {/* Coordenadas dinâmicas */}
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordenadas do Terreno</h4>
              <p className="text-xs text-gray-400 mt-0.5">Vértices do polígono — adicione quantos pontos o terreno tiver (mínimo 3)</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={adicionarPonto} className="shrink-0 border-[#1351B4] text-[#1351B4] hover:bg-blue-50">
              <Plus className="mr-1.5 h-3.5 w-3.5" />Adicionar ponto
            </Button>
          </div>

          <div className="space-y-3">
            {pontos.map((ponto, index) => {
              const label = `P${String(index + 1).padStart(3, "0")}`;
              const latOk = latValida(ponto.lat);
              const lngOk = lngValida(ponto.lng);
              const temErro = !latOk || !lngOk;

              return (
                <div key={ponto.id} className={`rounded-lg border bg-gray-50 p-4 transition-colors ${temErro ? "border-red-200 bg-red-50/30" : "border-gray-200"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-14 items-center justify-center rounded bg-[#1351B4]/10 font-mono text-xs font-semibold text-[#1351B4]">
                        {label}
                      </span>
                      {temErro && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <AlertTriangle className="h-3 w-3" />Coordenada inválida
                        </span>
                      )}
                    </div>
                    {pontos.length > 3 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removerPonto(ponto.id)} className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50" title="Remover ponto">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-600">Latitude <span className="text-gray-400">(ex: -2.5296)</span></Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={ponto.lat}
                        onChange={e => atualizarPonto(ponto.id, "lat", e.target.value)}
                        placeholder="-2.529600"
                        className={!latOk ? "border-red-300 focus-visible:ring-red-300" : ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-600">Longitude <span className="text-gray-400">(ex: -44.3028)</span></Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={ponto.lng}
                        onChange={e => atualizarPonto(ponto.id, "lng", e.target.value)}
                        placeholder="-44.302800"
                        className={!lngOk ? "border-red-300 focus-visible:ring-red-300" : ""}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400">
            {pontos.length} {pontos.length === 1 ? "ponto" : "pontos"} cadastrados · {pontosValidos} com coordenadas válidas
            {pontos.length < 3 && <span className="ml-2 text-amber-600 font-medium">— mínimo 3 pontos para um polígono</span>}
          </p>

          {coordinates.length >= 3 && (
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Pré-visualização do polígono</p>
              <PropertyMap points={coordinates} />
            </div>
          )}

          <AlertBox variant="info">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm">O mapa atualiza automaticamente conforme você preenche as coordenadas. Use datum WGS84. Mínimo de 3 pontos para exibir o polígono.</p>
            </div>
          </AlertBox>
        </section>
      </div>
    </WizardLayout>
  );
}
