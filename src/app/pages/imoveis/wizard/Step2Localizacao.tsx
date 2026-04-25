import React, { useState, useRef } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AlertBox } from "../../../components/layout/States";
import { Button } from "../../../components/ui/button";
import { MapPin, Loader2, Plus, Trash2 } from "lucide-react";
import { useCadastroImovel, type PontoPoligono } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

interface ViaCepResponse {
  logradouro?: string;
  bairro?: string;
  erro?: boolean;
}

async function buscarCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

// Valida se uma string é uma coordenada decimal válida
const coordRegex = /^-?[0-9]+(\.[0-9]+)?$/;
function coordValida(v: string) {
  return v.trim() !== "" && coordRegex.test(v.trim());
}

// Gera o próximo label de ponto: P001, P002, ...
function gerarLabelPonto(pontos: PontoPoligono[]): string {
  const n = pontos.length + 1;
  return `P${String(n).padStart(3, "0")}`;
}

export function CadastroImovelStep2() {
  const { etapa2, setEtapa2 } = useCadastroImovel();
  const navigate = useNavigate();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Validação ─────────────────────────────────────────────────────────────
  const validar = () => {
    const e: Record<string, string> = {};
    if (etapa2.cep && etapa2.cep.replace(/\D/g, "").length !== 8)
      e.cep = "CEP deve conter 8 dígitos.";
    if (etapa2.latitude && !coordRegex.test(etapa2.latitude))
      e.latitude = "Latitude inválida. Use formato decimal (ex: -2.5387).";
    if (etapa2.longitude && !coordRegex.test(etapa2.longitude))
      e.longitude = "Longitude inválida. Use formato decimal (ex: -44.2825).";

    // Pré-cadastro §4.2: endereço resumido OU coordenada — pelo menos um obrigatório
    const temEndereco = etapa2.logradouro.trim() !== "" || etapa2.bairro.trim() !== "";
    const temCoordenada = coordValida(etapa2.latitude) && coordValida(etapa2.longitude);
    const temPontoValido = etapa2.pontos.some(
      (p) => coordValida(p.latitude) && coordValida(p.longitude)
    );
    if (!temEndereco && !temCoordenada && !temPontoValido) {
      e._localizacao =
        "Informe pelo menos um endereço resumido (logradouro ou bairro) ou uma coordenada geográfica. Isso é obrigatório no pré-cadastro.";
    }

    // Valida pontos: se algum tem apenas uma coordenada preenchida, é inválido
    etapa2.pontos.forEach((p, i) => {
      const temLat = p.latitude.trim() !== "";
      const temLng = p.longitude.trim() !== "";
      if (temLat && !coordValida(p.latitude))
        e[`ponto_lat_${i}`] = "Latitude inválida.";
      if (temLng && !coordValida(p.longitude))
        e[`ponto_lng_${i}`] = "Longitude inválida.";
      if (temLat && !temLng)
        e[`ponto_lng_${i}`] = "Informe também a longitude.";
      if (temLng && !temLat)
        e[`ponto_lat_${i}`] = "Informe também a latitude.";
    });

    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validar()) navigate("/dashboard/imoveis/novo/etapa-3");
  };

  // ── CEP ───────────────────────────────────────────────────────────────────
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    setEtapa2({ ...etapa2, cep: digits });
    setCepNaoEncontrado(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (digits.length === 8) {
      debounceRef.current = setTimeout(async () => {
        setBuscandoCep(true);
        const data = await buscarCep(digits);
        setBuscandoCep(false);
        if (data) {
          setEtapa2((prev: typeof etapa2) => ({
            ...prev,
            cep: digits,
            logradouro: data.logradouro || prev.logradouro,
            bairro: data.bairro || prev.bairro,
            cidade: "São Luís",
          }));
        } else {
          setCepNaoEncontrado(true);
        }
      }, 500);
    }
  };

  // ── Coordenada de referência ───────────────────────────────────────────────
  const handleCoordenadaChange = (field: "latitude" | "longitude") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEtapa2({ ...etapa2, [field]: e.target.value.replace(/[^0-9.\-]/g, "") });
    };

  const campo = (field: keyof typeof etapa2) => ({
    value: etapa2[field] as string,
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) =>
      setEtapa2({ ...etapa2, [field]: ev.target.value }),
    className: erros[field] ? "border-red-400" : "",
  });

  const cepFormatado = etapa2.cep.length === 8
    ? `${etapa2.cep.slice(0, 5)}-${etapa2.cep.slice(5)}`
    : etapa2.cep;

  // ── Polígono: gerenciamento de pontos ─────────────────────────────────────
  const adicionarPonto = () => {
    const novo: PontoPoligono = {
      id: gerarLabelPonto(etapa2.pontos),
      latitude: "",
      longitude: "",
    };
    setEtapa2({ ...etapa2, pontos: [...etapa2.pontos, novo] });
  };

  const removerPonto = (index: number) => {
    const novos = etapa2.pontos
      .filter((_, i) => i !== index)
      // Renumera os labels após remoção
      .map((p, i) => ({ ...p, id: `P${String(i + 1).padStart(3, "0")}` }));
    setEtapa2({ ...etapa2, pontos: novos });
  };

  const atualizarPonto = (
    index: number,
    field: "latitude" | "longitude",
    value: string
  ) => {
    const novos = etapa2.pontos.map((p, i) =>
      i === index
        ? { ...p, [field]: value.replace(/[^0-9.\-]/g, "") }
        : p
    );
    setEtapa2({ ...etapa2, pontos: novos });
  };

  // Contagem de pontos válidos (ambas coordenadas preenchidas e válidas)
  const pontosValidos = etapa2.pontos.filter(
    (p) => coordValida(p.latitude) && coordValida(p.longitude)
  ).length;

  const podeFormarPoligono = pontosValidos >= 3;

  return (
    <WizardLayout currentStep={2} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Localização e GIS</h3>
          <p className="text-sm text-gray-600 mt-1">
            Endereço completo e coordenadas georreferenciadas do imóvel
          </p>
        </div>

        <AlertBox variant="info">
          Digite o CEP para preencher logradouro e bairro automaticamente.
          Cidade e estado são fixos (São Luís — MA).{" "}
          <strong>Ao menos um endereço ou coordenada é obrigatório</strong> nesta etapa.
        </AlertBox>

        {erros._localizacao && (
          <AlertBox variant="error">{erros._localizacao}</AlertBox>
        )}

        <div className="grid gap-6">

          {/* CEP + Logradouro */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cep">
                CEP
                {buscandoCep && <Loader2 className="inline ml-1 h-3 w-3 animate-spin text-gray-400" />}
              </Label>
              <Input
                id="cep"
                value={cepFormatado}
                onChange={handleCepChange}
                placeholder="65000-000"
                maxLength={9}
                inputMode="numeric"
                className={erros.cep ? "border-red-400" : ""}
              />
              {erros.cep && <p className="text-xs text-red-500">{erros.cep}</p>}
              {cepNaoEncontrado && (
                <p className="text-xs text-orange-500">CEP não encontrado. Preencha manualmente.</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input id="logradouro" {...campo("logradouro")} placeholder="Ex: Rua do Sol" />
            </div>
          </div>

          {/* Número + Complemento */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={etapa2.numero}
                onChange={(e) => setEtapa2({ ...etapa2, numero: e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) })}
                placeholder="450 ou 1A"
                inputMode="text"
              />
              <p className="text-xs text-gray-500">Use apenas letras e números (ex: 50B).</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input id="complemento" {...campo("complemento")} placeholder="Bloco A, Sala 201" />
            </div>
          </div>

          {/* Bairro + Cidade (fixa) + Estado (fixo) */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" {...campo("bairro")} placeholder="Centro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value="São Luís" disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" value="Maranhão" disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
          </div>

          {/* ── Coordenadas de referência ─────────────────────────────────── */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#1351B4]" />
              Ponto de Referência
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Coordenada do acesso principal ou centróide do imóvel. Use datum WGS84 e formato decimal.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={etapa2.latitude}
                  onChange={handleCoordenadaChange("latitude")}
                  placeholder="-2.5387"
                  inputMode="decimal"
                  className={erros.latitude ? "border-red-400" : ""}
                />
                <p className="text-xs text-gray-400">Negativo para sul (ex: -2.5296)</p>
                {erros.latitude && <p className="text-xs text-red-500">{erros.latitude}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={etapa2.longitude}
                  onChange={handleCoordenadaChange("longitude")}
                  placeholder="-44.2825"
                  inputMode="decimal"
                  className={erros.longitude ? "border-red-400" : ""}
                />
                <p className="text-xs text-gray-400">Negativo para oeste (ex: -44.3028)</p>
                {erros.longitude && <p className="text-xs text-red-500">{erros.longitude}</p>}
              </div>
            </div>
          </div>

          {/* ── Polígono do imóvel — pontos ───────────────────────────────── */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#1351B4]" />
                Perímetro do Imóvel (Polígono)
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarPonto}
                className="flex items-center gap-1 text-[#1351B4] border-[#1351B4] hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Adicionar ponto
              </Button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Opcional. Cadastre os vértices do imóvel em ordem (sentido horário ou anti-horário).
              Com 3 ou mais pontos válidos, o polígono é gerado automaticamente. Use datum WGS84.
            </p>

            {etapa2.pontos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
                <p className="text-sm text-gray-400">Nenhum ponto cadastrado.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Clique em "Adicionar ponto" para definir o perímetro do imóvel.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {etapa2.pontos.map((ponto, index) => (
                  <div
                    key={ponto.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center rounded-md bg-[#1351B4] px-2 py-0.5 text-xs font-semibold text-white">
                        {ponto.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerPonto(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover ponto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Latitude <span className="text-gray-400">(ex: -2.5296)</span>
                        </Label>
                        <Input
                          value={ponto.latitude}
                          onChange={(e) => atualizarPonto(index, "latitude", e.target.value)}
                          placeholder="-2.529600"
                          inputMode="decimal"
                          className={erros[`ponto_lat_${index}`] ? "border-red-400" : ""}
                        />
                        {erros[`ponto_lat_${index}`] && (
                          <p className="text-xs text-red-500">{erros[`ponto_lat_${index}`]}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Longitude <span className="text-gray-400">(ex: -44.3028)</span>
                        </Label>
                        <Input
                          value={ponto.longitude}
                          onChange={(e) => atualizarPonto(index, "longitude", e.target.value)}
                          placeholder="-44.302800"
                          inputMode="decimal"
                          className={erros[`ponto_lng_${index}`] ? "border-red-400" : ""}
                        />
                        {erros[`ponto_lng_${index}`] && (
                          <p className="text-xs text-red-500">{erros[`ponto_lng_${index}`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumo dos pontos */}
            {etapa2.pontos.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  {etapa2.pontos.length} {etapa2.pontos.length === 1 ? "ponto cadastrado" : "pontos cadastrados"}
                  {" · "}
                  {pontosValidos} {pontosValidos === 1 ? "válido" : "válidos"}
                </p>
                {podeFormarPoligono ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    ✓ Polígono será gerado
                  </span>
                ) : pontosValidos > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    Mínimo 3 pontos válidos para gerar polígono
                  </span>
                ) : null}
              </div>
            )}

            <AlertBox variant="info" className="mt-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                O polígono é salvo no banco em formato WKT/WGS84 e fica disponível no Mapa GIS.
              </span>
            </AlertBox>
          </div>

        </div>
      </div>
    </WizardLayout>
  );
}