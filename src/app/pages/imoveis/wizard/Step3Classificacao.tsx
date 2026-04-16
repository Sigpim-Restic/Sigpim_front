import React, { useState, useEffect } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";
import { tiposImovelApi, type TipoImovelResponse } from "../../../api/tipos-imovel-alertas";

export function CadastroImovelStep3() {
  const { etapa3, setEtapa3 } = useCadastroImovel();
  const navigate = useNavigate();

  const [tiposImovel,        setTiposImovel]        = useState<TipoImovelResponse[]>([]);
  const [carregandoTipos,    setCarregandoTipos]    = useState(true);

  // Load dynamic property types from API
  useEffect(() => {
    tiposImovelApi.listarAtivos()
      .then(setTiposImovel)
      .catch(() => {/* fail silently — field stays optional */})
      .finally(() => setCarregandoTipos(false));
  }, []);

  // No mandatory validation — pre-registration has no required fields
  const handleNext = () => navigate("/imoveis/novo/etapa-4");
  const handleBack = () => navigate("/imoveis/novo/etapa-2");

  const sel = (field: keyof typeof etapa3) => ({
    value: etapa3[field],
    onValueChange: (v: string) => setEtapa3({ ...etapa3, [field]: v }),
  });

  return (
    <WizardLayout currentStep={3} onNext={handleNext} onBack={handleBack}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Classificação e Uso</h3>
          <p className="text-sm text-gray-600 mt-1">Tipo, tipologia e situação dominial do imóvel — todos opcionais no pré-cadastro</p>
        </div>

        <div className="grid gap-6">

          {/* Tipo de Imóvel — dynamic list from tipos_imovel table */}
          <div className="space-y-2">
            <Label>Tipo de Imóvel</Label>
            <Select {...sel("idTipoImovel")} disabled={carregandoTipos}>
              <SelectTrigger>
                <SelectValue placeholder={carregandoTipos ? "Carregando tipos..." : "Selecione o tipo (opcional)"} />
              </SelectTrigger>
              <SelectContent>
                {tiposImovel.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Os tipos disponíveis são gerenciados pelo administrador do sistema.
            </p>
          </div>

          {/* Tipologia */}
          <div className="space-y-2">
            <Label>Tipologia</Label>
            <Select {...sel("tipologia")}>
              <SelectTrigger><SelectValue placeholder="Selecione a tipologia (opcional)" /></SelectTrigger>
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
              <SelectTrigger><SelectValue placeholder="Selecione a situação (opcional)" /></SelectTrigger>
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