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
import { imoveisApi } from "../../../api/imoveis";

// Opções de origem do cadastro — Manual SIGPIM §4.2 / campo origem_cadastro
const ORIGENS = [
  { value: "LEVANTAMENTO_CAMPO",      label: "Levantamento em campo" },
  { value: "DEMANDA_SECRETARIA",      label: "Demanda de secretaria" },
  { value: "PROCESSO_ADMINISTRATIVO", label: "Processo administrativo" },
  { value: "IMPORTACAO_PLANILHA",     label: "Importação de planilha" },
  { value: "DENUNCIA",                label: "Denúncia / ocorrência" },
  { value: "OUTRO",                   label: "Outro" },
];

export function CadastroImovelStep1() {
  const { etapa1, setEtapa1 } = useCadastroImovel();
  const navigate = useNavigate();

  const [erros, setErros] = useState<Record<string, string>>({});
  const [orgaos, setOrgaos] = useState<OrgaoResponse[]>([]);
  const [unidades, setUnidades] = useState<UnidadeOrganizacionalResponse[]>([]);
  const [carregandoOrgaos, setCarregandoOrgaos] = useState(true);
  const [carregandoUnidades, setCarregandoUnidades] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [verificandoNome, setVerificandoNome] = useState(false);

  useEffect(() => {
    orgaosApi
      .listarAtivos()
      .then(setOrgaos)
      .catch(() => setErroCarregamento("Não foi possível carregar os órgãos. Tente recarregar a página."))
      .finally(() => setCarregandoOrgaos(false));
  }, []);

  useEffect(() => {
    if (!etapa1.idOrgaoGestorPatrimonial) { setUnidades([]); return; }
    setCarregandoUnidades(true);
    unidadesApi
      .listarAtivasPorOrgao(Number(etapa1.idOrgaoGestorPatrimonial))
      .then(setUnidades)
      .catch(() => setErroCarregamento("Não foi possível carregar as unidades. Tente recarregar a página."))
      .finally(() => setCarregandoUnidades(false));
  }, [etapa1.idOrgaoGestorPatrimonial]);

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEtapa1({ ...etapa1, nomeReferencia: e.target.value });
    if (erros.nomeReferencia) setErros((prev) => ({ ...prev, nomeReferencia: "" }));
  };

  const handleNext = async () => {
    const novosErros: Record<string, string> = {};

    // Origem do cadastro — obrigatória no pré-cadastro (Manual SIGPIM §4.2)
    if (!etapa1.origemCadastro) {
      novosErros.origemCadastro = "Informe a origem do cadastro. Este campo é obrigatório no pré-cadastro.";
    }

    // Nome: se preenchido, verificar duplicidade antes de avançar
    if (etapa1.nomeReferencia.trim()) {
      setVerificandoNome(true);
      try {
        const { disponivel } = await imoveisApi.verificarNome(etapa1.nomeReferencia.trim());
        if (!disponivel) {
          novosErros.nomeReferencia = `Já existe um imóvel cadastrado com o nome "${etapa1.nomeReferencia.trim()}". Utilize um nome diferente.`;
        }
      } catch {
        // Falha na verificação: permite avançar; o backend barrerá no POST final
      } finally {
        setVerificandoNome(false);
      }
    }

    if (Object.values(novosErros).some(Boolean)) {
      setErros(novosErros);
      return;
    }

    navigate("/dashboard/imoveis/novo/etapa-2");
  };

  const handleOrgaoChange = (idOrgao: string) => {
    setEtapa1({ ...etapa1, idOrgaoGestorPatrimonial: idOrgao, idUnidadeGestora: "" });
  };

  return (
    <WizardLayout currentStep={1} onNext={handleNext} nextDisabled={verificandoNome}>
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
            Pré-cadastro: preencha o que souber agora. Campos marcados com{" "}
            <span className="text-red-500 font-medium">*</span> são obrigatórios para avançar.
          </AlertBox>
        )}

        <div className="grid gap-6">

          {/* ── Origem do cadastro — OBRIGATÓRIA ──────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="origemCadastro">
              Origem do Cadastro <span className="text-red-500">*</span>
            </Label>
            <Select
              value={etapa1.origemCadastro}
              onValueChange={(v) => {
                setEtapa1({ ...etapa1, origemCadastro: v });
                if (erros.origemCadastro) setErros((prev) => ({ ...prev, origemCadastro: "" }));
              }}
            >
              <SelectTrigger className={erros.origemCadastro ? "border-red-400" : ""}>
                <SelectValue placeholder="Como este imóvel foi identificado?" />
              </SelectTrigger>
              <SelectContent>
                {ORIGENS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.origemCadastro && (
              <p className="text-xs text-red-500">{erros.origemCadastro}</p>
            )}
          </div>

          {/* ── Denominação ───────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="nomeReferencia">Denominação do Imóvel</Label>
            <Input
              id="nomeReferencia"
              value={etapa1.nomeReferencia}
              onChange={handleNomeChange}
              placeholder="Ex: Escola Municipal João Silva"
              className={erros.nomeReferencia ? "border-red-400" : ""}
            />
            {verificandoNome && (
              <p className="text-xs text-gray-400">Verificando disponibilidade do nome...</p>
            )}
            {erros.nomeReferencia && (
              <p className="text-xs text-red-500">{erros.nomeReferencia}</p>
            )}
          </div>

          {/* ── Órgão e Unidade ───────────────────────────────────────────── */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgao">Órgão Responsável</Label>
              <Select
                value={etapa1.idOrgaoGestorPatrimonial}
                onValueChange={handleOrgaoChange}
                disabled={carregandoOrgaos}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={carregandoOrgaos ? "Carregando órgãos..." : "Selecione o órgão"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {orgaos.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.sigla} – {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade Gestora</Label>
              <Select
                value={etapa1.idUnidadeGestora}
                onValueChange={(v) => setEtapa1({ ...etapa1, idUnidadeGestora: v })}
                disabled={!etapa1.idOrgaoGestorPatrimonial || carregandoUnidades}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      carregandoUnidades ? "Carregando unidades..."
                      : etapa1.idOrgaoGestorPatrimonial ? "Selecione a unidade"
                      : "Selecione primeiro o órgão"
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
          </div>

          {/* ── Observações ───────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              value={etapa1.observacoesGerais}
              onChange={(e) => setEtapa1({ ...etapa1, observacoesGerais: e.target.value.slice(0, 500) })}
              placeholder="Informações adicionais relevantes sobre o imóvel..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Máximo de 500 caracteres ({etapa1.observacoesGerais.length}/500).
            </p>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}