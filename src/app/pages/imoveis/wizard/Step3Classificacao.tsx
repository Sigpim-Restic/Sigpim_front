import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { AlertBox } from "../../../components/layout/States";

export function CadastroImovelStep3() {
  const [formData, setFormData] = useState({
    tipoImovel: "",
    categoriaUso: "",
    destinacaoAtual: "",
    situacaoOcupacao: "",
    descricaoUso: "",
  });

  return (
    <WizardLayout currentStep={3}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Classificação e Uso
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tipo, categoria e destinação atual do imóvel
          </p>
        </div>

        <div className="grid gap-6">
          {/* Tipo de Imóvel */}
          <div className="space-y-2">
            <Label htmlFor="tipoImovel">
              Tipo de Imóvel <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.tipoImovel}
              onValueChange={(value) =>
                setFormData({ ...formData, tipoImovel: value })
              }
            >
              <SelectTrigger id="tipoImovel">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="edificacao">Edificação</SelectItem>
                <SelectItem value="area-verde">Área Verde</SelectItem>
                <SelectItem value="area-especial">Área de Uso Especial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria de Uso */}
          <div className="space-y-2">
            <Label htmlFor="categoriaUso">
              Categoria de Uso <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.categoriaUso}
              onValueChange={(value) =>
                setFormData({ ...formData, categoriaUso: value })
              }
            >
              <SelectTrigger id="categoriaUso">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrativo">Administrativo</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="cultura">Cultura</SelectItem>
                <SelectItem value="esporte-lazer">Esporte e Lazer</SelectItem>
                <SelectItem value="seguranca">Segurança Pública</SelectItem>
                <SelectItem value="assistencia-social">
                  Assistência Social
                </SelectItem>
                <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="residencial">Residencial</SelectItem>
                <SelectItem value="desocupado">Desocupado</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destinação Atual */}
          <div className="space-y-2">
            <Label htmlFor="destinacaoAtual">
              Destinação Atual <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.destinacaoAtual}
              onValueChange={(value) =>
                setFormData({ ...formData, destinacaoAtual: value })
              }
            >
              <SelectTrigger id="destinacaoAtual">
                <SelectValue placeholder="Selecione a destinação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uso-proprio">
                  Uso Próprio do Órgão
                </SelectItem>
                <SelectItem value="cedido">Cedido</SelectItem>
                <SelectItem value="locado">Locado a Terceiros</SelectItem>
                <SelectItem value="comodato">Comodato</SelectItem>
                <SelectItem value="desocupado">Desocupado</SelectItem>
                <SelectItem value="em-obras">Em Obras/Reforma</SelectItem>
                <SelectItem value="irregular">Ocupação Irregular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Situação de Ocupação */}
          <div className="space-y-2">
            <Label htmlFor="situacaoOcupacao">
              Situação de Ocupação <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.situacaoOcupacao}
              onValueChange={(value) =>
                setFormData({ ...formData, situacaoOcupacao: value })
              }
            >
              <SelectTrigger id="situacaoOcupacao">
                <SelectValue placeholder="Selecione a situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="parcialmente-ocupado">
                  Parcialmente Ocupado
                </SelectItem>
                <SelectItem value="desocupado">Desocupado</SelectItem>
                <SelectItem value="em-disputa">Em Disputa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição Detalhada do Uso */}
          <div className="space-y-2">
            <Label htmlFor="descricaoUso">
              Descrição Detalhada do Uso <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="descricaoUso"
              value={formData.descricaoUso}
              onChange={(e) =>
                setFormData({ ...formData, descricaoUso: e.target.value })
              }
              placeholder="Descreva o uso atual do imóvel, atividades realizadas e finalidade..."
              rows={4}
              required
            />
            <p className="text-xs text-gray-500">
              Informe detalhes sobre as atividades desenvolvidas no local
            </p>
          </div>

          <AlertBox variant="warning" title="Atenção">
            Para imóveis com ocupação irregular ou em disputa, será necessário
            anexar documentação específica na etapa de anexos.
          </AlertBox>
        </div>
      </div>
    </WizardLayout>
  );
}
