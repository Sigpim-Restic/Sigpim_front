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
import { AlertBox } from "../../../components/layout/States";

// Órgãos Responsáveis
const orgaosResponsaveis = [
  { sigla: "SEMAD", nome: "Secretaria Municipal de Administração" },
  { sigla: "SEMURH", nome: "Secretaria Municipal de Urbanismo e Habitação" },
  { sigla: "SEMOSP", nome: "Secretaria Municipal de Obras e Serviços Públicos" },
  { sigla: "SEPLAN", nome: "Secretaria Municipal de Planejamento" },
  { sigla: "SEMFAZ", nome: "Secretaria Municipal da Fazenda" },
  { sigla: "SEMMAM", nome: "Secretaria Municipal de Meio Ambiente" },
  { sigla: "SEMISPE", nome: "Secretaria Municipal de Projetos Especiais" },
  { sigla: "INCID", nome: "Instituto da Cidade" },
  { sigla: "IMPUR", nome: "Instituto Municipal de Paisagem Urbana" },
  { sigla: "FUMPH", nome: "Fundação Municipal do Patrimônio Histórico" },
];

// Unidades Gestoras por Órgão
const unidadesGestorasPorOrgao: Record<string, string[]> = {
  SEMAD: [
    "Coordenação de Bens Patrimoniais",
    "Departamento de Patrimônio Imobiliário",
    "Gestão de Prédios Públicos",
    "Serviços Gerais",
    "Almoxarifado Central",
    "Diretoria Administrativa",
  ],
  SEMURH: [
    "Coordenação de Habitação Popular",
    "Departamento de Urbanismo",
    "Regularização Fundiária",
    "Planejamento Urbano e Territorial",
    "Fiscalização de Obras Particulares",
  ],
  SEMOSP: [
    "Obras Públicas",
    "Manutenção Urbana",
    "Engenharia e Projetos",
    "Infraestrutura Municipal",
    "Conservação de Vias Públicas",
  ],
  SEPLAN: [
    "Diretoria de Patrimônio Público",
    "Coordenação de Cadastro Imobiliário",
    "GIS e Georreferenciamento",
    "Planejamento Territorial",
    "Gestão de Projetos Estratégicos",
    "Desenvolvimento Urbano",
  ],
  SEMFAZ: [
    "Auditoria Patrimonial",
    "Controle Interno",
    "Gestão de Contratos",
    "Tributação Imobiliária",
    "Fiscalização de Receitas",
  ],
  SEMMAM: [
    "Gestão Ambiental",
    "Fiscalização Ambiental",
    "Áreas Protegidas e Unidades de Conservação",
    "Licenciamento Ambiental",
    "Educação Ambiental",
  ],
  SEMISPE: [
    "Coordenação de Projetos Especiais",
    "Captação de Recursos",
    "Gestão de Convênios",
    "Desenvolvimento Institucional",
  ],
  INCID: [
    "Pesquisa e Desenvolvimento Urbano",
    "Observatório da Cidade",
    "Cartografia e Geoprocessamento",
    "Estudos Territoriais",
    "Sistema de Informação Urbana",
  ],
  IMPUR: [
    "Ordenamento Paisagístico",
    "Fiscalização de Publicidade",
    "Mobiliário Urbano",
    "Gestão de Espaços Públicos",
  ],
  FUMPH: [
    "Preservação Histórica",
    "Tombamento e Inventário",
    "Restauração e Conservação",
    "Educação Patrimonial",
    "Acervo Documental",
  ],
};

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

  // Handler para mudança de órgão (reseta unidade gestora)
  const handleOrgaoChange = (value: string) => {
    setFormData({
      ...formData,
      orgaoResponsavel: value,
      unidadeGestora: "", // Reseta a unidade gestora
    });
  };

  // Obtém as unidades gestoras disponíveis para o órgão selecionado
  const unidadesDisponiveis =
    formData.orgaoResponsavel
      ? unidadesGestorasPorOrgao[formData.orgaoResponsavel] || []
      : [];

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
                onValueChange={handleOrgaoChange}
              >
                <SelectTrigger id="orgaoResponsavel">
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {orgaosResponsaveis.map((orgao) => (
                    <SelectItem key={orgao.sigla} value={orgao.sigla}>
                      {orgao.sigla} – {orgao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadeGestora">
                Unidade Gestora <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.unidadeGestora}
                onValueChange={(value) =>
                  setFormData({ ...formData, unidadeGestora: value })
                }
                disabled={!formData.orgaoResponsavel}
              >
                <SelectTrigger id="unidadeGestora">
                  <SelectValue
                    placeholder={
                      formData.orgaoResponsavel
                        ? "Selecione uma unidade gestora"
                        : "Selecione primeiro o órgão"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {unidadesDisponiveis.length > 0 ? (
                    unidadesDisponiveis.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhuma unidade disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!formData.orgaoResponsavel && (
                <p className="text-xs text-gray-500">
                  Selecione um órgão para visualizar as unidades gestoras
                </p>
              )}
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