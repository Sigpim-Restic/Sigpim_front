// ─── Etapa 3 — Classificação (editar) ────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";
import { tiposImovelApi, type TipoImovelResponse } from "../../../api/tipos-imovel-alertas";
import { situacoesDominiaisApi, type SituacaoDominialResponse } from "../../../api/situacoes-dominiais";

export function EditarStep3() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa3, setEtapa3 } = useEditarImovel();

  const [tiposImovel,     setTiposImovel]     = useState<TipoImovelResponse[]>([]);
  const [situacoes,       setSituacoes]       = useState<SituacaoDominialResponse[]>([]);
  const [carregandoTipos, setCarregandoTipos] = useState(true);
  const [carregandoSit,   setCarregandoSit]   = useState(true);

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

  const sel = (field: keyof typeof etapa3) => ({
    value: etapa3[field],
    onValueChange: (v: string) => setEtapa3({ ...etapa3, [field]: v }),
  });

  return (
    <EditarWizardLayout
      currentStep={3}
      onNext={() => navigate(`/imoveis/${id}/editar/etapa-4`)}
    >
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Classificação e Uso</h3>
          <p className="text-sm text-gray-600 mt-1">Tipo, tipologia e situação dominial do imóvel</p>
        </div>

        <div className="grid gap-6">

          {/* Tipo de Imóvel — dinâmico */}
          <div className="space-y-2">
            <Label>Tipo de Imóvel</Label>
            <Select {...sel("idTipoImovel")} disabled={carregandoTipos}>
              <SelectTrigger>
                <SelectValue placeholder={carregandoTipos ? "Carregando..." : "Selecione o tipo"} />
              </SelectTrigger>
              <SelectContent>
                {tiposImovel.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>
                ))}
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
                <SelectValue placeholder={carregandoSit ? "Carregando..." : "Selecione a situação"} />
              </SelectTrigger>
              <SelectContent>
                {situacoes.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição do Uso Atual</Label>
            <Textarea
              value={etapa3.descricaoUso}
              onChange={(e) => setEtapa3({ ...etapa3, descricaoUso: e.target.value })}
              placeholder="Descreva o uso atual do imóvel..."
              rows={4}
            />
          </div>

        </div>
      </div>
    </EditarWizardLayout>
  );
}