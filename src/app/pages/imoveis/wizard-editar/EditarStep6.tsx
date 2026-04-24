// ─── Etapa 6 — Dominial e Regularização (editar) ─────────────────────────────
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

export function EditarStep6() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa6, setEtapa6, salvar, salvando, erro } = useEditarImovel();

  const [situacoes,     setSituacoes]     = useState<SituacaoDominialResponse[]>([]);
  const [carregandoSit, setCarregandoSit] = useState(true);

  useEffect(() => {
    situacoesDominiaisApi.listarAtivas()
      .then(setSituacoes)
      .catch(() => {})
      .finally(() => setCarregandoSit(false));
  }, []);

  const handleSalvar = () => {
    salvar(() => navigate(`/imoveis/${id}`));
  };

  return (
    <EditarWizardLayout currentStep={6} onNext={handleSalvar} salvando={salvando}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dominial e Regularização</h3>
          <p className="text-sm text-gray-600 mt-1">
            Registro, titularidade e situação dominial do imóvel
          </p>
        </div>

        {erro && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <AlertBox variant="info">
          Alterações na situação dominial são registradas em auditoria.
          Anexe documentos comprobatórios na aba Documentos após salvar.
        </AlertBox>

        <div className="grid gap-6">

          <div className="space-y-2">
            <Label>Situação Dominial</Label>
            <Select
              value={etapa6.idSituacaoDominial}
              onValueChange={(v) => setEtapa6({ ...etapa6, idSituacaoDominial: v })}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Número da Matrícula</Label>
              <Input
                value={etapa6.matriculaRegistro}
                onChange={(e) => setEtapa6({ ...etapa6, matriculaRegistro: e.target.value })}
                placeholder="Ex: 12345"
              />
            </div>
            <div className="space-y-2">
              <Label>Cartório de Registro</Label>
              <Input
                value={etapa6.cartorio}
                onChange={(e) => setEtapa6({ ...etapa6, cartorio: e.target.value })}
                placeholder="Ex: 1º Ofício de Registro de Imóveis"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inscrição Imobiliária (SEMFAZ)</Label>
            <Input
              value={etapa6.inscricaoImobiliaria}
              onChange={(e) => setEtapa6({ ...etapa6, inscricaoImobiliaria: e.target.value })}
              placeholder="Ex: 01.234.567-8"
            />
          </div>

          <div className="space-y-2">
            <Label>Observações sobre Regularização</Label>
            <Textarea
              value={etapa6.observacoesDominial}
              onChange={(e) => setEtapa6({ ...etapa6, observacoesDominial: e.target.value })}
              placeholder="Processos de regularização, disputas judiciais, pendências cartoriais..."
              rows={3}
            />
          </div>

        </div>
      </div>
    </EditarWizardLayout>
  );
}
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

export function EditarStep6() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa6, setEtapa6 } = useEditarImovel();

  const [situacoes,     setSituacoes]     = useState<SituacaoDominialResponse[]>([]);
  const [carregandoSit, setCarregandoSit] = useState(true);

  useEffect(() => {
    situacoesDominiaisApi.listarAtivas()
      .then(setSituacoes)
      .catch(() => {})
      .finally(() => setCarregandoSit(false));
  }, []);

  return (
    <EditarWizardLayout
      currentStep={6}
      onNext={() => navigate(`/imoveis/${id}`)}
      isLastStep
    >
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Dominial e Regularização</h3>
          <p className="text-sm text-gray-600 mt-1">
            Registro, titularidade e situação dominial do imóvel
          </p>
        </div>

        <AlertBox variant="info">
          Alterações na situação dominial são registradas em auditoria.
          Anexe documentos comprobatórios na aba Documentos após salvar.
        </AlertBox>

        <div className="grid gap-6">

          {/* Situação Dominial — dinâmica */}
          <div className="space-y-2">
            <Label>Situação Dominial</Label>
            <Select
              value={etapa6.idSituacaoDominial}
              onValueChange={(v) => setEtapa6({ ...etapa6, idSituacaoDominial: v })}
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
                value={etapa6.matriculaRegistro}
                onChange={(e) => setEtapa6({ ...etapa6, matriculaRegistro: e.target.value })}
                placeholder="Ex: 12345"
              />
            </div>
            <div className="space-y-2">
              <Label>Cartório de Registro</Label>
              <Input
                value={etapa6.cartorio}
                onChange={(e) => setEtapa6({ ...etapa6, cartorio: e.target.value })}
                placeholder="Ex: 1º Ofício de Registro de Imóveis"
              />
            </div>
          </div>

          {/* Inscrição imobiliária */}
          <div className="space-y-2">
            <Label>Inscrição Imobiliária (SEMFAZ)</Label>
            <Input
              value={etapa6.inscricaoImobiliaria}
              onChange={(e) => setEtapa6({ ...etapa6, inscricaoImobiliaria: e.target.value })}
              placeholder="Ex: 01.234.567-8"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações sobre Regularização</Label>
            <Textarea
              value={etapa6.observacoesDominial}
              onChange={(e) => setEtapa6({ ...etapa6, observacoesDominial: e.target.value })}
              placeholder="Processos de regularização, disputas judiciais, pendências cartoriais..."
              rows={3}
            />
          </div>

          {/* Patrimônio Histórico */}
          <div className="space-y-2">
            <Label>Patrimônio Histórico ou Cultural?</Label>
            <select
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
              value={etapa6.imovelHistorico === true ? "true" : etapa6.imovelHistorico === false ? "false" : ""}
              onChange={(e) => setEtapa6({
                ...etapa6,
                imovelHistorico: e.target.value === "true" ? true : e.target.value === "false" ? false : null,
              })}
            >
              <option value="">Não informado</option>
              <option value="false">Não</option>
              <option value="true">Sim — aciona gate FUMPH em intervenções N1+</option>
            </select>
            {etapa6.imovelHistorico === true && (
              <p className="text-xs text-orange-600">
                ⚠ Intervenções nível N1 ou superior exigirão parecer e aceite da FUMPH.
              </p>
            )}
          </div>

        </div>
      </div>
    </EditarWizardLayout>
  );
}