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
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

interface Lateral { id: number; label: string; valor: string; }
interface Ponto { id: number; lat: string; lng: string; }

let _lateralId = 3;
let _pontoId = 5;

export function CadastroImovelStep4() {
  const { etapa4, setEtapa4 } = useCadastroImovel();
  const navigate = useNavigate();

  // Campos extras que ficam apenas na UI (não enviados ao back ainda)
  const [frente, setFrente] = useState("");
  const [fundo, setFundo] = useState("");
  const [laterais, setLaterais] = useState<Lateral[]>([
    { id: 1, label: "Lateral 1", valor: "" },
    { id: 2, label: "Lateral 2", valor: "" },
  ]);
  const [topografia, setTopografia] = useState("");
  const [formatoTerreno, setFormatoTerreno] = useState("");
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
  const atualizarPonto = (id: number, campo: "lat" | "lng", valor: string) => {
    const sanitizado = valor.replace(/[^0-9.\-]/g, "");
    setPontos(prev => prev.map(p => p.id === id ? { ...p, [campo]: sanitizado } : p));
  };

  const coordinates: Coordinate[] = useMemo(() =>
    pontos
      .map(p => ({ lat: parseFloat(p.lat), lng: parseFloat(p.lng) }))
      .filter(c => !isNaN(c.lat) && !isNaN(c.lng)),
    [pontos]
  );

  const pontosValidos = pontos.filter(p => p.lat.trim() !== "" && p.lng.trim() !== "").length;
  const latValida = (val: string) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90);
  const lngValida = (val: string) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180);

  const campo = (field: keyof typeof etapa4) => ({
    value: etapa4[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEtapa4({ ...etapa4, [field]: e.target.value }),
  });

  return (
    <WizardLayout currentStep={4} onNext={() => navigate("/dashboard/imoveis/novo/etapa-5")}>
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
              <Label>Área do Terreno</Label>
              <Input
                type="text"
                inputMode="decimal"
                maxLength={12}
                {...campo("areaTerrenoM2")}
                placeholder="0,00"
                onChange={e => setEtapa4({ ...etapa4, areaTerrenoM2: e.target.value.replace(/[^0-9.]/g, "") })}
                onBlur={e => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) setEtapa4({ ...etapa4, areaTerrenoM2: String(v) });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Área Construída
                <span className="ml-1.5 text-xs font-normal text-gray-400">(0 para terreno baldio)</span>
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                maxLength={12}
                {...campo("areaConstruidaM2")}
                placeholder="0,00"
                onChange={e => setEtapa4({ ...etapa4, areaConstruidaM2: e.target.value.replace(/[^0-9.]/g, "") })}
                onBlur={e => {
                  // Permite "0" explicitamente — não converte string vazia em 0
                  const raw = e.target.value;
                  if (raw === "" || raw === "0") return;
                  const v = parseFloat(raw);
                  if (!isNaN(v)) setEtapa4({ ...etapa4, areaConstruidaM2: String(v) });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ano de Construção</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={4}
                {...campo("anoConstrucao")}
                placeholder="Ex: 1985"
                onChange={e => setEtapa4({ ...etapa4, anoConstrucao: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })}
                onBlur={e => {
                  const ano = parseInt(e.target.value, 10);
                  if (e.target.value && (ano < 1500 || ano > new Date().getFullYear() + 1)) {
                    setEtapa4({ ...etapa4, anoConstrucao: "" });
                  }
                }}
              />
              {etapa4.anoConstrucao && (() => {
                const ano = parseInt(etapa4.anoConstrucao, 10);
                if (etapa4.anoConstrucao.length === 4 && (ano < 1500 || ano > new Date().getFullYear() + 1))
                  return <p className="text-xs text-red-500">Ano deve ser entre 1500 e {new Date().getFullYear() + 1}.</p>;
                return null;
              })()}
            </div>
          </div>
        </section>

        {/* Concessionárias */}
        <section className="space-y-4 border-b border-gray-100 pb-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Concessionárias</h4>
          <p className="text-xs text-gray-400 -mt-2">Registros de medição junto às concessionárias (opcional)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Registro de Energia</Label>
              <Input
                placeholder="Nº do medidor / UC de energia"
                value={etapa4.registroEnergia}
                onChange={e => setEtapa4({ ...etapa4, registroEnergia: e.target.value })}
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Registro de Água</Label>
              <Input
                placeholder="Nº do hidrômetro / matrícula CAEMA"
                value={etapa4.registroAgua}
                onChange={e => setEtapa4({ ...etapa4, registroAgua: e.target.value })}
                maxLength={50}
              />
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Frente</Label>
              <Input
                type="text" inputMode="decimal" maxLength={10} value={frente}
                onChange={e => setFrente(e.target.value.replace(/[^0-9.]/g, ""))}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setFrente(String(v)); }}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fundo</Label>
              <Input
                type="text" inputMode="decimal" maxLength={10} value={fundo}
                onChange={e => setFundo(e.target.value.replace(/[^0-9.]/g, ""))}
                onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setFundo(String(v)); }}
                placeholder="0,00"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {laterais.map(lat => (
              <div key={lat.id} className="flex items-end gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label>{lat.label}</Label>
                  <Input
                    type="text" inputMode="decimal" maxLength={10} value={lat.valor}
                    onChange={e => atualizarLateral(lat.id, e.target.value.replace(/[^0-9.]/g, ""))}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) atualizarLateral(lat.id, String(v)); }}
                    placeholder="0,00"
                  />
                </div>
                {laterais.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removerLateral(lat.id)} className="mb-0.5 h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
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
              <Input
                type="text" inputMode="numeric" maxLength={3}
                {...campo("numeroPavimentos")}
                placeholder="0"
                onChange={e => setEtapa4({ ...etapa4, numeroPavimentos: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })}
                onBlur={e => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) setEtapa4({ ...etapa4, numeroPavimentos: String(v) });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Estado de Conservação</Label>
              <Select value={etapa4.estadoConservacaoAtual} onValueChange={v => setEtapa4({ ...etapa4, estadoConservacaoAtual: v })}>
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

        {/* Coordenadas do terreno */}
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordenadas do Terreno</h4>
              <p className="text-xs text-gray-400 mt-0.5">Vértices do polígono — mínimo 3 pontos</p>
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
                      <span className="inline-flex h-6 w-14 items-center justify-center rounded bg-[#1351B4]/10 font-mono text-xs font-semibold text-[#1351B4]">{label}</span>
                      {temErro && (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <AlertTriangle className="h-3 w-3" />Coordenada inválida
                        </span>
                      )}
                    </div>
                    {pontos.length > 3 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removerPonto(ponto.id)} className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-600">Latitude <span className="text-gray-400">(ex: -2.5296)</span></Label>
                      <Input
                        type="text" inputMode="decimal" maxLength={12} value={ponto.lat}
                        onChange={e => atualizarPonto(ponto.id, "lat", e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) atualizarPonto(ponto.id, "lat", String(v)); }}
                        placeholder="-2.529600"
                        className={!latOk ? "border-red-300" : ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-600">Longitude <span className="text-gray-400">(ex: -44.3028)</span></Label>
                      <Input
                        type="text" inputMode="decimal" maxLength={12} value={ponto.lng}
                        onChange={e => atualizarPonto(ponto.id, "lng", e.target.value)}
                        onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) atualizarPonto(ponto.id, "lng", String(v)); }}
                        placeholder="-44.302800"
                        className={!lngOk ? "border-red-300" : ""}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            {pontos.length} pontos cadastrados · {pontosValidos} válidos
            {pontos.length < 3 && <span className="ml-2 text-amber-600 font-medium">— mínimo 3 para exibir o polígono</span>}
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
              <p className="text-sm">O mapa atualiza automaticamente conforme você preenche as coordenadas. Use datum WGS84.</p>
            </div>
          </AlertBox>
        </section>
      </div>
    </WizardLayout>
  );
}