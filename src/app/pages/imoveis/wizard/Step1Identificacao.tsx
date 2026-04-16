import React, { useState, useEffect } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";
import { orgaosApi, type OrgaoResponse } from "../../../api/orgaos";
import { unidadesApi, type UnidadeOrganizacionalResponse } from "../../../api/unidades";

export function CadastroImovelStep1() {
  const { etapa1, setEtapa1 } = useCadastroImovel();
  const navigate = useNavigate();

  const [orgaos,              setOrgaos]              = useState<OrgaoResponse[]>([]);
  const [unidades,            setUnidades]            = useState<UnidadeOrganizacionalResponse[]>([]);
  const [carregandoOrgaos,    setCarregandoOrgaos]    = useState(true);
  const [carregandoUnidades,  setCarregandoUnidades]  = useState(false);
  const [erroCarregamento,    setErroCarregamento]    = useState<string | null>(null);

  useEffect(() => {
    orgaosApi.listarAtivos()
      .then(setOrgaos)
      .catch(() => setErroCarregamento("Não foi possível carregar os órgãos."))
      .finally(() => setCarregandoOrgaos(false));
  }, []);

  useEffect(() => {
    if (!etapa1.idOrgaoGestorPatrimonial) { setUnidades([]); return; }
    setCarregandoUnidades(true);
    unidadesApi.listarAtivasPorOrgao(Number(etapa1.idOrgaoGestorPatrimonial))
      .then(setUnidades)
      .catch(() => setErroCarregamento("Não foi possível carregar as unidades."))
      .finally(() => setCarregandoUnidades(false));
  }, [etapa1.idOrgaoGestorPatrimonial]);

  // No mandatory validation for pre-registration.
  // The user can advance without filling any field.
  const handleNext = () => navigate("/imoveis/novo/etapa-2");

  const handleBack = () => navigate(-1);

  return (
    <WizardLayout currentStep={1} onNext={handleNext} onBack={handleBack}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Identificação</h3>
          <p className="text-sm text-gray-600 mt-1">Dados básicos do imóvel — todos os campos são opcionais no pré-cadastro</p>
        </div>

        {/* Info box explaining pre-registration */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <span className="font-medium">Pré-cadastro:</span> nenhum campo é obrigatório aqui. Preencha o que souber agora e complemente depois. Os campos obrigatórios só são exigidos na transição para <strong>Validado</strong>.
        </div>

        {erroCarregamento && (
          <AlertBox variant="error" title="Erro ao carregar dados">
            {erroCarregamento}
          </AlertBox>
        )}

        <div className="grid gap-5">

          {/* Nome de Referência */}
          <div className="space-y-2">
            <Label>Denominação / Nome de Referência</Label>
            <Input
              placeholder="Ex: Escola Municipal Padre Anchieta, Terreno Lote 42..."
              value={etapa1.nomeReferencia}
              onChange={(e) => setEtapa1({ ...etapa1, nomeReferencia: e.target.value })}
            />
            <p className="text-xs text-gray-500">Nome popular, apelido ou referência informal. Opcional.</p>
          </div>

          {/* Órgão responsável */}
          <div className="space-y-2">
            <Label>Órgão Responsável (Gestor Patrimonial)</Label>
            <Select
              value={etapa1.idOrgaoGestorPatrimonial}
              onValueChange={(v) => setEtapa1({ ...etapa1, idOrgaoGestorPatrimonial: v, idUnidadeGestora: "" })}
              disabled={carregandoOrgaos}
            >
              <SelectTrigger>
                <SelectValue placeholder={carregandoOrgaos ? "Carregando..." : "Selecione o órgão (opcional)"} />
              </SelectTrigger>
              <SelectContent>
                {orgaos.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>{o.sigla} – {o.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unidade Gestora */}
          <div className="space-y-2">
            <Label>Unidade Gestora</Label>
            <Select
              value={etapa1.idUnidadeGestora}
              onValueChange={(v) => setEtapa1({ ...etapa1, idUnidadeGestora: v })}
              disabled={!etapa1.idOrgaoGestorPatrimonial || carregandoUnidades}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !etapa1.idOrgaoGestorPatrimonial
                      ? "Selecione primeiro o órgão"
                      : carregandoUnidades
                      ? "Carregando..."
                      : "Selecione a unidade (opcional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações Gerais</Label>
            <Textarea
              placeholder="Contexto, informações complementares, situação de levantamento..."
              value={etapa1.observacoesGerais}
              onChange={(e) => setEtapa1({ ...etapa1, observacoesGerais: e.target.value })}
              rows={3}
            />
          </div>

        </div>
      </div>
    </WizardLayout>
  );
}