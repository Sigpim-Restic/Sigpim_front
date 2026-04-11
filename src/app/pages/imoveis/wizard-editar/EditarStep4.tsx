import React from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";

export function EditarStep4() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa4, setEtapa4 } = useEditarImovel();

  const num = (field: keyof typeof etapa4, soInteiroPositivo = false) => ({
    value: etapa4[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = soInteiroPositivo
        ? e.target.value.replace(/[^0-9]/g, "")
        : e.target.value.replace(/[^0-9.]/g, "");
      setEtapa4({ ...etapa4, [field]: v });
    },
  });

  return (
    <EditarWizardLayout currentStep={4} onNext={() => navigate(`/imoveis/${id}/editar/etapa-5`)}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dados Físicos</h3>
          <p className="text-sm text-gray-500 mt-1">Dimensões, áreas e características físicas</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Área do Terreno (m²)</Label>
            <Input {...num("areaTerrenoM2")} placeholder="0,00" inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label>Área Construída (m²)</Label>
            <Input {...num("areaConstruidaM2")} placeholder="0,00" inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label>Ano de Construção</Label>
            <Input
              {...num("anoConstrucao", true)}
              placeholder="Ex: 1985"
              maxLength={4}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Número de Pavimentos</Label>
            <Input
              {...num("numeroPavimentos", true)}
              placeholder="0"
              maxLength={3}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado de Conservação</Label>
            <Select
              value={etapa4.estadoConservacaoAtual}
              onValueChange={(v) => setEtapa4({ ...etapa4, estadoConservacaoAtual: v })}
            >
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
      </div>
    </EditarWizardLayout>
  );
}
