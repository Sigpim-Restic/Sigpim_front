import React from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

export function CadastroImovelStep7() {
  const { etapa7, setEtapa7 } = useCadastroImovel();
  const navigate = useNavigate();

  // Pré-cadastro: nenhum campo obrigatório — §4.2 do Manual SIGPIM
  const handleNext = () => navigate("/dashboard/imoveis/novo/etapa-8");

  return (
    <WizardLayout currentStep={7} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dominial e Regularização</h3>
          <p className="text-sm text-gray-600 mt-1">
            Informações sobre registro, titularidade e situação dominial
          </p>
        </div>

        <AlertBox variant="warning">
          Para imóveis com registro, será necessário anexar cópias da matrícula e demais
          documentos de titularidade na etapa de anexos.
        </AlertBox>

        <div className="grid gap-6">
          {/* Situação dominial */}
          <div className="space-y-2">
            <Label>Situação Dominial</Label>
            <Select
              value={etapa7.situacaoDominial}
              onValueChange={(v) => setEtapa7({ ...etapa7, situacaoDominial: v })}
            >
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="IRREGULAR">Irregular</SelectItem>
                <SelectItem value="EM_APURACAO">Em Apuração</SelectItem>
                <SelectItem value="EM_LITIGIO">Em Litígio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Matrícula e cartório */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Número da Matrícula</Label>
              <Input
                value={etapa7.matriculaRegistro}
                onChange={(e) => setEtapa7({ ...etapa7, matriculaRegistro: e.target.value })}
                placeholder="Ex: 12345"
              />
            </div>
            <div className="space-y-2">
              <Label>Cartório de Registro</Label>
              <Input
                value={etapa7.cartorio}
                onChange={(e) => setEtapa7({ ...etapa7, cartorio: e.target.value })}
                placeholder="Ex: 1º Ofício de Registro de Imóveis"
              />
            </div>
          </div>

          {/* Inscrição imobiliária */}
          <div className="space-y-2">
            <Label>Inscrição Imobiliária (SEMFAZ)</Label>
            <Input
              value={etapa7.inscricaoImobiliaria}
              onChange={(e) => setEtapa7({ ...etapa7, inscricaoImobiliaria: e.target.value })}
              placeholder="Ex: 01.234.567-8"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações sobre Regularização</Label>
            <Textarea
              value={etapa7.observacoes}
              onChange={(e) => setEtapa7({ ...etapa7, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre a situação dominial, processos de regularização, disputas judiciais, etc."
              rows={3}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}