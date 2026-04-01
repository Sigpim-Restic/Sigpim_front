import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { AlertBox } from "../../../components/layout/States";
import { Landmark } from "lucide-react";

export function CadastroImovelStep9() {
  const [formData, setFormData] = useState({
    patrimonioHistorico: "",
    tipoTombamento: "",
    numeroProcesso: "",
    observacoes: "",
  });

  return (
    <WizardLayout currentStep={9}>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
            <Landmark className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Patrimônio Histórico e Cultural
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Identificação e proteção de bens de valor histórico
            </p>
          </div>
        </div>

        <AlertBox variant="warning" title="Gate Obrigatório - Atenção Especial">
          <p className="mb-2">
            Esta etapa é obrigatória e crítica para o sistema. Imóveis
            identificados como patrimônio histórico ou cultural exigem
            tratamento especial e aprovação de órgãos competentes.
          </p>
          <p>
            Para imóveis tombados ou em processo de tombamento, será necessário
            anexar documentação específica do IPHAN, IPHAEP ou órgão municipal
            competente.
          </p>
        </AlertBox>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="patrimonioHistorico">
              O imóvel é patrimônio histórico, cultural ou tombado?{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.patrimonioHistorico}
              onValueChange={(value) =>
                setFormData({ ...formData, patrimonioHistorico: value })
              }
            >
              <SelectTrigger id="patrimonioHistorico">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">
                  Sim - É patrimônio histórico/tombado
                </SelectItem>
                <SelectItem value="processo">
                  Em processo de tombamento
                </SelectItem>
                <SelectItem value="nao">
                  Não - Não possui proteção patrimonial
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.patrimonioHistorico === "sim" ||
            formData.patrimonioHistorico === "processo") && (
            <>
              <AlertBox variant="info">
                Identificado como patrimônio histórico. As próximas informações
                são essenciais para gestão e preservação adequadas.
              </AlertBox>

              <div className="space-y-2">
                <Label htmlFor="tipoTombamento">
                  Tipo de Tombamento <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.tipoTombamento}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipoTombamento: value })
                  }
                >
                  <SelectTrigger id="tipoTombamento">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="federal">
                      Tombamento Federal (IPHAN)
                    </SelectItem>
                    <SelectItem value="estadual">
                      Tombamento Estadual (IPHAEP)
                    </SelectItem>
                    <SelectItem value="municipal">
                      Tombamento Municipal
                    </SelectItem>
                    <SelectItem value="multiplo">
                      Tombamento Múltiplo (Federal + Estadual + Municipal)
                    </SelectItem>
                    <SelectItem value="unesco">
                      Patrimônio Mundial (UNESCO)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroProcesso">
                  Número do Processo de Tombamento
                </Label>
                <input
                  id="numeroProcesso"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1351B4] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.numeroProcesso}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numeroProcesso: e.target.value,
                    })
                  }
                  placeholder="Ex: 01234.567890/2020-00"
                />
              </div>

              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-2 font-semibold text-sm text-amber-900">
                  Diretrizes para Imóveis Tombados
                </h4>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>
                    • Qualquer intervenção requer autorização prévia do órgão
                    tombador
                  </li>
                  <li>
                    • Vedada demolição ou descaracterização sem aprovação
                  </li>
                  <li>• Manutenção deve respeitar características originais</li>
                  <li>
                    • Documentação fotográfica periódica é obrigatória
                  </li>
                  <li>
                    • Alterações de uso dependem de análise técnica
                    especializada
                  </li>
                </ul>
              </div>
            </>
          )}

          {formData.patrimonioHistorico === "nao" && (
            <AlertBox variant="success">
              Imóvel não identificado como patrimônio histórico. Não há
              restrições patrimoniais específicas para este bem.
            </AlertBox>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações sobre Patrimônio Histórico
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais sobre valor histórico, características arquitetônicas, estado de conservação patrimonial..."
              rows={5}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
