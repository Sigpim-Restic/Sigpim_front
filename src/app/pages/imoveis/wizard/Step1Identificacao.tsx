import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { HierarchicalCombobox } from "../../../components/ui/hierarchical-combobox";
import { AlertBox } from "../../../components/layout/States";

const unidadesGestoras = [
  {
    secretaria: "Secretaria Municipal de Administração",
    sigla: "SEMAD",
    unidades: [
      {
        value: "semad-coordenacao-bens-patrimoniais",
        label: "Coordenação de Bens Patrimoniais",
      },
      {
        value: "semad-departamento-patrimonio",
        label: "Departamento de Patrimônio Imobiliário",
      },
      {
        value: "semad-gestao-predios",
        label: "Gestão de Prédios Públicos",
      },
      {
        value: "semad-servicos-gerais",
        label: "Serviços Gerais",
      },
      {
        value: "semad-almoxarifado",
        label: "Almoxarifado Central",
      },
      {
        value: "semad-diretoria-administrativa",
        label: "Diretoria Administrativa",
      },
    ],
  },
  {
    secretaria: "Secretaria Municipal de Urbanismo e Habitação",
    sigla: "SEMURH",
    unidades: [
      {
        value: "semurh-coordenacao-habitacao",
        label: "Coordenação de Habitação Popular",
      },
      {
        value: "semurh-departamento-urbanismo",
        label: "Departamento de Urbanismo",
      },
      {
        value: "semurh-regularizacao-fundiaria",
        label: "Regularização Fundiária",
      },
      {
        value: "semurh-planejamento-urbano",
        label: "Planejamento Urbano e Territorial",
      },
      {
        value: "semurh-fiscalizacao-obras",
        label: "Fiscalização de Obras Particulares",
      },
    ],
  },
  {
    secretaria: "Secretaria Municipal de Obras e Serviços Públicos",
    sigla: "SEMOSP",
    unidades: [
      {
        value: "semosp-obras-publicas",
        label: "Obras Públicas",
      },
      {
        value: "semosp-manutencao-urbana",
        label: "Manutenção Urbana",
      },
      {
        value: "semosp-engenharia-projetos",
        label: "Engenharia e Projetos",
      },
      {
        value: "semosp-infraestrutura",
        label: "Infraestrutura Municipal",
      },
      {
        value: "semosp-conservacao-vias",
        label: "Conservação de Vias Públicas",
      },
    ],
  },
  {
    secretaria: "Secretaria Municipal de Planejamento",
    sigla: "SEPLAN",
    unidades: [
      {
        value: "seplan-diretoria-patrimonio",
        label: "Diretoria de Patrimônio Público",
      },
      {
        value: "seplan-coordenacao-cadastro",
        label: "Coordenação de Cadastro Imobiliário",
      },
      {
        value: "seplan-gis-georreferenciamento",
        label: "GIS e Georreferenciamento",
      },
      {
        value: "seplan-planejamento-territorial",
        label: "Planejamento Territorial",
      },
      {
        value: "seplan-gestao-projetos",
        label: "Gestão de Projetos Estratégicos",
      },
      {
        value: "seplan-desenvolvimento-urbano",
        label: "Desenvolvimento Urbano",
      },
    ],
  },
  {
    secretaria: "Secretaria Municipal da Fazenda",
    sigla: "SEMFAZ",
    unidades: [
      {
        value: "semfaz-auditoria-patrimonial",
        label: "Auditoria Patrimonial",
      },
      {
        value: "semfaz-controle-interno",
        label: "Controle Interno",
      },
      {
        value: "semfaz-gestao-contratos",
        label: "Gestão de Contratos",
      },
      {
        value: "semfaz-tributacao-imobiliaria",
        label: "Tributação Imobiliária",
      },
      {
        value: "semfaz-fiscalizacao-receitas",
        label: "Fiscalização de Receitas",
      },
    ],
  },
  {
    secretaria: "Secretaria Municipal de Meio Ambiente",
    sigla: "SEMMAM",
    unidades: [
      {
        value: "semmam-gestao-ambiental",
        label: "Gestão Ambiental",
      },
      {
        value: "semmam-fiscalizacao-ambiental",
        label: "Fiscalização Ambiental",
      },
      {
        value: "semmam-areas-protegidas",
        label: "Áreas Protegidas e Unidades de Conservação",
      },
      {
        value: "semmam-licenciamento",
        label: "Licenciamento Ambiental",
      },
      {
        value: "semmam-educacao-ambiental",
        label: "Educação Ambiental",
      },
    ],
  },
  {
    secretaria: "Secretaria Municipal de Projetos Especiais",
    sigla: "SEMISPE",
    unidades: [
      {
        value: "semispe-coordenacao-projetos",
        label: "Coordenação de Projetos Especiais",
      },
      {
        value: "semispe-captacao-recursos",
        label: "Captação de Recursos",
      },
      {
        value: "semispe-convenios",
        label: "Gestão de Convênios",
      },
      {
        value: "semispe-desenvolvimento-institucional",
        label: "Desenvolvimento Institucional",
      },
    ],
  },
  {
    secretaria: "Instituto da Cidade",
    sigla: "INCID",
    unidades: [
      {
        value: "incid-pesquisa-urbana",
        label: "Pesquisa e Desenvolvimento Urbano",
      },
      {
        value: "incid-observatorio-cidade",
        label: "Observatório da Cidade",
      },
      {
        value: "incid-cartografia",
        label: "Cartografia e Geoprocessamento",
      },
      {
        value: "incid-estudos-territoriais",
        label: "Estudos Territoriais",
      },
      {
        value: "incid-informacao-urbana",
        label: "Sistema de Informação Urbana",
      },
    ],
  },
  {
    secretaria: "Instituto Municipal de Paisagem Urbana",
    sigla: "IMPUR",
    unidades: [
      {
        value: "impur-ordenamento-paisagistico",
        label: "Ordenamento Paisagístico",
      },
      {
        value: "impur-fiscalizacao-publicidade",
        label: "Fiscalização de Publicidade",
      },
      {
        value: "impur-mobiliario-urbano",
        label: "Mobiliário Urbano",
      },
      {
        value: "impur-espacos-publicos",
        label: "Gestão de Espaços Públicos",
      },
    ],
  },
  {
    secretaria: "Fundação Municipal do Patrimônio Histórico",
    sigla: "FUMPH",
    unidades: [
      {
        value: "fumph-preservacao-historica",
        label: "Preservação Histórica",
      },
      {
        value: "fumph-tombamento",
        label: "Tombamento e Inventário",
      },
      {
        value: "fumph-restauracao",
        label: "Restauração e Conservação",
      },
      {
        value: "fumph-educacao-patrimonial",
        label: "Educação Patrimonial",
      },
      {
        value: "fumph-acervo-documental",
        label: "Acervo Documental",
      },
    ],
  },
];

