import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

const orgaos = [
  { sigla: "SEMAD",   nome: "Secretaria Municipal de Administração" },
  { sigla: "SEMURH",  nome: "Secretaria Municipal de Urbanismo e Habitação" },
  { sigla: "SEMOSP",  nome: "Secretaria Municipal de Obras e Serviços Públicos" },
  { sigla: "SEPLAN",  nome: "Secretaria Municipal de Planejamento" },
  { sigla: "SEMFAZ",  nome: "Secretaria Municipal da Fazenda" },
  { sigla: "SEMMAM",  nome: "Secretaria Municipal de Meio Ambiente" },
  { sigla: "SEMISPE", nome: "Secretaria Municipal de Projetos Especiais" },
  { sigla: "SEMED",   nome: "Secretaria Municipal de Educação" },
  { sigla: "SEMUS",   nome: "Secretaria Municipal de Saúde" },
  { sigla: "SEINFRA", nome: "Secretaria Municipal de Infraestrutura" },
  { sigla: "INCID",   nome: "Instituto da Cidade" },
  { sigla: "IMPUR",   nome: "Instituto Municipal de Paisagem Urbana" },
  { sigla: "FUMPH",   nome: "Fundação Municipal do Patrimônio Histórico" },
  { sigla: "SECULT",  nome: "Secretaria Municipal de Cultura" },
];

const unidadesPorOrgao: Record<string, string[]> = {
  SEMAD:   ["Coordenação de Bens Patrimoniais", "Departamento de Patrimônio Imobiliário", "Diretoria Administrativa"],
  SEMURH:  ["Coordenação de Habitação Popular", "Departamento de Urbanismo", "Regularização Fundiária"],
  SEMOSP:  ["Obras Públicas", "Manutenção Urbana", "Engenharia e Projetos"],
  SEPLAN:  ["Diretoria de Patrimônio Público", "Coordenação de Cadastro Imobiliário", "GIS e Georreferenciamento"],
  SEMFAZ:  ["Auditoria Patrimonial", "Controle Interno", "Gestão de Contratos"],
  SEMMAM:  ["Gestão Ambiental", "Fiscalização Ambiental", "Áreas Protegidas"],
  SEMISPE: ["Coordenação de Projetos Especiais", "Captação de Recursos"],
  SEMED:   ["Coordenação de Infraestrutura Escolar", "Gestão de Unidades Educacionais"],
  SEMUS:   ["Coordenação de Infraestrutura de Saúde", "Gestão de Unidades de Saúde"],
  SEINFRA: ["Infraestrutura Municipal", "Conservação de Vias Públicas"],
  INCID:   ["Pesquisa e Desenvolvimento Urbano", "Cartografia e Geoprocessamento"],
  IMPUR:   ["Ordenamento Paisagístico", "Mobiliário Urbano"],
  FUMPH:   ["Preservação Histórica", "Restauração e Conservação"],
  SECULT:  ["Equipamentos Culturais", "Patrimônio Cultural"],
};

export function CadastroImovelStep1() {
  const { etapa1, setEtapa1 } = useCadastroImovel();
  const navigate = useNavigate();
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (!etapa1.nomeReferencia.trim()) e.nomeReferencia = "Denominação é obrigatória.";
    if (!etapa1.idOrgaoGestorPatrimonial) e.idOrgaoGestorPatrimonial = "Selecione o órgão responsável.";
    if (!etapa1.idUnidadeGestora) e.idUnidadeGestora = "Selecione a unidade gestora.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validar()) navigate("/imoveis/novo/etapa-2");
  };

  const unidades = etapa1.idOrgaoGestorPatrimonial
    ? unidadesPorOrgao[etapa1.idOrgaoGestorPatrimonial] ?? []
    : [];

  return (
    <WizardLayout currentStep={1} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Identificação e Governança</h3>
          <p className="text-sm text-gray-600 mt-1">Informações básicas e responsáveis pela gestão do imóvel</p>
        </div>

        <AlertBox variant="info">
          Campos com <span className="text-red-600">*</span> são obrigatórios.
        </AlertBox>

        <div className="grid gap-6">
          {/* Denominação */}
          <div className="space-y-2">
            <Label htmlFor="nomeReferencia">
              Denominação do Imóvel <span className="text-red-600">*</span>
            </Label>
            <Input
              id="nomeReferencia"
              value={etapa1.nomeReferencia}
              onChange={(e) => setEtapa1({ ...etapa1, nomeReferencia: e.target.value })}
              placeholder="Ex: Escola Municipal João Silva"
              className={erros.nomeReferencia ? "border-red-400" : ""}
            />
            {erros.nomeReferencia && <p className="text-xs text-red-500">{erros.nomeReferencia}</p>}
          </div>

          {/* Órgão e Unidade */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgao">
                Órgão Responsável <span className="text-red-600">*</span>
              </Label>
              <Select
                value={etapa1.idOrgaoGestorPatrimonial}
                onValueChange={(v) => setEtapa1({ ...etapa1, idOrgaoGestorPatrimonial: v, idUnidadeGestora: "" })}
              >
                <SelectTrigger className={erros.idOrgaoGestorPatrimonial ? "border-red-400" : ""}>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {orgaos.map((o) => (
                    <SelectItem key={o.sigla} value={o.sigla}>{o.sigla} – {o.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.idOrgaoGestorPatrimonial && <p className="text-xs text-red-500">{erros.idOrgaoGestorPatrimonial}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">
                Unidade Gestora <span className="text-red-600">*</span>
              </Label>
              <Select
                value={etapa1.idUnidadeGestora}
                onValueChange={(v) => setEtapa1({ ...etapa1, idUnidadeGestora: v })}
                disabled={!etapa1.idOrgaoGestorPatrimonial}
              >
                <SelectTrigger className={erros.idUnidadeGestora ? "border-red-400" : ""}>
                  <SelectValue placeholder={etapa1.idOrgaoGestorPatrimonial ? "Selecione a unidade" : "Selecione primeiro o órgão"} />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              {erros.idUnidadeGestora && <p className="text-xs text-red-500">{erros.idUnidadeGestora}</p>}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              value={etapa1.observacoesGerais}
              onChange={(e) => setEtapa1({ ...etapa1, observacoesGerais: e.target.value })}
              placeholder="Informações adicionais relevantes sobre o imóvel..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}