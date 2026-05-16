// Etapa 7 — Dominial e Regularização (editar)
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";
import { situacoesDominiaisApi, type SituacaoDominialResponse } from "../../../api/situacoes-dominiais";

export function EditarStep7() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa7, setEtapa7 } = useEditarImovel();

  const [situacoes,     setSituacoes]     = useState<SituacaoDominialResponse[]>([]);
  const [carregandoSit, setCarregandoSit] = useState(true);

  useEffect(() => {
    situacoesDominiaisApi.listarAtivas()
      .then(setSituacoes)
      .catch(() => {})
      .finally(() => setCarregandoSit(false));
  }, []);

  const handleNext = () => navigate(`/dashboard/imoveis/${id}/editar/etapa-8`);

  return (
    <EditarWizardLayout currentStep={7} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dominial e Regularização</h3>
          <p className="text-sm text-gray-600 mt-1">
            Registro, titularidade e situação dominial
          </p>
        </div>

        <AlertBox variant="info">
          Alterações na situação dominial são registradas em auditoria.
          Anexe documentos comprobatórios na etapa seguinte.
        </AlertBox>

        <div className="grid gap-6">
          {/* Situação Dominial */}
          <div className="space-y-2">
            <Label>Situação Dominial</Label>
            <Select
              value={etapa7.idSituacaoDominial}
              onValueChange={(v) => setEtapa7({ ...etapa7, idSituacaoDominial: v })}
              disabled={carregandoSit}
            >
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

          {/* Matrícula e Cartório */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Número da Matrícula</Label>
              <Input
                value={etapa7.matriculaRegistro}
                onChange={(e) => setEtapa7({ ...etapa7, matriculaRegistro: e.target.value.replace(/[^a-zA-Z0-9\-]/g, "") })}
                placeholder="Ex: 12345"
              />
            </div>
            <div className="space-y-2">
              <Label>Cartório de Registro</Label>
              <Input
                value={etapa7.cartorio}
                onChange={(e) => setEtapa7({ ...etapa7, cartorio: e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9\s\-\.\/°ºª]/g, "") })}
                placeholder="Ex: 1º Ofício de Registro de Imóveis"
              />
            </div>
          </div>

          {/* Inscrição imobiliária */}
          <div className="space-y-2">
            <Label>Inscrição Imobiliária (SEMFAZ)</Label>
            <Input
              value={etapa7.inscricaoImobiliaria}
              onChange={(e) => setEtapa7({ ...etapa7, inscricaoImobiliaria: e.target.value.replace(/\D/g, "") })}
              placeholder="Ex: 01.234.567-8"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações sobre Regularização</Label>
            <Textarea
              value={etapa7.observacoesDominial}
              onChange={(e) => setEtapa7({ ...etapa7, observacoesDominial: e.target.value })}
              placeholder="Processos de regularização, disputas judiciais, pendências cartoriais..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </EditarWizardLayout>
  );
}