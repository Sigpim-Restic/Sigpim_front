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

// ── Helpers de máscara dd/mm/aaaa ─────────────────────────────────────────────

function isoParaMascara(iso: string): string {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

function mascaraParaIso(mascara: string): string {
  const n = mascara.replace(/\D/g, "");
  if (n.length < 8) return "";
  return `${n.slice(4, 8)}-${n.slice(2, 4)}-${n.slice(0, 2)}`;
}

function aplicarMascara(valor: string): string {
  const n = valor.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function dataValida(mascara: string): boolean {
  const n = mascara.replace(/\D/g, "");
  if (n.length !== 8) return false;
  const dia = parseInt(n.slice(0, 2), 10);
  const mes = parseInt(n.slice(2, 4), 10);
  const ano = parseInt(n.slice(4, 8), 10);
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (ano < 1500 || ano > new Date().getFullYear() + 100) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────

export function CadastroImovelStep5() {
  const { etapa4, etapa5, setEtapa5 } = useCadastroImovel();
  const navigate = useNavigate();

  const set = (field: string, value: string) =>
    setEtapa5({ ...etapa5, [field]: value });

  // Estado local das máscaras — inicializado a partir do valor ISO armazenado no contexto
  const [mascaraInicio,  setMascaraInicio]  = React.useState(() => isoParaMascara(etapa5.dataInicio));
  const [mascaraFimPrev, setMascaraFimPrev] = React.useState(() => isoParaMascara(etapa5.dataFimPrevista));

  const handleData = (
    setMascara: (v: string) => void,
    field: "dataInicio" | "dataFimPrevista"
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nova = aplicarMascara(e.target.value);
    setMascara(nova);
    set(field, dataValida(nova) ? mascaraParaIso(nova) : "");
  };

  const erroInicio = mascaraInicio.replace(/\D/g, "").length === 8 && !dataValida(mascaraInicio);
  const erroFim    = mascaraFimPrev.replace(/\D/g, "").length === 8 && !dataValida(mascaraFimPrev);
  const fimAntesDeInicio =
    etapa5.dataInicio && etapa5.dataFimPrevista &&
    etapa5.dataFimPrevista < etapa5.dataInicio;

  return (
    <WizardLayout currentStep={5} onNext={() => navigate("/dashboard/imoveis/novo/etapa-6")}>
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
                  placeholder="Telefone ou e-mail institucional"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Destinação / Finalidade</Label>
            <Input
              value={etapa5.destinacaoFinalidade}
              onChange={(e) => set("destinacaoFinalidade", e.target.value)}
              placeholder="Ex.: Atendimento básico de saúde"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Data de Início da Ocupação</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={mascaraInicio}
              onChange={handleData(setMascaraInicio, "dataInicio")}
              className={erroInicio ? "border-red-300" : ""}
            />
            {erroInicio && (
              <p className="text-xs text-red-500">Data inválida. Use o formato dd/mm/aaaa.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Data Fim Prevista</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={mascaraFimPrev}
              onChange={handleData(setMascaraFimPrev, "dataFimPrevista")}
              className={(erroFim || fimAntesDeInicio) ? "border-red-300" : ""}
            />
            {erroFim && (
              <p className="text-xs text-red-500">Data inválida. Use o formato dd/mm/aaaa.</p>
            )}
            {!erroFim && fimAntesDeInicio && (
              <p className="text-xs text-red-500">A data fim não pode ser anterior à data de início.</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Observações sobre a Ocupação</Label>
          <Textarea
            value={etapa5.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder="Informações adicionais relevantes sobre o uso do imóvel..."
            rows={3}
          />
        </div>
      </div>
    </WizardLayout>
  );
}