export function CadastroImovelStep1() {
  const [formData, setFormData] = useState({
    codigoInterno: "",
    denominacao: "",
    orgaoResponsavel: "",
    unidadeGestora: "",
    responsavelTecnico: "",
    emailResponsavel: "",
    telefone: "",
    observacoes: "",
  });

  return (
    <WizardLayout currentStep={1}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Identificação e Governança
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Informações básicas e responsáveis pela gestão do imóvel
          </p>
        </div>

        <AlertBox variant="info">
          O código interno será gerado automaticamente pelo sistema se não for
          informado. Campos com <span className="text-red-600">*</span> são
          obrigatórios.
        </AlertBox>

        <div className="grid gap-6">
          {/* Código Interno */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="codigoInterno">Código Interno</Label>
              <Input
                id="codigoInterno"
                value={formData.codigoInterno}
                onChange={(e) =>
                  setFormData({ ...formData, codigoInterno: e.target.value })
                }
                placeholder="Ex: IMO-2026-0048"
              />
              <p className="text-xs text-gray-500">
                Deixe em branco para gerar automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="denominacao">
                Denominação do Imóvel <span className="text-red-600">*</span>
              </Label>
              <Input
                id="denominacao"
                value={formData.denominacao}
                onChange={(e) =>
                  setFormData({ ...formData, denominacao: e.target.value })
                }
                placeholder="Ex: Escola Municipal João Silva"
                required
              />
            </div>
          </div>

          {/* Órgão e Unidade */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgaoResponsavel">
                Órgão Responsável <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.orgaoResponsavel}
                onValueChange={(value) =>
                  setFormData({ ...formData, orgaoResponsavel: value })
                }
              >
                <SelectTrigger id="orgaoResponsavel">
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEPLAN">SEPLAN</SelectItem>
                  <SelectItem value="SEMED">SEMED</SelectItem>
                  <SelectItem value="SEMUS">SEMUS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadeGestora">
                Unidade Gestora <span className="text-red-600">*</span>
              </Label>
              <HierarchicalCombobox
                groups={unidadesGestoras}
                value={formData.unidadeGestora}
                onValueChange={(value) =>
                  setFormData({ ...formData, unidadeGestora: value })
                }
                placeholder="Selecione uma unidade gestora"
                searchPlaceholder="Buscar unidade ou secretaria..."
                emptyText="Nenhuma unidade encontrada."
              />
            </div>
          </div>

          {/* Responsável Técnico */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Responsável Técnico
            </h4>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="responsavelTecnico">
                  Nome Completo <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="responsavelTecnico"
                  value={formData.responsavelTecnico}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      responsavelTecnico: e.target.value,
                    })
                  }
                  placeholder="Nome do responsável"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailResponsavel">
                  E-mail <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="emailResponsavel"
                  type="email"
                  value={formData.emailResponsavel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailResponsavel: e.target.value,
                    })
                  }
                  placeholder="email@orgao.slz.ma.gov.br"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="(98) 98765-4321"
                  required
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais relevantes sobre o imóvel..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}