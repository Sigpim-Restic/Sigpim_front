import React, { useState, useEffect } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { AlertBox } from "../../../components/layout/States";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";
import { orgaosApi, type OrgaoResponse } from "../../../api/orgaos";
import { unidadesApi, type UnidadeOrganizacionalResponse } from "../../../api/unidades";

export function CadastroImovelStep1() {
  const { etapa1, setEtapa1 } = useCadastroImovel();
  const navigate = useNavigate();

  const [erros, setErros] = useState<Record<string, string>>({});
  const [orgaos, setOrgaos] = useState<OrgaoResponse[]>([]);
  const [unidades, setUnidades] = useState<UnidadeOrganizacionalResponse[]>([]);
  const [carregandoOrgaos, setCarregandoOrgaos] = useState(true);
  const [carregandoUnidades, setCarregandoUnidades] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  // Carrega órgãos ativos ao montar o componente
  useEffect(() => {
    orgaosApi
      .listarAtivos()
      .then(setOrgaos)
      .catch(() => setErroCarregamento("Não foi possível carregar os órgãos. Tente recarregar a página."))
      .finally(() => setCarregandoOrgaos(false));
  }, []);

  // Carrega unidades sempre que o órgão selecionado mudar
  useEffect(() => {
    if (!etapa1.idOrgaoGestorPatrimonial) {
      setUnidades([]);
      return;
    }

    setCarregandoUnidades(true);
    unidadesApi
      .listarAtivasPorOrgao(Number(etapa1.idOrgaoGestorPatrimonial))
      .then(setUnidades)
      .catch(() => setErroCarregamento("Não foi possível carregar as unidades. Tente recarregar a página."))
      .finally(() => setCarregandoUnidades(false));
  }, [etapa1.idOrgaoGestorPatrimonial]);

  // Pré-cadastro: nenhum campo é obrigatório (Manual SIGPIM §4.2 — Checklist P).
  // A denominação é fortemente recomendada mas não trava o fluxo.
  const validar = () => {
    setErros({});
    return true;
  };

  const handleNext = () => {
    if (validar()) navigate("/dashboard/imoveis/novo/etapa-2");
  };

  const handleOrgaoChange = (idOrgao: string) => {
    // Ao trocar o órgão, limpa a unidade selecionada
    setEtapa1({ ...etapa1, idOrgaoGestorPatrimonial: idOrgao, idUnidadeGestora: "" });
  };

  return (
    <WizardLayout currentStep={1} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Identificação e Governança</h3>
          <p className="text-sm text-gray-600 mt-1">
            Informações básicas e responsáveis pela gestão do imóvel
          </p>
        </div>

        {erroCarregamento ? (
          <AlertBox variant="error">{erroCarregamento}</AlertBox>
        ) : (
          <AlertBox variant="info">
            Pré-cadastro: preencha o que souber agora. Campos incompletos viram pendências formais — nada bloqueia o registro inicial.
          </AlertBox>
        )}

        <div className="grid gap-6">
          {/* Denominação */}
          <div className="space-y-2">
            <Label htmlFor="nomeReferencia">
              Denominação do Imóvel
            </Label>
            <Input
              id="nomeReferencia"
              value={etapa1.nomeReferencia}
              onChange={(e) => setEtapa1({ ...etapa1, nomeReferencia: e.target.value })}
              placeholder="Ex: Escola Municipal João Silva"
              className={erros.nomeReferencia ? "border-red-400" : ""}
            />
            {erros.nomeReferencia && (
              <p className="text-xs text-red-500">{erros.nomeReferencia}</p>
            )}
          </div>

          {/* Órgão e Unidade */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgao">
                Órgão Responsável
              </Label>
              <Select
                value={etapa1.idOrgaoGestorPatrimonial}
                onValueChange={handleOrgaoChange}
                disabled={carregandoOrgaos}
              >
                <SelectTrigger className={erros.idOrgaoGestorPatrimonial ? "border-red-400" : ""}>
                  <SelectValue
                    placeholder={carregandoOrgaos ? "Carregando órgãos..." : "Selecione o órgão"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {orgaos.map((o) => (
                    // value é o ID numérico como string — o padrão do Select do shadcn/ui
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.sigla} – {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.idOrgaoGestorPatrimonial && (
                <p className="text-xs text-red-500">{erros.idOrgaoGestorPatrimonial}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">
                Unidade Gestora
              </Label>
              <Select
                value={etapa1.idUnidadeGestora}
                onValueChange={(v) => setEtapa1({ ...etapa1, idUnidadeGestora: v })}
                disabled={!etapa1.idOrgaoGestorPatrimonial || carregandoUnidades}
              >
                <SelectTrigger className={erros.idUnidadeGestora ? "border-red-400" : ""}>
                  <SelectValue
                    placeholder={
                      carregandoUnidades
                        ? "Carregando unidades..."
                        : etapa1.idOrgaoGestorPatrimonial
                        ? "Selecione a unidade"
                        : "Selecione primeiro o órgão"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    // value é o ID numérico como string
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.idUnidadeGestora && (
                <p className="text-xs text-red-500">{erros.idUnidadeGestora}</p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              value={etapa1.observacoesGerais}
              onChange={(e) => setEtapa1({ ...etapa1, observacoesGerais: e.target.value })}
              placeholder="Informações adicionais relevantes sobre o imóvel..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}