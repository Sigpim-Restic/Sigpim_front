import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

export function CadastroImovelStep6() {
  const { etapa6, setEtapa6 } = useCadastroImovel();
  const navigate = useNavigate();

  // Pré-cadastro: nenhum campo obrigatório — §4.2 do Manual SIGPIM
  const handleNext = () => navigate("/dashboard/imoveis/novo/etapa-7");

  return (
    <WizardLayout currentStep={6} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Instrumentos e Contratos</h3>
          <p className="text-sm text-gray-600 mt-1">
            Contratos, cessões, comodatos e demais instrumentos jurídicos
          </p>
        </div>

        <AlertBox variant="info">
          Imóvel ocupado sem instrumento gera pendência crítica automática após o cadastro.
          Preencha o que souber agora ou registre depois nos detalhes do imóvel.
        </AlertBox>

        <div className="grid gap-6">
          {/* Possui instrumento? */}
          <div className="space-y-2">
            <Label>Possui Contrato/Instrumento?</Label>
            <Select
              value={etapa6.possuiInstrumento}
              onValueChange={(v) => setEtapa6({ ...etapa6, possuiInstrumento: v })}
            >
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SIM">Sim</SelectItem>
                <SelectItem value="NAO">Não</SelectItem>
                <SelectItem value="EM_ELABORACAO">Em elaboração</SelectItem>
                <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos condicionais */}
          {etapa6.possuiInstrumento === "SIM" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Instrumento</Label>
                  <Select
                    value={etapa6.tipoInstrumento}
                    onValueChange={(v) => setEtapa6({ ...etapa6, tipoInstrumento: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CESSAO_USO">Cessão de Uso</SelectItem>
                      <SelectItem value="COMODATO">Comodato</SelectItem>
                      <SelectItem value="PERMISSAO_USO">Permissão de Uso</SelectItem>
                      <SelectItem value="LOCACAO">Locação</SelectItem>
                      <SelectItem value="TERMO_RESPONSABILIDADE">Termo de Responsabilidade</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número/Identificação</Label>
                  <Input
                    value={etapa6.numeroInstrumento}
                    onChange={(e) => setEtapa6({ ...etapa6, numeroInstrumento: e.target.value })}
                    placeholder="Ex: Termo de Cessão nº 001/2024"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Data de Assinatura</Label>
                  <Input
                    type="date"
                    value={etapa6.dataAssinatura}
                    onChange={(e) => setEtapa6({ ...etapa6, dataAssinatura: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Início de Vigência</Label>
                  <Input
                    type="date"
                    value={etapa6.dataInicio}
                    onChange={(e) => setEtapa6({ ...etapa6, dataInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim de Vigência</Label>
                  <Input
                    type="date"
                    value={etapa6.dataVencimento}
                    onChange={(e) => setEtapa6({ ...etapa6, dataVencimento: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Observações sempre visível */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={etapa6.observacoes}
              onChange={(e) => setEtapa6({ ...etapa6, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre contratos e instrumentos..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}