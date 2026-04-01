import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";

export function CadastroImovelStep5() {
  const [formData, setFormData] = useState({
    ocupanteNome: "",
    ocupanteCPF: "",
    ocupanteEmail: "",
    ocupanteTelefone: "",
    dataInicioOcupacao: "",
    tipoVinculo: "",
    observacoes: "",
  });

  return (
    <WizardLayout currentStep={5}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ocupação e Responsáveis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Informações sobre ocupantes e responsáveis pelo imóvel
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ocupanteNome">Nome do Ocupante/Responsável</Label>
              <Input
                id="ocupanteNome"
                value={formData.ocupanteNome}
                onChange={(e) =>
                  setFormData({ ...formData, ocupanteNome: e.target.value })
                }
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ocupanteCPF">CPF/CNPJ</Label>
              <Input
                id="ocupanteCPF"
                value={formData.ocupanteCPF}
                onChange={(e) =>
                  setFormData({ ...formData, ocupanteCPF: e.target.value })
                }
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ocupanteEmail">E-mail</Label>
              <Input
                id="ocupanteEmail"
                type="email"
                value={formData.ocupanteEmail}
                onChange={(e) =>
                  setFormData({ ...formData, ocupanteEmail: e.target.value })
                }
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ocupanteTelefone">Telefone</Label>
              <Input
                id="ocupanteTelefone"
                type="tel"
                value={formData.ocupanteTelefone}
                onChange={(e) =>
                  setFormData({ ...formData, ocupanteTelefone: e.target.value })
                }
                placeholder="(98) 98765-4321"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataInicioOcupacao">Data de Início da Ocupação</Label>
              <Input
                id="dataInicioOcupacao"
                type="date"
                value={formData.dataInicioOcupacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dataInicioOcupacao: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoVinculo">Tipo de Vínculo</Label>
              <Input
                id="tipoVinculo"
                value={formData.tipoVinculo}
                onChange={(e) =>
                  setFormData({ ...formData, tipoVinculo: e.target.value })
                }
                placeholder="Ex: Servidor, Cedido, Terceiro"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações sobre Ocupação</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              placeholder="Informações adicionais sobre a ocupação do imóvel..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}
