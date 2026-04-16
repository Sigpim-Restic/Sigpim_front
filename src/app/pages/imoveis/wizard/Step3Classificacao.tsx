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
import { situacoesDominiaisApi, type SituacaoDominialResponse } from "../../../api/situacoes-dominiais";

export function CadastroImovelStep3() {
  const { etapa3, setEtapa3 } = useCadastroImovel();
  const navigate = useNavigate();

  const [tiposImovel,       setTiposImovel]       = useState<TipoImovelResponse[]>([]);
  const [situacoes,         setSituacoes]         = useState<SituacaoDominialResponse[]>([]);
  const [carregandoTipos,   setCarregandoTipos]   = useState(true);
  const [carregandoSit,     setCarregandoSit]     = useState(true);

  useEffect(() => {
    tiposImovelApi.listarAtivos()
      .then(setTiposImovel)
      .catch(() => {})
      .finally(() => setCarregandoTipos(false));

    situacoesDominiaisApi.listarAtivas()
      .then(setSituacoes)
      .catch(() => {})
      .finally(() => setCarregandoSit(false));
  }, []);

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
          <p className="text-sm text-gray-600 mt-1">
            Tipo, tipologia e situação dominial — todos opcionais no pré-cadastro
          </p>
        </div>

        <div className="grid gap-6">

          {/* Tipo de Imóvel — dinâmico */}
          <div className="space-y-2">
            <Label>Tipo de Imóvel</Label>
            <Select {...sel("idTipoImovel")} disabled={carregandoTipos}>
              <SelectTrigger>
                <SelectValue placeholder={carregandoTipos ? "Carregando..." : "Selecione o tipo (opcional)"} />
              </SelectTrigger>
              <SelectContent>
                {tiposImovel.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Os tipos são gerenciados pelo administrador em Configurações.
            </p>
          </div>

          {/* Tipologia */}
          <div className="space-y-2">
            <Label>Tipologia</Label>
            <Select {...sel("tipologia")}>
              <SelectTrigger><SelectValue placeholder="Selecione a tipologia (opcional)" /></SelectTrigger>
              <SelectContent>
                {["Administrativo","Educação","Saúde","Cultura","Esporte e Lazer",
                  "Segurança Pública","Assistência Social","Infraestrutura","Terreno",
                  "Residencial","Outro"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Situação Dominial — dinâmica */}
          <div className="space-y-2">
            <Label>Situação Dominial</Label>
            <Select {...sel("idSituacaoDominial")} disabled={carregandoSit}>
              <SelectTrigger>
                <SelectValue placeholder={carregandoSit ? "Carregando..." : "Selecione a situação (opcional)"} />
              </SelectTrigger>
              <SelectContent>
                {situacoes.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              As situações são gerenciadas pelo administrador em Configurações.
            </p>
          </div>

          {/* Descrição do Uso Atual */}
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