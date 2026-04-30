import React from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { AlertBox } from "../../../components/layout/States";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";
import { Landmark } from "lucide-react";

export function CadastroImovelStep8() {
  const { etapa8, setEtapa8 } = useCadastroImovel();
  const navigate = useNavigate();

  const handleNext = () => navigate("/dashboard/imoveis/novo/etapa-9");

  const temProtecao = etapa8.tombadoHistorico || etapa8.tombadoCultural;

  return (
    <WizardLayout currentStep={8} onNext={handleNext}>
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
            Imóveis identificados como patrimônio histórico ou cultural exigem tratamento
            especial e aprovação da FUMPH para qualquer intervenção estrutural (N1 ou superior).
          </p>
          <p className="text-xs text-orange-700">
            Para imóveis tombados ou em processo de tombamento, será necessário anexar
            documentação específica do IPHAN, IPHAEP ou órgão municipal competente.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Item 3: dois flags independentes substituem o select único */}
          {/* Um imóvel pode ser tombado historicamente OU culturalmente OU ambos ao mesmo tempo */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">
              Tipo de proteção patrimonial
            </Label>
            <p className="text-xs text-gray-500 -mt-1">
              Selecione todas as categorias aplicáveis ao imóvel.
            </p>

            {/* Tombamento histórico */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <Checkbox
                id="tombado-historico"
                checked={etapa8.tombadoHistorico}
                onCheckedChange={(checked) =>
                  setEtapa8({ ...etapa8, tombadoHistorico: Boolean(checked) })
                }
                className="mt-0.5"
              />
              <div>
                <label
                  htmlFor="tombado-historico"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Tombamento histórico / patrimonial
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tombamento municipal, estadual, federal, inventariado ou área de entorno.
                </p>
              </div>
            </div>

            {/* Proteção cultural */}
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <Checkbox
                id="tombado-cultural"
                checked={etapa8.tombadoCultural}
                onCheckedChange={(checked) =>
                  setEtapa8({ ...etapa8, tombadoCultural: Boolean(checked) })
                }
                className="mt-0.5"
              />
              <div>
                <label
                  htmlFor="tombado-cultural"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Proteção cultural
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Imóvel de interesse cultural, patrimônio imaterial vinculado ao bem ou similar.
                </p>
              </div>
            </div>
          </div>

          {/* Aviso condicional — aparece quando qualquer proteção está marcada */}
          {temProtecao && (
            <AlertBox variant="warning">
              Após o cadastro, acesse os detalhes do imóvel → aba Intervenções para registrar
              o parecer FUMPH antes de iniciar qualquer obra.
            </AlertBox>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações sobre Patrimônio Histórico</Label>
            <Textarea
              value={etapa8.observacoes}
              onChange={(e) => setEtapa8({ ...etapa8, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre valor histórico, características arquitetônicas, estado de conservação patrimonial, referência do ato de tombamento..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}