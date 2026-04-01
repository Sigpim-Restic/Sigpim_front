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

export function CadastroImovelStep6() {
  const [formData, setFormData] = useState({
    possuiContrato: "",
    tipoInstrumento: "",
    numeroContrato: "",
    dataAssinatura: "",
    vigenciaInicio: "",
    vigenciaFim: "",
    valorMensal: "",
    observacoes: "",
  });

  return (
    <WizardLayout currentStep={6}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Instrumentos e Contratos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Contratos, cessões, comodatos e demais instrumentos jurídicos
          </p>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="possuiContrato">
              Possui Contrato/Instrumento? <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.possuiContrato}
              onValueChange={(value) =>
                setFormData({ ...formData, possuiContrato: value })
              }
            >
              <SelectTrigger id="possuiContrato">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.possuiContrato === "sim" && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipoInstrumento">
                    Tipo de Instrumento <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.tipoInstrumento}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipoInstrumento: value })
                    }
                  >
                    <SelectTrigger id="tipoInstrumento">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato-locacao">
                        Contrato de Locação
                      </SelectItem>
                      <SelectItem value="cessao">Termo de Cessão</SelectItem>
                      <SelectItem value="comodato">
                        Contrato de Comodato
                      </SelectItem>
                      <SelectItem value="concessao">
                        Termo de Concessão
                      </SelectItem>
                      <SelectItem value="permissao">
                        Termo de Permissão de Uso
                      </SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroContrato">
                    Número do Contrato/Instrumento
                  </Label>
                  <Input
                    id="numeroContrato"
                    value={formData.numeroContrato}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroContrato: e.target.value,
                      })
                    }
                    placeholder="Ex: CTR-2026/001"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dataAssinatura">Data de Assinatura</Label>
                  <Input
                    id="dataAssinatura"
                    type="date"
                    value={formData.dataAssinatura}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataAssinatura: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vigenciaInicio">Vigência - Início</Label>
                  <Input
                    id="vigenciaInicio"
                    type="date"
                    value={formData.vigenciaInicio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vigenciaInicio: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vigenciaFim">Vigência - Fim</Label>
                  <Input
                    id="vigenciaFim"
                    type="date"
                    value={formData.vigenciaFim}
                    onChange={(e) =>
                      setFormData({ ...formData, vigenciaFim: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                <Input
                  id="valorMensal"
                  type="number"
                  step="0.01"
                  value={formData.valorMensal}
                  onChange={(e) =>
                    setFormData({ ...formData, valorMensal: e.target.value })
                  }
                  placeholder="0,00"
                />
                <p className="text-xs text-gray-500">
                  Deixe em branco se não houver valor
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais sobre contratos e instrumentos..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
