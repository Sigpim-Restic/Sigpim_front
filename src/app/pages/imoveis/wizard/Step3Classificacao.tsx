import React, { useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

export function CadastroImovelStep3() {
  const { etapa3, setEtapa3 } = useCadastroImovel();
  const navigate = useNavigate();
  const [erros, setErros] = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (!etapa3.tipoImovel) e.tipoImovel = "Selecione o tipo do imóvel.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validar()) navigate("/imoveis/novo/etapa-4");
  };

  const sel = (field: keyof typeof etapa3) => ({
    value: etapa3[field],
    onValueChange: (v: string) => setEtapa3({ ...etapa3, [field]: v }),
  });

  return (
    <WizardLayout currentStep={3} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Classificação e Uso</h3>
          <p className="text-sm text-gray-600 mt-1">Tipo, tipologia e situação dominial do imóvel</p>
        </div>

        <div className="grid gap-6">
          {/* Tipo de Imóvel */}
          <div className="space-y-2">
            <Label>Tipo de Imóvel <span className="text-red-600">*</span></Label>
            <Select {...sel("tipoImovel")}>
              <SelectTrigger className={erros.tipoImovel ? "border-red-400" : ""}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPRIO">Próprio</SelectItem>
                <SelectItem value="LOCADO">Locado</SelectItem>
                <SelectItem value="INCERTO">Incerto</SelectItem>
              </SelectContent>
            </Select>
            {erros.tipoImovel && <p className="text-xs text-red-500">{erros.tipoImovel}</p>}
          </div>

          {/* Tipologia */}
          <div className="space-y-2">
            <Label>Tipologia</Label>
            <Select {...sel("tipologia")}>
              <SelectTrigger><SelectValue placeholder="Selecione a tipologia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
                <SelectItem value="Educação">Educação</SelectItem>
                <SelectItem value="Saúde">Saúde</SelectItem>
                <SelectItem value="Cultura">Cultura</SelectItem>
                <SelectItem value="Esporte e Lazer">Esporte e Lazer</SelectItem>
                <SelectItem value="Segurança Pública">Segurança Pública</SelectItem>
                <SelectItem value="Assistência Social">Assistência Social</SelectItem>
                <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="Terreno">Terreno</SelectItem>
                <SelectItem value="Residencial">Residencial</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Situação Dominial */}
          <div className="space-y-2">
            <Label>Situação Dominial</Label>
            <Select {...sel("situacaoDominial")}>
              <SelectTrigger><SelectValue placeholder="Selecione a situação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="IRREGULAR">Irregular</SelectItem>
                <SelectItem value="EM_APURACAO">Em Apuração</SelectItem>
                <SelectItem value="EM_LITIGIO">Em Litígio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição do Uso Atual</Label>
            <Textarea
              value={etapa3.descricaoUso}
              onChange={(e) => setEtapa3({ ...etapa3, descricaoUso: e.target.value })}
              placeholder="Descreva o uso atual do imóvel, atividades realizadas e finalidade..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}