import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AlertBox } from "../../../components/layout/States";
import { MapPin } from "lucide-react";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

export function CadastroImovelStep2() {
  const { etapa2, setEtapa2 } = useCadastroImovel();
  const navigate = useNavigate();
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (!etapa2.logradouro.trim()) e.logradouro = "Logradouro é obrigatório.";
    if (!etapa2.numero.trim()) e.numero = "Número é obrigatório.";
    if (!etapa2.bairro.trim()) e.bairro = "Bairro é obrigatório.";
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
    if (validar()) navigate("/imoveis/novo/etapa-3");
  };

  // Handler genérico para campos simples
  const campo = (field: keyof typeof etapa2) => ({
    value: etapa2[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEtapa2({ ...etapa2, [field]: e.target.value }),
    className: erros[field] ? "border-red-400" : "",
  });

  // Handler específico do CEP: aceita apenas dígitos e limita a 8 caracteres
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apenasDigitos = e.target.value.replace(/\D/g, "").slice(0, 8);
    setEtapa2({ ...etapa2, cep: apenasDigitos });
  };

  // Handler específico do Número: aceita apenas dígitos e limita a 10 caracteres
  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apenasDigitos = e.target.value.replace(/\D/g, "").slice(0, 10);
    setEtapa2({ ...etapa2, numero: apenasDigitos });
  };

  // Handler para coordenadas: permite apenas dígitos, sinal negativo e ponto decimal
  const handleCoordenadaChange = (field: "latitude" | "longitude") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value.replace(/[^0-9.\-]/g, "");
      setEtapa2({ ...etapa2, [field]: valor });
    };

  return (
    <WizardLayout currentStep={2} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
          <p className="text-sm text-gray-600 mt-1">Endereço completo e coordenadas do imóvel</p>
        </div>

        <AlertBox variant="info">
          Coordenadas GIS são opcionais mas recomendadas para o mapa.
          Use formato decimal (ex: -2.5387, -44.2825).
        </AlertBox>

        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={etapa2.cep}
                onChange={handleCepChange}
                placeholder="65000000"
                maxLength={8}
                inputMode="numeric"
                className={erros.cep ? "border-red-400" : ""}
              />
              {erros.cep && <p className="text-xs text-red-500">{erros.cep}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Logradouro <span className="text-red-600">*</span></Label>
              <Input {...campo("logradouro")} placeholder="Ex: Rua do Sol" />
              {erros.logradouro && <p className="text-xs text-red-500">{erros.logradouro}</p>}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Número <span className="text-red-600">*</span></Label>
              <Input
                value={etapa2.numero}
                onChange={handleNumeroChange}
                placeholder="450"
                maxLength={10}
                inputMode="numeric"
                className={erros.numero ? "border-red-400" : ""}
              />
              {erros.numero && <p className="text-xs text-red-500">{erros.numero}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Complemento</Label>
              <Input {...campo("complemento")} placeholder="Bloco A, Sala 201" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Bairro <span className="text-red-600">*</span></Label>
              <Input {...campo("bairro")} placeholder="Centro" />
              {erros.bairro && <p className="text-xs text-red-500">{erros.bairro}</p>}
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value="São Luís" disabled />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value="MA" disabled />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#1351B4]" />
              Coordenadas GIS (opcional)
            </h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                value={etapa2.latitude}
                onChange={handleCoordenadaChange("latitude")}
                placeholder="-2.5387"
                inputMode="decimal"
                className={erros.latitude ? "border-red-400" : ""}
              />
                <p className="text-xs text-gray-500">Formato decimal (negativo para sul)</p>
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                value={etapa2.longitude}
                onChange={handleCoordenadaChange("longitude")}
                placeholder="-44.2825"
                inputMode="decimal"
                className={erros.longitude ? "border-red-400" : ""}
              />
                <p className="text-xs text-gray-500">Formato decimal (negativo para oeste)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}