// Etapa 8 — Patrimônio Histórico e Cultural (editar)
import React from "react";
import { useNavigate, useParams } from "react-router";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { AlertBox } from "../../../components/layout/States";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";
import { Landmark } from "lucide-react";

export function EditarStep8() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa8, setEtapa8 } = useEditarImovel();

  const handleNext = () => navigate(`/dashboard/imoveis/${id}/editar/etapa-9`);

  const temProtecao = etapa8.tombadoHistorico || etapa8.tombadoCultural;

  return (
    <EditarWizardLayout currentStep={8} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 shrink-0">
            <Landmark className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Patrimônio Histórico e Cultural</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Identificação e proteção de bens de valor histórico ou cultural
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-1">
          <p className="text-sm font-semibold text-orange-800">⚠ Gate Obrigatório — Atenção Especial</p>
          <p className="text-xs text-orange-700">
            Qualquer intervenção estrutural (N1 ou superior) em imóvel com proteção
            patrimonial exige aprovação prévia da FUMPH.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Item 3: dois flags independentes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Tipo de proteção patrimonial
            </Label>
            <p className="text-xs text-gray-500 -mt-1">
              Selecione todas as categorias aplicáveis ao imóvel.
            </p>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <Checkbox
                id="edit-tombado-historico"
                checked={etapa8.tombadoHistorico}
                onCheckedChange={(checked) =>
                  setEtapa8({ ...etapa8, tombadoHistorico: Boolean(checked) })
                }
                className="mt-0.5"
              />
              <div>
                <label htmlFor="edit-tombado-historico" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Tombamento histórico / patrimonial
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tombamento municipal, estadual, federal, inventariado ou área de entorno.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <Checkbox
                id="edit-tombado-cultural"
                checked={etapa8.tombadoCultural}
                onCheckedChange={(checked) =>
                  setEtapa8({ ...etapa8, tombadoCultural: Boolean(checked) })
                }
                className="mt-0.5"
              />
              <div>
                <label htmlFor="edit-tombado-cultural" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Proteção cultural
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Imóvel de interesse cultural, patrimônio imaterial vinculado ao bem ou similar.
                </p>
              </div>
            </div>
          </div>

          {temProtecao && (
            <AlertBox variant="warning">
              Acesse os detalhes do imóvel → aba Intervenções para registrar
              o parecer FUMPH antes de iniciar qualquer obra.
            </AlertBox>
          )}

          <div className="space-y-2">
            <Label>Observações sobre Patrimônio</Label>
            <Textarea
              value={etapa8.observacoes}
              onChange={(e) => setEtapa8({ ...etapa8, observacoes: e.target.value })}
              placeholder="Referência do ato de tombamento, características arquitetônicas relevantes..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </EditarWizardLayout>
  );
}
