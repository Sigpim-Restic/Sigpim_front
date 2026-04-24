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
  const [erros] = useState<Record<string, string>>({});

  // Pré-cadastro: nenhum campo obrigatório — §4.2 do Manual SIGPIM
  const handleNext = () => navigate("/dashboard/imoveis/novo/etapa-4");

  const sel = (field: keyof typeof etapa3) => ({
    value: etapa3[field],
    onValueChange: (v: string) => setEtapa3({ ...etapa3, [field]: v }),
  });

  return (
    <WizardLayout currentStep={3} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Classificação e Uso</h3>
          <p className="text-sm text-gray-600 mt-1">Tipo, tipologia e uso atual do imóvel</p>
        </div>

        <div className="grid gap-6">
          {/* Tipo de Imóvel */}
          <div className="space-y-2">
            <Label>Tipo de Imóvel</Label>
            <Select {...sel("tipoImovel")}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PROPRIO">Próprio</SelectItem>
                <SelectItem value="LOCADO">Locado</SelectItem>
                <SelectItem value="INCERTO">Incerto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipologia */}
          <div className="space-y-2">
            <Label>Tipologia</Label>
            <Select {...sel("tipologia")}>
              <SelectTrigger><SelectValue placeholder="Selecione a tipologia" /></SelectTrigger>
              <SelectContent>
                {["Administrativo","Educação","Saúde","Cultura","Esporte e Lazer",
                  "Segurança Pública","Assistência Social","Infraestrutura","Terreno",
                  "Residencial","Outro"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destinação atual */}
          <div className="space-y-2">
            <Label>Destinação Atual</Label>
            <Select {...sel("destinacaoAtual")}>
              <SelectTrigger><SelectValue placeholder="Selecione a destinação" /></SelectTrigger>
              <SelectContent>
                {["Uso próprio","Cedido a terceiros","Imóvel locado","Sem uso definido","Em obras","Desativado"].map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição do uso */}
          <div className="space-y-2">
            <Label>Descrição do Uso Atual</Label>
            <Textarea
              value={etapa3.descricaoUso}
              onChange={(e) => setEtapa3({ ...etapa3, descricaoUso: e.target.value })}
              placeholder="Descreva o uso atual do imóvel, atividades realizadas e finalidade..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}