import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { AlertBox } from "../../../components/layout/States";
import { MapPin } from "lucide-react";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";

export function EditarStep2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa2, setEtapa2 } = useEditarImovel();
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (etapa2.cep && etapa2.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP deve conter 8 dígitos.";
    const re = /^-?[0-9]+(\.[0-9]+)?$/;
    if (etapa2.latitude && !re.test(etapa2.latitude)) e.latitude = "Latitude inválida. Use formato decimal (ex: -2.5387).";
    if (etapa2.longitude && !re.test(etapa2.longitude)) e.longitude = "Longitude inválida. Use formato decimal (ex: -44.2825).";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validar()) navigate(`/imoveis/${id}/editar/etapa-3`);
  };

  const campo = (field: keyof typeof etapa2) => ({
    value: etapa2[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEtapa2({ ...etapa2, [field]: e.target.value }),
    className: erros[field] ? "border-red-400" : "",
  });

  return (
    <EditarWizardLayout currentStep={2} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
          <p className="text-sm text-gray-600 mt-1">Endereço completo e coordenadas do imóvel</p>
        </div>

        <AlertBox variant="info">
          Coordenadas GIS são opcionais mas necessárias para o pin no mapa. Use formato decimal.
        </AlertBox>

        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={etapa2.cep}
                onChange={(e) => setEtapa2({ ...etapa2, cep: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                placeholder="65000000"
                maxLength={8}
                inputMode="numeric"
                className={erros.cep ? "border-red-400" : ""}
              />
              {erros.cep && <p className="text-xs text-red-500">{erros.cep}</p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Logradouro</Label>
              <Input {...campo("logradouro")} placeholder="Ex: Rua do Sol" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                value={etapa2.numero}
                onChange={(e) => setEtapa2({ ...etapa2, numero: e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) })}
                placeholder="450 ou 1A"
                inputMode="text"
              />
              <p className="text-xs text-gray-500">Use apenas letras e números (ex: 50B).</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Complemento</Label>
              <Input {...campo("complemento")} placeholder="Bloco A, Sala 201" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input {...campo("bairro")} placeholder="Centro" />
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
                  onChange={(e) => setEtapa2({ ...etapa2, latitude: e.target.value.replace(/[^0-9.\-]/g, "") })}
                  placeholder="-2.5387"
                  inputMode="decimal"
                  className={erros.latitude ? "border-red-400" : ""}
                />
                {erros.latitude && <p className="text-xs text-red-500">{erros.latitude}</p>}
                <p className="text-xs text-gray-500">Formato decimal (negativo para sul)</p>
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  value={etapa2.longitude}
                  onChange={(e) => setEtapa2({ ...etapa2, longitude: e.target.value.replace(/[^0-9.\-]/g, "") })}
                  placeholder="-44.2825"
                  inputMode="decimal"
                  className={erros.longitude ? "border-red-400" : ""}
                />
                {erros.longitude && <p className="text-xs text-red-500">{erros.longitude}</p>}
                <p className="text-xs text-gray-500">Formato decimal (negativo para oeste)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditarWizardLayout>
  );
}
