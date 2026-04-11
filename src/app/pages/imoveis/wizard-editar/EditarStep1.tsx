import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { orgaosApi, type OrgaoResponse } from "../../../api/orgaos";
import { unidadesApi, type UnidadeOrganizacionalResponse } from "../../../api/unidades";
import { EditarWizardLayout } from "./EditarWizardLayout";

export function EditarStep1() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { etapa1, setEtapa1 } = useEditarImovel();

  const [erros, setErros] = useState<Record<string, string>>({});
  const [orgaos, setOrgaos] = useState<OrgaoResponse[]>([]);
  const [unidades, setUnidades] = useState<UnidadeOrganizacionalResponse[]>([]);
  const [carregandoOrgaos, setCarregandoOrgaos] = useState(true);
  const [carregandoUnidades, setCarregandoUnidades] = useState(false);

  useEffect(() => {
    orgaosApi.listarAtivos()
      .then(setOrgaos)
      .finally(() => setCarregandoOrgaos(false));
  }, []);

  useEffect(() => {
    if (!etapa1.idOrgaoGestorPatrimonial) { setUnidades([]); return; }
    setCarregandoUnidades(true);
    unidadesApi.listarAtivasPorOrgao(Number(etapa1.idOrgaoGestorPatrimonial))
      .then(setUnidades)
      .finally(() => setCarregandoUnidades(false));
  }, [etapa1.idOrgaoGestorPatrimonial]);

  const validar = () => {
    const e: Record<string, string> = {};
    if (!etapa1.nomeReferencia.trim()) e.nomeReferencia = "Denominação é obrigatória.";
    if (!etapa1.idOrgaoGestorPatrimonial) e.idOrgaoGestorPatrimonial = "Selecione o órgão responsável.";
    if (!etapa1.idUnidadeGestora) e.idUnidadeGestora = "Selecione a unidade gestora.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validar()) navigate(`/imoveis/${id}/editar/etapa-2`);
  };

  return (
    <EditarWizardLayout currentStep={1} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Identificação e Governança</h3>
          <p className="text-sm text-gray-600 mt-1">Informações básicas e responsáveis pela gestão do imóvel</p>
        </div>

        <AlertBox variant="info">Campos com <span className="text-red-600">*</span> são obrigatórios.</AlertBox>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label>Denominação do Imóvel <span className="text-red-600">*</span></Label>
            <Input
              value={etapa1.nomeReferencia}
              onChange={(e) => setEtapa1({ ...etapa1, nomeReferencia: e.target.value })}
              placeholder="Ex: Escola Municipal João Silva"
              className={erros.nomeReferencia ? "border-red-400" : ""}
            />
            {erros.nomeReferencia && <p className="text-xs text-red-500">{erros.nomeReferencia}</p>}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Órgão Responsável <span className="text-red-600">*</span></Label>
              <Select
                value={etapa1.idOrgaoGestorPatrimonial}
                onValueChange={(v) => setEtapa1({ ...etapa1, idOrgaoGestorPatrimonial: v, idUnidadeGestora: "" })}
                disabled={carregandoOrgaos}
              >
                <SelectTrigger className={erros.idOrgaoGestorPatrimonial ? "border-red-400" : ""}>
                  <SelectValue placeholder={carregandoOrgaos ? "Carregando..." : "Selecione o órgão"} />
                </SelectTrigger>
                <SelectContent>
                  {orgaos.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.sigla} – {o.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.idOrgaoGestorPatrimonial && <p className="text-xs text-red-500">{erros.idOrgaoGestorPatrimonial}</p>}
            </div>

            <div className="space-y-2">
              <Label>Unidade Gestora <span className="text-red-600">*</span></Label>
              <Select
                value={etapa1.idUnidadeGestora}
                onValueChange={(v) => setEtapa1({ ...etapa1, idUnidadeGestora: v })}
                disabled={!etapa1.idOrgaoGestorPatrimonial || carregandoUnidades}
              >
                <SelectTrigger className={erros.idUnidadeGestora ? "border-red-400" : ""}>
                  <SelectValue placeholder={
                    carregandoUnidades ? "Carregando..." :
                    etapa1.idOrgaoGestorPatrimonial ? "Selecione a unidade" : "Selecione primeiro o órgão"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.idUnidadeGestora && <p className="text-xs text-red-500">{erros.idUnidadeGestora}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações Gerais</Label>
            <Textarea
              value={etapa1.observacoesGerais}
              onChange={(e) => setEtapa1({ ...etapa1, observacoesGerais: e.target.value })}
              placeholder="Informações adicionais relevantes sobre o imóvel..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </EditarWizardLayout>
  );
}
