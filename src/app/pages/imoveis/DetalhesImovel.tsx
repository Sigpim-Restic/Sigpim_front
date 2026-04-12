import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, RefreshCw, AlertCircle, MapPin, FileText,
  Building2, Users, Edit, Map,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { imoveisApi, type ImovelResponse } from "../../api/imoveis";
import { documentosApi, type DocumentoResponse } from "../../api/documentos";
import { ocupacoesApi, type OcupacaoResponse } from "../../api/ocupacoes";
import { localizacoesApi, type LocalizacaoResponse } from "../../api/localizacoes";
import { usePermissoes } from "../../hooks/usePermissoes";

// ─── helpers visuais ────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  VALIDADO:     { label: "Validado",     cls: "bg-green-100 text-green-800" },
  PRE_CADASTRO: { label: "Pré-cadastro", cls: "bg-yellow-100 text-yellow-800" },
};

const TIPO_LABEL: Record<string, string> = {
  PROPRIO: "Próprio",
  LOCADO:  "Locado",
  INCERTO: "Incerto",
};

function Campo({ label, valor }: { label: string; valor?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{valor ?? "—"}</p>
    </div>
  );
}

function Secao({ icone, titulo, children }: {
  icone: React.ReactNode; titulo: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
        <span className="text-[#1351B4]">{icone}</span>
        <h2 className="text-sm font-semibold text-gray-700">{titulo}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── componente principal ────────────────────────────────────────────────────

export function DetalhesImovel() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const perm     = usePermissoes();

  const [imovel,      setImovel]      = useState<ImovelResponse | null>(null);
  const [localizacao, setLocalizacao] = useState<LocalizacaoResponse | null>(null);
  const [documentos,  setDocumentos]  = useState<DocumentoResponse[]>([]);
  const [ocupacoes,   setOcupacoes]   = useState<OcupacaoResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);

    setLoading(true);
    setErro(null);

    Promise.all([
      imoveisApi.buscarPorId(numId),
      // BUG FIX: localizacao was never fetched in DetalhesImovel — the section
      // simply did not exist. Added here alongside the other parallel requests.
      localizacoesApi.buscarPorImovel(numId).catch(() => null),
      documentosApi.listarPorImovel(numId, 0, 5),
      ocupacoesApi.listarPorImovel(numId, 0, 5),
    ])
      .then(([im, loc, docs, ocup]) => {
        setImovel(im);
        setLocalizacao(loc);
        setDocumentos(docs.content);
        setOcupacoes(ocup.content);
      })
      .catch(() => setErro("Não foi possível carregar os dados do imóvel."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ── erro ──
  if (erro || !imovel) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{erro ?? "Imóvel não encontrado."}</p>
        </div>
      </div>
    );
  }

  const st = STATUS_CFG[imovel.statusCadastro] ?? STATUS_CFG.PRE_CADASTRO;

  return (
    <div className="space-y-5">

      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />Voltar
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#1351B4]">
                {imovel.codigoSigpim}
              </span>
              <Badge className={`text-xs ${st.cls}`} variant="secondary">
                {st.label}
              </Badge>
            </div>
            <p className="text-base font-semibold text-gray-900 mt-0.5">
              {imovel.nomeReferencia ?? "Sem nome"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => navigate(`/mapa?imovel=${imovel.id}`)}
          >
            <Map className="mr-2 h-4 w-4" />Ver no Mapa
          </Button>
          {perm.canUpdateImovel && (
            <Button
              size="sm"
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={() => navigate(`/imoveis/${imovel.id}/editar`)}
            >
              <Edit className="mr-2 h-4 w-4" />Editar
            </Button>
          )}
        </div>
      </div>

      {/* Identificação */}
      <Secao icone={<Building2 className="h-4 w-4" />} titulo="Identificação">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Campo label="Código SIGPIM"        valor={imovel.codigoSigpim} />
          <Campo label="Tipo de imóvel"       valor={TIPO_LABEL[imovel.tipoImovel] ?? imovel.tipoImovel} />
          <Campo label="Situação dominial"    valor={imovel.situacaoDominial} />
          <Campo label="Origem do cadastro"   valor={imovel.origemCadastro} />
          <Campo label="Inscrição imobiliária" valor={imovel.inscricaoImobiliaria} />
          <Campo label="Matrícula"            valor={imovel.matriculaRegistro} />
          <Campo label="Cartório"             valor={imovel.cartorio} />
          <Campo label="Versão"               valor={imovel.versao} />
        </div>
        {imovel.descricao && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-0.5">Descrição</p>
            <p className="text-sm text-gray-700">{imovel.descricao}</p>
          </div>
        )}
      </Secao>

      {/* Localização — BUG FIX: section was completely missing */}
      <Secao icone={<MapPin className="h-4 w-4" />} titulo="Localização">
        {!localizacao ? (
          <p className="text-sm text-gray-400">Nenhuma localização cadastrada.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Campo label="CEP"         valor={localizacao.cep} />
              <Campo label="Logradouro"  valor={localizacao.logradouro} />
              <Campo label="Número"      valor={localizacao.numero} />
              <Campo label="Complemento" valor={localizacao.complemento} />
              <Campo label="Bairro"      valor={localizacao.bairro} />
              <Campo label="Cidade"      valor="São Luís" />
              <Campo label="Estado"      valor="MA" />
              {localizacao.distritoRegional && (
                <Campo label="Distrito regional" valor={localizacao.distritoRegional} />
              )}
            </div>
            {(localizacao.latitude != null || localizacao.longitude != null) && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 border-t border-gray-100 pt-4">
                <Campo label="Latitude"             valor={localizacao.latitude} />
                <Campo label="Longitude"            valor={localizacao.longitude} />
                <Campo label="Sistema de coordenadas" valor={localizacao.sistemaCoordenadas} />
              </div>
            )}
          </>
        )}
      </Secao>

      {/* Dados físicos */}
      <Secao icone={<Building2 className="h-4 w-4" />} titulo="Dados Físicos">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Campo label="Área do terreno (m²)"  valor={imovel.areaTerrenoM2} />
          <Campo label="Área construída (m²)"  valor={imovel.areaConstruidaM2} />
          <Campo label="Nº de pavimentos"      valor={imovel.numeroPavimentos} />
          <Campo label="Ano de construção"     valor={imovel.anoConstrucao} />
          <Campo label="Categoria macro"       valor={imovel.categoriaMacro} />
          <Campo label="Tipologia"             valor={imovel.tipologia} />
          <Campo label="Estado de conservação" valor={imovel.estadoConservacaoAtual} />
        </div>
      </Secao>

      {/* Gestão */}
      <Secao icone={<Users className="h-4 w-4" />} titulo="Gestão">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Campo label="Registro de energia" valor={imovel.registroEnergia} />
          <Campo label="Registro de água"    valor={imovel.registroAgua} />
          <Campo label="Cadastrado em"       valor={imovel.criadoEm?.slice(0, 10)} />
          <Campo label="Atualizado em"       valor={imovel.atualizadoEm?.slice(0, 10)} />
        </div>
        {imovel.observacoesGerais && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-0.5">Observações gerais</p>
            <p className="text-sm text-gray-700">{imovel.observacoesGerais}</p>
          </div>
        )}
      </Secao>

      {/* Ocupação vigente */}
      <Secao icone={<Users className="h-4 w-4" />} titulo="Ocupação">
        {ocupacoes.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma ocupação registrada.</p>
        ) : (
          <div className="space-y-3">
            {ocupacoes.map((oc) => (
              <div
                key={oc.id}
                className={`rounded-lg border p-4 ${
                  oc.vigente ? "border-blue-200 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${oc.vigente ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}
                  >
                    {oc.vigente ? "Vigente" : "Encerrada"}
                  </Badge>
                  <span className="text-xs text-gray-500">{oc.statusOcupacao}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Campo label="Ocupante externo"  valor={oc.nomeOcupanteExterno} />
                  <Campo label="Responsável local" valor={oc.nomeResponsavelLocal} />
                  <Campo label="Contato"           valor={oc.contatoResponsavel} />
                  <Campo label="Finalidade"        valor={oc.destinacaoFinalidade} />
                  <Campo label="Início"            valor={oc.dataInicio} />
                  <Campo label="Fim previsto"      valor={oc.dataFimPrevista} />
                </div>
                {oc.observacoes && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-0.5">Observações</p>
                    <p className="text-sm text-gray-700">{oc.observacoes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Secao>

      {/* Documentos recentes */}
      <Secao icone={<FileText className="h-4 w-4" />} titulo="Documentos recentes">
        {documentos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum documento anexado.</p>
        ) : (
          <div className="space-y-2">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5"
              >
                <div>
                  <span className="text-xs font-medium text-gray-700">{doc.tipoDocumento}</span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{doc.descricao}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {doc.statusValidacao}
                </Badge>
              </div>
            ))}
            <Link
              to="/documentos"
              className="block text-center text-xs text-[#1351B4] hover:underline mt-2"
            >
              Ver todos os documentos
            </Link>
          </div>
        )}
      </Secao>

    </div>
  );
}