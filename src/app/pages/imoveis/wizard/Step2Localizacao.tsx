import React, { useState, useRef } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AlertBox } from "../../../components/layout/States";
import { MapPin, Loader2 } from "lucide-react";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
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

export function CadastroImovelStep2() {
  const { etapa2, setEtapa2 } = useCadastroImovel();
  const navigate = useNavigate();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pré-cadastro: nenhum campo obrigatório — §4.2 do Manual SIGPIM
  const validar = () => {
    const e: Record<string, string> = {};
    if (etapa2.cep && etapa2.cep.replace(/\D/g, "").length !== 8)
      e.cep = "CEP deve conter 8 dígitos.";
    const coordRegex = /^-?[0-9]+(\.[0-9]+)?$/;
    if (etapa2.latitude && !coordRegex.test(etapa2.latitude))
      e.latitude = "Latitude inválida. Use formato decimal (ex: -2.5387).";
    if (etapa2.longitude && !coordRegex.test(etapa2.longitude))
      e.longitude = "Longitude inválida. Use formato decimal (ex: -44.2825).";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validar()) navigate("/dashboard/imoveis/novo/etapa-3");
  };

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

  const handleCoordenadaChange = (field: "latitude" | "longitude") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value.replace(/[^0-9.\-]/g, "");
      setEtapa2({ ...etapa2, [field]: valor });
    };

  const campo = (field: keyof typeof etapa2) => ({
    value: etapa2[field],
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) =>
      setEtapa2({ ...etapa2, [field]: ev.target.value }),
    className: erros[field] ? "border-red-400" : "",
  });

  const cepFormatado = etapa2.cep.length === 8
    ? `${etapa2.cep.slice(0, 5)}-${etapa2.cep.slice(5)}`
    : etapa2.cep;

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
          Cidade e estado são fixos (São Luís — MA). Nenhum campo é obrigatório nesta etapa.
        </AlertBox>

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
                onChange={(e) => setEtapa2({ ...etapa2, numero: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                placeholder="450"
                inputMode="numeric"
              />
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

          {/* Coordenadas GIS */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#1351B4]" />
              Coordenadas Georreferenciadas
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Opcionais mas essenciais para localização precisa no mapa. Use formato decimal.
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
                <p className="text-xs text-gray-400">Formato decimal (negativo para sul)</p>
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
                <p className="text-xs text-gray-400">Formato decimal (negativo para oeste)</p>
                {erros.longitude && <p className="text-xs text-red-500">{erros.longitude}</p>}
              </div>
            </div>

            {/* Geometria WKT — polígono do lote */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <Label>Geometria do Lote (WKT)</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1351B4] resize-none"
                rows={3}
                value={(etapa2 as any).geometriaWkt ?? ""}
                onChange={(e) => setEtapa2({ ...etapa2, geometriaWkt: e.target.value } as any)}
                placeholder="Ex: POLYGON((-44.302 -2.529, -44.301 -2.529, -44.301 -2.530, -44.302 -2.530, -44.302 -2.529))"
              />
              <p className="text-xs text-gray-400">
                Opcional. Formato WKT/WGS84. Define o polígono exato do lote.
                Se não souber, deixe em branco — pode ser preenchido depois.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}