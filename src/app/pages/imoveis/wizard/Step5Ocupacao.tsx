import React from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

const orgaos = [
  "SEMAD", "SEMURH", "SEMOSP", "SEPLAN", "SEMFAZ",
  "SEMMAM", "SEMISPE", "SEMED", "SEMUS", "SEINFRA",
  "INCID", "IMPUR", "FUMPH", "SECULT", "Outro",
];

export function CadastroImovelStep5() {
  const { etapa4, etapa5, setEtapa5 } = useCadastroImovel();
  const navigate = useNavigate();

  const set = (field: string, value: string) =>
    setEtapa5({ ...etapa5, [field]: value });

  // Data minima: ano de construcao do imovel (etapa4), se preenchido
  const anoConstucao = etapa4.anoConstrucao ? parseInt(etapa4.anoConstrucao) : null;
  const dataMinima = anoConstucao && anoConstucao >= 1500
    ? `${anoConstucao}-01-01`
    : "1500-01-01";
  // Datas de ocupacao podem ser futuras (contratos de longa duracao)
  // Apenas bloqueamos anos absurdos (limite: ano atual + 100)
  const anoMaximo = new Date().getFullYear() + 100;

  const handleData = (field: "dataInicio" | "dataFimPrevista") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value;
      const ano = parseInt((valor || "").split("-")[0], 10);
      if (!valor || (ano >= 1500 && ano <= anoMaximo)) {
        set(field, valor);
      }
    };

  const validarData = (field: "dataInicio" | "dataFimPrevista") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const valor = e.target.value;
      if (!valor) return;
      const ano = parseInt(valor.split("-")[0], 10);
      if (isNaN(ano) || ano < 1500 || ano > anoMaximo) {
        set(field, "");
      }
    };

  return (
    <WizardLayout currentStep={5} onNext={() => navigate("/imoveis/novo/etapa-6")}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ocupação e Destinação</h3>
          <p className="text-sm text-gray-500 mt-1">
            Situação atual de uso e responsabilidade operacional do imóvel
          </p>
        </div>

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

          {etapa5.statusOcupacao === "OCUPADO" && (
            <>
              <div className="space-y-1.5">
                <Label>Órgão Ocupante</Label>
                <Select value={etapa5.nomeOcupanteExterno} onValueChange={(v) => set("nomeOcupanteExterno", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o órgão..." /></SelectTrigger>
                  <SelectContent>
                    {orgaos.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Nome do Responsável Local</Label>
                <Input value={etapa5.nomeResponsavelLocal} onChange={(e) => set("nomeResponsavelLocal", e.target.value)} placeholder="Nome completo" />
              </div>

              <div className="space-y-1.5">
                <Label>Contato Institucional</Label>
                <Input value={etapa5.contatoResponsavel} onChange={(e) => set("contatoResponsavel", e.target.value)} placeholder="Telefone ou e-mail institucional" />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Destinação / Finalidade</Label>
            <Input value={etapa5.destinacaoFinalidade} onChange={(e) => set("destinacaoFinalidade", e.target.value)} placeholder="Ex.: Atendimento básico de saúde" />
          </div>

          <div className="space-y-1.5">
            <Label>Data de Início da Ocupação</Label>
            <Input
              type="date"
              value={etapa5.dataInicio}
              min={dataMinima}
              max={`${anoMaximo}-12-31`}
              onChange={handleData("dataInicio")}
              onBlur={validarData("dataInicio")}
            />
            {anoConstucao && etapa5.dataInicio && etapa5.dataInicio < dataMinima && (
              <p className="text-xs text-red-500">A data de início não pode ser anterior ao ano de construção ({anoConstucao}).</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Data Fim Prevista</Label>
            <Input
              type="date"
              value={etapa5.dataFimPrevista}
              min={etapa5.dataInicio || dataMinima}
              max={`${anoMaximo}-12-31`}
              onChange={handleData("dataFimPrevista")}
              onBlur={validarData("dataFimPrevista")}
            />
            {etapa5.dataFimPrevista && etapa5.dataInicio && etapa5.dataFimPrevista < etapa5.dataInicio && (
              <p className="text-xs text-red-500">A data fim não pode ser anterior à data de início.</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Observações sobre a Ocupação</Label>
          <Textarea value={etapa5.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Informações adicionais relevantes sobre o uso do imóvel..." rows={3} />
        </div>
      </div>
    </WizardLayout>
  );
}