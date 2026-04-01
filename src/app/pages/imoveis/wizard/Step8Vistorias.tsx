import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";

export function CadastroImovelStep8() {
  const [formData, setFormData] = useState({
    dataUltimaVistoria: "",
    responsavelVistoria: "",
    tipoVistoria: "",
    estadoGeral: "",
    necessitaIntervencao: "",
    tipoIntervencao: "",
    urgencia: "",
    observacoes: "",
  });

  return (
    <WizardLayout currentStep={8}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Vistorias e Intervenções
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Histórico de vistorias e necessidades de intervenção
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataUltimaVistoria">Data da Última Vistoria</Label>
              <Input
                id="dataUltimaVistoria"
                type="date"
                value={formData.dataUltimaVistoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataUltimaVistoria: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavelVistoria">Responsável pela Vistoria</Label>
              <Input
                id="responsavelVistoria"
                value={formData.responsavelVistoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsavelVistoria: e.target.value,
                  })
                }
                placeholder="Nome do técnico responsável"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipoVistoria">Tipo de Vistoria</Label>
              <Select
                value={formData.tipoVistoria}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipoVistoria: value })
                }
              >
                <SelectTrigger id="tipoVistoria">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotina">Rotina/Periódica</SelectItem>
                  <SelectItem value="cadastral">Cadastral</SelectItem>
                  <SelectItem value="tecnica">Técnica Especializada</SelectItem>
                  <SelectItem value="emergencial">Emergencial</SelectItem>
                  <SelectItem value="patrimonial">Patrimonial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoGeral">Estado Geral do Imóvel</Label>
              <Select
                value={formData.estadoGeral}
                onValueChange={(value) =>
                  setFormData({ ...formData, estadoGeral: value })
                }
              >
                <SelectTrigger id="estadoGeral">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="otimo">Ótimo</SelectItem>
                  <SelectItem value="bom">Bom</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ruim">Ruim</SelectItem>
                  <SelectItem value="pessimo">Péssimo</SelectItem>
                  <SelectItem value="critico">Crítico/Risco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="necessitaIntervencao">
              Necessita Intervenção? <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.necessitaIntervencao}
              onValueChange={(value) =>
                setFormData({ ...formData, necessitaIntervencao: value })
              }
            >
              <SelectTrigger id="necessitaIntervencao">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.necessitaIntervencao === "sim" && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipoIntervencao">
                    Tipo de Intervenção <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.tipoIntervencao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipoIntervencao: value })
                    }
                  >
                    <SelectTrigger id="tipoIntervencao">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manutencao">
                        Manutenção Preventiva
                      </SelectItem>
                      <SelectItem value="corretiva">
                        Manutenção Corretiva
                      </SelectItem>
                      <SelectItem value="reforma">Reforma</SelectItem>
                      <SelectItem value="ampliacao">Ampliação</SelectItem>
                      <SelectItem value="demolicao">Demolição</SelectItem>
                      <SelectItem value="estrutural">
                        Recuperação Estrutural
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgencia">
                    Grau de Urgência <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.urgencia}
                    onValueChange={(value) =>
                      setFormData({ ...formData, urgencia: value })
                    }
                  >
                    <SelectTrigger id="urgencia">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="emergencial">Emergencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações sobre Vistorias e Intervenções
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Descreva detalhes da vistoria, problemas identificados, intervenções necessárias..."
              rows={5}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
