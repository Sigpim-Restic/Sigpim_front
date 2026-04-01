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
import { AlertBox } from "../../../components/layout/States";

export function CadastroImovelStep7() {
  const [formData, setFormData] = useState({
    situacaoDominial: "",
    matricula: "",
    cartorio: "",
    livro: "",
    folha: "",
    dataRegistro: "",
    titularidade: "",
    observacoes: "",
  });

  return (
    <WizardLayout currentStep={7}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Dominial e Regularização
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Informações sobre registro, titularidade e situação dominial
          </p>
        </div>

        <AlertBox variant="warning" title="Documentação Obrigatória">
          Para imóveis com registro, será necessário anexar cópias da matrícula
          e demais documentos de titularidade na etapa de anexos.
        </AlertBox>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="situacaoDominial">
              Situação Dominial <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.situacaoDominial}
              onValueChange={(value) =>
                setFormData({ ...formData, situacaoDominial: value })
              }
            >
              <SelectTrigger id="situacaoDominial">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular - Registrado</SelectItem>
                <SelectItem value="processo-regularizacao">
                  Em Processo de Regularização
                </SelectItem>
                <SelectItem value="irregular">Irregular - Sem Registro</SelectItem>
                <SelectItem value="disputa">Em Disputa Judicial</SelectItem>
                <SelectItem value="posse">Posse Administrativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.situacaoDominial === "regular" ||
            formData.situacaoDominial === "processo-regularizacao") && (
            <>
              <div className="border-b border-gray-200 pb-6">
                <h4 className="font-medium text-gray-900 mb-4">
                  Dados do Registro
                </h4>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="matricula">
                      Número da Matrícula <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="matricula"
                      value={formData.matricula}
                      onChange={(e) =>
                        setFormData({ ...formData, matricula: e.target.value })
                      }
                      placeholder="Ex: 12345"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cartorio">
                      Cartório <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="cartorio"
                      value={formData.cartorio}
                      onChange={(e) =>
                        setFormData({ ...formData, cartorio: e.target.value })
                      }
                      placeholder="Ex: 1º Ofício de Registro de Imóveis"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-3 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="livro">Livro</Label>
                    <Input
                      id="livro"
                      value={formData.livro}
                      onChange={(e) =>
                        setFormData({ ...formData, livro: e.target.value })
                      }
                      placeholder="Ex: 02"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="folha">Folha</Label>
                    <Input
                      id="folha"
                      value={formData.folha}
                      onChange={(e) =>
                        setFormData({ ...formData, folha: e.target.value })
                      }
                      placeholder="Ex: 123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataRegistro">Data do Registro</Label>
                    <Input
                      id="dataRegistro"
                      type="date"
                      value={formData.dataRegistro}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataRegistro: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="titularidade">
              Titularidade <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.titularidade}
              onValueChange={(value) =>
                setFormData({ ...formData, titularidade: value })
              }
            >
              <SelectTrigger id="titularidade">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="municipio">
                  Município de São Luís
                </SelectItem>
                <SelectItem value="estado">Estado do Maranhão</SelectItem>
                <SelectItem value="uniao">União</SelectItem>
                <SelectItem value="compartilhada">
                  Titularidade Compartilhada
                </SelectItem>
                <SelectItem value="indefinida">
                  Indefinida/Em Apuração
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">
              Observações sobre Regularização
            </Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais sobre a situação dominial, processos de regularização, disputas judiciais, etc."
              rows={4}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
