import React from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";

export function EditarStep5() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa5, setEtapa5, salvar, salvando, erro } = useEditarImovel();

  const set = (field: string, value: string) =>
    setEtapa5({ ...etapa5, [field]: value });

  const handleNext = () => navigate(`/imoveis/${id}/editar/etapa-6`);

  return (
    <EditarWizardLayout currentStep={5} onNext={handleNext} salvando={salvando}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ocupação e Destinação</h3>
          <p className="text-sm text-gray-500 mt-1">
            Situação atual de uso e responsabilidade operacional
          </p>
        </div>

        {erro && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Status de Ocupação</Label>
            <Select value={etapa5.statusOcupacao} onValueChange={(v) => set("statusOcupacao", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OCUPADO">Ocupado</SelectItem>
                <SelectItem value="DESOCUPADO">Desocupado</SelectItem>
                <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
                <SelectItem value="NAO_REGULARIZADO">Ocupação não regularizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Nível de Ocupação</Label>
            <Select value={etapa5.nivelOcupacao} onValueChange={(v) => set("nivelOcupacao", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TOTAL">Total</SelectItem>
                <SelectItem value="PARCIAL">Parcial</SelectItem>
                <SelectItem value="COMPARTILHADO">Compartilhado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Ocupante / Responsável</Label>
            <Input
              value={etapa5.nomeOcupanteExterno}
              onChange={(e) => set("nomeOcupanteExterno", e.target.value)}
              placeholder="Nome do ocupante ou órgão"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Responsável Local</Label>
            <Input
              value={etapa5.nomeResponsavelLocal}
              onChange={(e) => set("nomeResponsavelLocal", e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Contato Institucional</Label>
            <Input
              value={etapa5.contatoResponsavel}
              onChange={(e) => set("contatoResponsavel", e.target.value)}
              placeholder="Telefone ou e-mail"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Destinação / Finalidade</Label>
            <Input
              value={etapa5.destinacaoFinalidade}
              onChange={(e) => set("destinacaoFinalidade", e.target.value)}
              placeholder="Ex.: Atendimento básico de saúde"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data de Início</Label>
            <Input
              type="date"
              value={etapa5.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data Fim Prevista</Label>
            <Input
              type="date"
              value={etapa5.dataFimPrevista}
              min={etapa5.dataInicio || undefined}
              onChange={(e) => set("dataFimPrevista", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea
            value={etapa5.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder="Informações adicionais sobre o uso do imóvel..."
            rows={3}
          />
        </div>

        {salvando && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Salvando alterações... aguarde.</span>
          </div>
        )}
      </div>
    </EditarWizardLayout>
  );
}