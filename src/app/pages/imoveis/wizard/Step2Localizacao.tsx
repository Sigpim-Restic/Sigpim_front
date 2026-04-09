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
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validar()) navigate("/imoveis/novo/etapa-3");
  };

  const campo = (field: keyof typeof etapa2) => ({
    value: etapa2[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEtapa2({ ...etapa2, [field]: e.target.value }),
    className: erros[field] ? "border-red-400" : "",
  });

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
              <Input {...campo("cep")} placeholder="65000-000" />
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
              <Input {...campo("numero")} placeholder="450" />
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
              <Input {...campo("cidade")} />
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
                <Input {...campo("latitude")} placeholder="-2.5387" />
                <p className="text-xs text-gray-500">Formato decimal (negativo para sul)</p>
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input {...campo("longitude")} placeholder="-44.2825" />
                <p className="text-xs text-gray-500">Formato decimal (negativo para oeste)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}