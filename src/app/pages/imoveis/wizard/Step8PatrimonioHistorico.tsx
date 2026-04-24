import React from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";
import { Landmark } from "lucide-react";

export function CadastroImovelStep8() {
  const { etapa8, setEtapa8 } = useCadastroImovel();
  const navigate = useNavigate();

  const handleNext = () => navigate("/dashboard/imoveis/novo/etapa-9");

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
              Identificação e proteção de bens de valor histórico
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
          {/* É patrimônio histórico? */}
          <div className="space-y-2">
            <Label>O imóvel é patrimônio histórico, cultural ou tombado?</Label>
            <Select
              value={etapa8.imovelHistorico}
              onValueChange={(v) => setEtapa8({ ...etapa8, imovelHistorico: v })}
            >
              <SelectTrigger><SelectValue placeholder="Selecione uma opção" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NAO">Não</SelectItem>
                <SelectItem value="SIM_TOMBADO">Sim — Tombado</SelectItem>
                <SelectItem value="SIM_EM_PROCESSO">Sim — Em processo de tombamento</SelectItem>
                <SelectItem value="SIM_INVENTARIADO">Sim — Inventariado (sem tombamento)</SelectItem>
                <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos condicionais para imóveis históricos */}
          {etapa8.imovelHistorico && etapa8.imovelHistorico !== "NAO" && etapa8.imovelHistorico !== "DESCONHECIDO" && (
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
              placeholder="Informações adicionais sobre valor histórico, características arquitetônicas, estado de conservação patrimonial..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}