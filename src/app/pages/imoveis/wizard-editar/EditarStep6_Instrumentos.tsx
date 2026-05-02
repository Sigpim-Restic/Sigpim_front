// Etapa 6 — Instrumentos e Contratos (editar)
import React from "react";
import { useNavigate, useParams } from "react-router";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";

export function EditarStep6() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa6, setEtapa6 } = useEditarImovel();

  const handleNext = () => navigate(`/dashboard/imoveis/${id}/editar/etapa-7`);

  return (
    <EditarWizardLayout currentStep={6} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Instrumentos e Contratos</h3>
          <p className="text-sm text-gray-600 mt-1">
            Contratos, cessões, comodatos e demais instrumentos jurídicos
          </p>
        </div>

        <AlertBox variant="info">
          Imóvel ocupado sem instrumento gera pendência crítica automática.
          Preencha o que souber ou registre depois nos detalhes do imóvel.
        </AlertBox>

        <div className="grid gap-6">
          {/* Possui instrumento? */}
          <div className="space-y-2">
            <Label>Possui Contrato / Instrumento?</Label>
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
                      <SelectItem value="CONCESSAO_USO">Concessão de Uso</SelectItem>
                      <SelectItem value="AUTORIZACAO_USO">Autorização de Uso</SelectItem>
                      <SelectItem value="CONTRATO_LOCACAO">Contrato de Locação</SelectItem>
                      <SelectItem value="OUTRO">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número / Identificador</Label>
                  <Input
                    value={etapa6.numeroInstrumento}
                    onChange={(e) => setEtapa6({ ...etapa6, numeroInstrumento: e.target.value })}
                    placeholder="Ex.: Termo nº 001/2024"
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
                  <Label>Início da Vigência</Label>
                  <Input
                    type="date"
                    value={etapa6.dataInicio}
                    onChange={(e) => setEtapa6({ ...etapa6, dataInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim da Vigência</Label>
                  <Input
                    type="date"
                    value={etapa6.dataVencimento}
                    onChange={(e) => setEtapa6({ ...etapa6, dataVencimento: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações sobre o Instrumento</Label>
                <Textarea
                  value={etapa6.observacoes}
                  onChange={(e) => setEtapa6({ ...etapa6, observacoes: e.target.value })}
                  placeholder="Condicionantes, obrigações, restrições específicas..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </EditarWizardLayout>
  );
}
