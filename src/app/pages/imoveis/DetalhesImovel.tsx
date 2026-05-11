import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, RefreshCw, AlertCircle, MapPin, FileText,
  Building2, Users, Edit, Map, Download, Loader2,
  CheckCircle2, XCircle, AlertTriangle, Bell, Shield, GitFork,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { imoveisApi, type ImovelResponse } from "../../api/imoveis";
import { PainelValidacaoAbas } from "../../components/imoveis/PainelValidacaoAbas";
import { documentosApi, type DocumentoResponse } from "../../api/documentos";
import { ocupacoesApi, type OcupacaoResponse } from "../../api/ocupacoes";
import { localizacoesApi, type LocalizacaoResponse } from "../../api/localizacoes";
import { relatoriosApi } from "../../api/relatorios";
import { usePermissoes } from "../../hooks/usePermissoes";
import { toast } from "sonner";
import { AbaVistorias } from "./AbaVistorias";
import { AbaIntervencoes } from "./AbaIntervencoes";
import { AbaFiscal } from "./AbaFiscal";
import { AbaAvaliacaoPatrimonial } from "./AbaAvaliacaoPatrimonial";
import { AbaInstrumentosUso } from "./AbaInstrumentosUso";
import { AbaContratosLocacao } from "./AbaContratosLocacao";
import { ModalDesmembramento } from "./ModalDesmembramento";
import { STATUS_CFG, fmt, Campo, Secao } from "./imovelHelpers";

// ─── Componente principal ─────────────────────────────────────────────────────

export function DetalhesImovel() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const perm     = usePermissoes();

  const [imovel,      setImovel]      = useState<ImovelResponse | null>(null);
  const [documentos,  setDocumentos]  = useState<DocumentoResponse[]>([]);
  const [ocupacoes,   setOcupacoes]   = useState<OcupacaoResponse[]>([]);
  const [localizacao, setLocalizacao] = useState<LocalizacaoResponse | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [loadingPdf,       setLoadingPdf]       = useState(false);
  const [erroPdf,          setErroPdf]          = useState<string | null>(null);
  const [loadingValidacao, setLoadingValidacao] = useState(false);
  const [erroValidacao,    setErroValidacao]    = useState<string | null>(null);
  const [pendencias,       setPendencias]       = useState<string[]>([]);

  // Modal de recusa
  const [modalRecusa,   setModalRecusa]   = useState(false);
  const [motivoRecusa,  setMotivoRecusa]  = useState("");
  const [erroRecusa,    setErroRecusa]    = useState<string | null>(null);
  const [salvandoRecusa, setSalvandoRecusa] = useState(false);

  const [loadingNotificar,  setLoadingNotificar]  = useState(false);
  const [erroNotificar,     setErroNotificar]      = useState<string | null>(null);
  const [notificadoOk,      setNotificadoOk]       = useState(false);
  // Pendências do checklist de validação — consultadas ao carregar o imóvel
  const [pendenciasChecklist, setPendenciasChecklist] = useState<string[]>([]);

  const handleNotificarValidador = async () => {
    if (!imovel) return;
    setLoadingNotificar(true); setErroNotificar(null); setNotificadoOk(false);
    try {
      await imoveisApi.notificarPendenciasCorrigidas(imovel.id);
      setNotificadoOk(true);
      setTimeout(() => setNotificadoOk(false), 5000);
    } catch (e: unknown) {
      setErroNotificar(e instanceof Error ? e.message : "Erro ao notificar validador.");
    } finally { setLoadingNotificar(false); }
  };

  const handleValidar = async () => {
    if (!imovel) return;
    setLoadingValidacao(true); setErroValidacao(null); setPendencias([]);
    try {
      const res = await imoveisApi.validar(imovel.id);
      if (res.validado) {
        setImovel((prev) => prev ? { ...prev, statusCadastro: "VALIDADO" } : prev);
      } else {
        setPendencias(res.pendencias ?? []);
      }
    } catch (e: unknown) {
      setErroValidacao(e instanceof Error ? e.message : "Erro ao validar imóvel.");
    } finally { setLoadingValidacao(false); }
  };

  const handlePromoverGestaoPlena = async () => {
    if (!imovel) return;
    setLoadingValidacao(true); setErroValidacao(null); setPendencias([]);
    try {
      const res = await imoveisApi.promoverGestaoPlena(imovel.id);
      if (res.validado) {
        setImovel((prev) => prev ? { ...prev, statusCadastro: "GESTAO_PLENA" } : prev);
      } else {
        setPendencias(res.pendencias ?? []);
      }
    } catch (e: unknown) {
      setErroValidacao(e instanceof Error ? e.message : "Erro ao promover para Gestão Plena.");
    } finally { setLoadingValidacao(false); }
  };

  const handleConfirmarRecusa = async () => {
    if (!imovel) return;
    if (motivoRecusa.trim().length < 10) {
      setErroRecusa("O motivo deve ter pelo menos 10 caracteres.");
      return;
    }
    setSalvandoRecusa(true); setErroRecusa(null);
    try {
      await imoveisApi.recusarValidacao(imovel.id, motivoRecusa.trim());
      setModalRecusa(false);
      setMotivoRecusa("");
      // Feedback visual: alerta de sucesso temporário
      setErroValidacao(null);
      setPendencias([]);
      // Mostra confirmação inline usando o mesmo estado de pendências com msg especial
      setPendencias(["✓ Recusa registrada. O órgão gestor foi notificado com o motivo informado."]);
    } catch (e: unknown) {
      setErroRecusa(e instanceof Error ? e.message : "Erro ao registrar recusa.");
    } finally { setSalvandoRecusa(false); }
  };

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    setLoading(true); setErro(null);

    Promise.all([
      imoveisApi.buscarPorId(numId),
      documentosApi.listarPorImovel(numId, 0, 5),
      ocupacoesApi.listarPorImovel(numId, 0, 5),
      localizacoesApi.buscarPorImovel(numId).catch(() => null),
    ])
      .then(([im, docs, ocup, loc]) => {
        setImovel(im);
        setDocumentos(docs.content);
        setOcupacoes(ocup.content);
        setLocalizacao(loc);
        // Consulta pendências do checklist se imóvel está em PRE_CADASTRO
        if (im.statusCadastro === "PRE_CADASTRO") {
          imoveisApi.verificarPendencias(numId)
            .then(setPendenciasChecklist)
            .catch(() => setPendenciasChecklist([]));
        } else {
          setPendenciasChecklist([]);
        }
      })
      .catch(() => setErro("Não foi possível carregar os dados do imóvel."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGerarFicha = async () => {
    if (!id) return;
    setLoadingPdf(true); setErroPdf(null);
    try {
      const { blob, nomeArquivo } = await relatoriosApi.gerarFichaPdf(Number(id));
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href = url; a.download = nomeArquivo; a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setErroPdf(e instanceof Error ? e.message : "Erro ao gerar PDF.");
    } finally { setLoadingPdf(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );

  if (erro || !imovel) return (
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

  const st = STATUS_CFG[imovel.statusCadastro] ?? STATUS_CFG.PRE_CADASTRO;

  return (
    <div className="space-y-5">

      {/* Modal de recusa de validação */}
      <Dialog open={modalRecusa} onOpenChange={(v) => {
        if (!v) { setModalRecusa(false); setMotivoRecusa(""); setErroRecusa(null); }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Recusar Validação — {imovel.codigoSigpim}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              O imóvel <strong>permanecerá em Pré-cadastro</strong>. O motivo será registrado
              em auditoria e enviado como alerta ao órgão gestor patrimonial do imóvel,
              para que saibam exatamente o que corrigir.
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivoRecusa">
                Motivo da recusa <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="motivoRecusa"
                className={`w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${
                  erroRecusa ? "border-red-400" : "border-gray-200"
                }`}
                rows={5}
                maxLength={1000}
                placeholder="Descreva detalhadamente o motivo pelo qual este imóvel não pode ser validado no momento. Ex: documentação dominial incompleta, divergência nas coordenadas informadas, ocupação não formalizada..."
                value={motivoRecusa}
                onChange={(e) => {
                  setMotivoRecusa(e.target.value);
                  if (erroRecusa) setErroRecusa(null);
                }}
              />
              <div className="flex items-center justify-between">
                {erroRecusa
                  ? <p className="text-xs text-red-500">{erroRecusa}</p>
                  : <p className="text-xs text-gray-400">Mínimo 10 caracteres.</p>
                }
                <p className="text-xs text-gray-400">{motivoRecusa.length}/1000</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setModalRecusa(false); setMotivoRecusa(""); setErroRecusa(null); }}
              disabled={salvandoRecusa}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarRecusa}
              disabled={salvandoRecusa || motivoRecusa.trim().length < 10}
            >
              {salvandoRecusa
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registrando...</>
                : <><XCircle className="mr-2 h-4 w-4" />Confirmar Recusa</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />Voltar
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#1351B4]">{imovel.codigoSigpim}</span>
              <Badge className={`text-xs ${st.cls}`} variant="secondary">{st.label}</Badge>
            </div>
            <p className="text-base font-semibold text-gray-900 mt-0.5">
              {imovel.nomeReferencia ?? "Sem nome"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"
            onClick={() => navigate(`/dashboard/mapa?imovel=${imovel.id}`)}>
            <Map className="mr-2 h-4 w-4" />Ver no Mapa
          </Button>
          <Button variant="outline" size="sm" onClick={handleGerarFicha} disabled={loadingPdf}
            title="Gerar Ficha Cadastral em PDF com QR Code">
            {loadingPdf
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando...</>
              : <><Download className="mr-2 h-4 w-4" />Ficha PDF + QR</>
            }
          </Button>

          {/* Notificar validador — para membros do órgão gestor em PRE_CADASTRO */}
          {perm.canUpdateImovel && !perm.canValidarImovel &&
           imovel.statusCadastro === "PRE_CADASTRO" && (() => {
            const temPendencias = pendenciasChecklist.length > 0;
            const bloqueado = temPendencias || loadingNotificar || notificadoOk;
            const tooltip = temPendencias
              ? `Ainda há pendências: ${pendenciasChecklist[0]}${pendenciasChecklist.length > 1 ? ` (+${pendenciasChecklist.length - 1})` : ""}`
              : "Notificar o validador que as pendências foram corrigidas";
            return (
              <Button
                size="sm"
                variant="outline"
                className={`border-amber-300 ${bloqueado && !notificadoOk ? "opacity-50 cursor-not-allowed text-gray-400" : "text-amber-700 hover:bg-amber-50"}`}
                onClick={handleNotificarValidador}
                disabled={bloqueado}
                title={tooltip}
              >
                {loadingNotificar
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Notificando...</>
                  : notificadoOk
                  ? <><CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />Validador notificado!</>
                  : <><Bell className="mr-2 h-4 w-4" />Notificar Validador</>
                }
              </Button>
            );
          })()}

          {/* P → V: botões de aprovação e recusa */}
          {perm.canValidarImovel && imovel.statusCadastro === "PRE_CADASTRO" && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleValidar}
                disabled={loadingValidacao}
                title="Aprovar validação — promove para Validado"
              >
                {loadingValidacao
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validando...</>
                  : <><CheckCircle2 className="mr-2 h-4 w-4" />Validar Imóvel</>
                }
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => { setPendencias([]); setErroValidacao(null); setModalRecusa(true); }}
                disabled={loadingValidacao}
                title="Recusar validação — registra motivo e notifica o órgão gestor"
              >
                <XCircle className="mr-2 h-4 w-4" />Recusar
              </Button>
            </>
          )}

          {/* V → G: Promover para Gestão Plena */}
          {perm.canPromoverGestaoPlena && imovel.statusCadastro === "VALIDADO" && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handlePromoverGestaoPlena}
              disabled={loadingValidacao}
              title="Promover este imóvel de Validado para Gestão Plena"
            >
              {loadingValidacao
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Promovendo...</>
                : <><CheckCircle2 className="mr-2 h-4 w-4" />Gestão Plena</>
              }
            </Button>
          )}

          {perm.canUpdateImovel && (
            <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={() => navigate(`/dashboard/imoveis/${imovel.id}/editar`)}>
              <Edit className="mr-2 h-4 w-4" />Editar
            </Button>
          )}
        </div>
      </div>

      {erroPdf && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erroPdf}</div>
          <button onClick={() => setErroPdf(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Erros e pendências de validação */}
      {erroNotificar && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erroNotificar}</div>
          <button onClick={() => setErroNotificar(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Checklist de validação — mostra o que falta para o responsável corrigir */}
      {pendenciasChecklist.length > 0 && imovel?.statusCadastro === "PRE_CADASTRO" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Pendências que impedem a notificação do validador:
          </p>
          <ul className="space-y-1">
            {pendenciasChecklist.map((p, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600 mt-3">
            Corrija todos os itens acima para poder notificar o Validador Documental.
          </p>
        </div>
      )}

      {erroValidacao && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erroValidacao}</div>
          <button onClick={() => setErroValidacao(null)} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {pendencias.length > 0 && (
        pendencias[0].startsWith("✓") ? (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <p>{pendencias[0].replace("✓ ", "")}</p>
            <button onClick={() => setPendencias([])} className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        ) : (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Pendências impedem a validação — corrija antes de prosseguir:
            </p>
            <ul className="space-y-1">
              {pendencias.map((p, i) => (
                <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-yellow-600 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {/* Abas */}
      <Tabs defaultValue="dados">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="dados">
            <Building2 className="mr-1.5 h-3.5 w-3.5" />Dados
          </TabsTrigger>
          <TabsTrigger value="ocupacao">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Ocupação
            {ocupacoes.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs">{ocupacoes.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Documentos
            {documentos.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs">{documentos.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="vistorias">
            <ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />Vistorias
          </TabsTrigger>
          <TabsTrigger value="intervencoes">
            <Wrench className="mr-1.5 h-3.5 w-3.5" />Intervenções
          </TabsTrigger>
          <TabsTrigger value="fiscal">
            <DollarSign className="mr-1.5 h-3.5 w-3.5" />Fiscal
          </TabsTrigger>
          <TabsTrigger value="avaliacao">
            <BarChart2 className="mr-1.5 h-3.5 w-3.5" />Avaliação
          </TabsTrigger>
          <TabsTrigger value="instrumentos">
            <FileCheck className="mr-1.5 h-3.5 w-3.5" />Instrumentos
          </TabsTrigger>
          <TabsTrigger value="contratos">
            <FileText className="mr-1.5 h-3.5 w-3.5" />Contratos
          </TabsTrigger>
          <TabsTrigger value="validacao">
            <Shield className="mr-1.5 h-3.5 w-3.5" />Validação
          </TabsTrigger>
        </TabsList>

        {/* ── ABA DADOS ─────────────────────────────────────────────── */}
        <TabsContent value="dados" className="space-y-5 mt-5">

          {/* ── 1. Identificação e Governança ─────────────────────── */}
          <Secao icone={<Building2 className="h-4 w-4" />} titulo="Identificação e Governança">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Campo label="Código SIGPIM"         valor={imovel.codigoSigpim} />
              <Campo label="Status de cadastro"    valor={STATUS_CFG[imovel.statusCadastro]?.label ?? imovel.statusCadastro} />
              <Campo label="Tipo de imóvel"        valor={imovel.nomeTipoImovel} />
              <Campo label="Situação dominial"     valor={imovel.nomeSituacaoDominial} />
              <Campo label="Origem do cadastro"    valor={imovel.origemCadastro} />
              <Campo label="Inscrição imobiliária" valor={imovel.inscricaoImobiliaria} />
              <Campo label="Matrícula"             valor={imovel.matriculaRegistro} />
              <Campo label="Cartório"              valor={imovel.cartorio} />
              <Campo label="Versão do registro"    valor={imovel.versao} />
              <Campo label="Cadastrado em"         valor={imovel.criadoEm ? new Date(imovel.criadoEm).toLocaleDateString("pt-BR") : null} />
              <Campo label="Atualizado em"         valor={imovel.atualizadoEm ? new Date(imovel.atualizadoEm).toLocaleDateString("pt-BR") : null} />
            </div>
            {/* Patrimônio histórico — item 3: dois flags independentes */}
            {(imovel.tombadoHistorico || imovel.tombadoCultural) && (
              <div className="mt-4 border-t border-gray-100 pt-4 flex flex-wrap gap-2">
                <p className="text-xs text-gray-500 w-full mb-1">Proteção patrimonial:</p>
                {imovel.tombadoHistorico && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    🏛 Tombamento Histórico / Patrimonial
                  </span>
                )}
                {imovel.tombadoCultural && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                    🎨 Proteção Cultural
                  </span>
                )}
              </div>
            )}
            {imovel.descricao && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-1">Descrição</p>
                <p className="text-sm text-gray-700">{imovel.descricao}</p>
              </div>
            )}
            {imovel.observacoesGerais && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Observações gerais</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{imovel.observacoesGerais}</p>
              </div>
            )}
          </Secao>

          {/* ── 2. Gestão e Responsabilidade ──────────────────────── */}
          <Secao icone={<Users className="h-4 w-4" />} titulo="Gestão e Responsabilidade">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Campo label="Órgão gestor patrimonial (ID)" valor={imovel.idOrgaoGestorPatrimonial} />
              <Campo label="Órgão gestor operacional (ID)" valor={imovel.idOrgaoGestorOperacional} />
              <Campo label="Unidade gestora (ID)"          valor={imovel.idUnidadeGestora} />
              <Campo label="Registro de energia"           valor={imovel.registroEnergia} />
              <Campo label="Registro de água"              valor={imovel.registroAgua} />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Situação</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${imovel.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {imovel.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
            {imovel.motivoEncerramento && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-1">Motivo de encerramento</p>
                <p className="text-sm text-gray-700">{fmt(imovel.motivoEncerramento as string)}</p>
                {imovel.encerradoEm && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Encerrado em {new Date(imovel.encerradoEm).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            )}
          </Secao>

          {/* ── 3. Localização e GIS ──────────────────────────────── */}
          <Secao icone={<MapPin className="h-4 w-4" />} titulo="Localização e GIS">
            {localizacao ? (
              <div className="space-y-5">
                {/* Endereço */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Endereço</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <Campo label="Logradouro"        valor={localizacao.logradouro} />
                    <Campo label="Número"            valor={localizacao.numero} />
                    <Campo label="Complemento"       valor={localizacao.complemento} />
                    <Campo label="Bairro"            valor={localizacao.bairro} />
                    <Campo label="Distrito/Regional" valor={localizacao.distritoRegional} />
                    <Campo label="CEP"               valor={localizacao.cep} />
                  </div>
                </div>
                {/* Geodados */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Georeferenciamento</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <Campo label="Latitude"           valor={localizacao.latitude?.toString()} />
                    <Campo label="Longitude"          valor={localizacao.longitude?.toString()} />
                    <Campo label="Sistema de coord."  valor={localizacao.sistemaCoordenadas} />
                    <Campo label="Tipo de geometria"  valor={localizacao.tipoGeometria} />
                    <Campo label="Fonte da geometria" valor={localizacao.fonteGeometria} />
                    <Campo label="Precisão"           valor={localizacao.precisaoLocalizacao} />
                    {localizacao.geometriaWkt && (
                      <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                        <p className="text-xs text-gray-500 mb-0.5">Geometria (WKT)</p>
                        <p className="text-xs font-mono text-gray-600 bg-gray-50 rounded p-2 break-all">{localizacao.geometriaWkt}</p>
                      </div>
                    )}
                  </div>
                  {localizacao.latitude && localizacao.longitude && (
                    <div className="mt-3">
                      <button
                        onClick={() => navigate(`/dashboard/mapa?imovel=${imovel.id}`)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#1351B4] hover:underline"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Ver no mapa ({localizacao.latitude}, {localizacao.longitude})
                      </button>
                    </div>
                  )}
                </div>
                {/* GIS / Validação */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Validação GIS</p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Selo GIS (SEMURH)</p>
                      {localizacao.seloGis ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          localizacao.seloGis === "VALIDADO" ? "bg-green-100 text-green-800" :
                          localizacao.seloGis === "CONFLITO" ? "bg-orange-100 text-orange-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {localizacao.seloGis === "VALIDADO" ? "✓ Validado" :
                           localizacao.seloGis === "CONFLITO" ? "⚠ Conflito" : "○ Não validado"}
                        </span>
                      ) : <p className="text-sm font-medium text-gray-400">—</p>}
                    </div>
                    <Campo label="Data validação GIS" valor={localizacao.dataValidacaoGis?.toString()} />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Revisão INCID</p>
                      {localizacao.revisaoIncid ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          localizacao.revisaoIncid === "OK" ? "bg-green-100 text-green-800" :
                          localizacao.revisaoIncid === "RESSALVA" ? "bg-orange-100 text-orange-800" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {localizacao.revisaoIncid}
                        </span>
                      ) : <p className="text-sm font-medium text-gray-400">—</p>}
                    </div>
                  </div>
                  {localizacao.observacaoGis && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Observação GIS</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{localizacao.observacaoGis}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800">
                  Localização não registrada. Edite o imóvel para adicionar endereço e coordenadas.
                </p>
              </div>
            )}
          </Secao>

          {/* ── 4. Dados Físicos e Construtivos ───────────────────── */}
          <Secao icone={<Building2 className="h-4 w-4" />} titulo="Dados Físicos e Construtivos">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Campo label="Área do terreno (m²)"  valor={imovel.areaTerrenoM2} />
              <Campo label="Área construída (m²)"  valor={imovel.areaConstruidaM2} />
              <Campo label="Nº de pavimentos"      valor={imovel.numeroPavimentos} />
              <Campo label="Ano de construção"     valor={imovel.anoConstrucao} />
              <Campo label="Categoria macro"       valor={imovel.categoriaMacro} />
              <Campo label="Tipologia"             valor={imovel.tipologia} />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Estado de conservação</p>
                {imovel.estadoConservacaoAtual ? (
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    imovel.estadoConservacaoAtual === "OTIMO"   ? "bg-green-100 text-green-800"  :
                    imovel.estadoConservacaoAtual === "BOM"     ? "bg-emerald-100 text-emerald-800" :
                    imovel.estadoConservacaoAtual === "REGULAR" ? "bg-yellow-100 text-yellow-800" :
                    imovel.estadoConservacaoAtual === "RUIM"    ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {fmt(imovel.estadoConservacaoAtual)}
                  </span>
                ) : <p className="text-sm font-medium text-gray-400">—</p>}
              </div>
            </div>
            {/* Campos dominiais adicionais — V30 */}
            {(imovel.proprietarioRegistral || imovel.areaRegistradaM2 || imovel.onusRestricoes) && (
              <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <Campo label="Proprietário registral" valor={(imovel as any).proprietarioRegistral} />
                <Campo label="Área registrada (m²)"   valor={(imovel as any).areaRegistradaM2} />
                {(imovel as any).onusRestricoes && (
                  <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                    <p className="text-xs text-gray-500 mb-0.5">Ônus / Restrições registrárias</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{(imovel as any).onusRestricoes}</p>
                  </div>
                )}
              </div>
            )}
          </Secao>

        </TabsContent>

        {/* ── ABA OCUPAÇÃO ──────────────────────────────────────────── */}
        <TabsContent value="ocupacao" className="mt-5">
          {ocupacoes.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="font-medium">Nenhuma ocupação registrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ocupacoes.map((oc) => (
                <div key={oc.id}
                  className={`rounded-lg border p-4 ${oc.vigente ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary"
                      className={`text-xs ${oc.vigente ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                      {oc.vigente ? "Vigente" : "Encerrada"}
                    </Badge>
                    <span className="text-xs text-gray-500">{fmt(oc.statusOcupacao)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Campo label="Ocupante externo"   valor={oc.nomeOcupanteExterno} />
                    <Campo label="Responsável local"  valor={oc.nomeResponsavelLocal} />
                    <Campo label="Contato"            valor={oc.contatoResponsavel} />
                    <Campo label="Finalidade"         valor={oc.destinacaoFinalidade} />
                    <Campo label="Início"             valor={oc.dataInicio} />
                    <Campo label="Fim previsto"       valor={oc.dataFimPrevista} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── ABA DOCUMENTOS ────────────────────────────────────────── */}
        <TabsContent value="documentos" className="mt-5">
          {documentos.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
              <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="font-medium">Nenhum documento anexado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documentos.map((doc) => (
                <div key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
                  <div>
                    <span className="text-xs font-medium text-gray-700">{doc.tipoDocumento}</span>
                    <span className="mx-2 text-gray-300">·</span>
                    <span className="text-xs text-gray-500">{doc.descricao}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{doc.statusValidacao}</Badge>
                </div>
              ))}
              <Link to="/dashboard/documentos"
                className="block text-center text-xs text-[#1351B4] hover:underline mt-2">
                Ver todos os documentos
              </Link>
            </div>
          )}
        </TabsContent>

        {/* ── ABA VISTORIAS ─────────────────────────────────────────── */}
        <TabsContent value="vistorias" className="mt-5">
          <AbaVistorias idImovel={Number(id)} />
        </TabsContent>

        {/* ── ABA INTERVENÇÕES ──────────────────────────────────────── */}
        <TabsContent value="intervencoes" className="mt-5">
          <AbaIntervencoes idImovel={Number(id)} />
        </TabsContent>

        {/* ── ABA FISCAL ────────────────────────────────────────────── */}
        <TabsContent value="fiscal" className="mt-5">
          <AbaFiscal idImovel={Number(id)} />
        </TabsContent>

        {/* ── ABA AVALIAÇÃO PATRIMONIAL ──────────────────────────────── */}
        <TabsContent value="avaliacao" className="mt-5">
          <AbaAvaliacaoPatrimonial idImovel={Number(id)} />
        </TabsContent>

        {/* ── ABA INSTRUMENTOS DE USO ────────────────────────────────── */}
        <TabsContent value="instrumentos" className="mt-5">
          <AbaInstrumentosUso idImovel={Number(id)} />
        </TabsContent>

        {/* ── ABA CONTRATOS DE LOCAÇÃO ────────────────────────────────── */}
        <TabsContent value="contratos" className="mt-5">
          <AbaContratosLocacao idImovel={Number(id)} />
        </TabsContent>

        {/* ── ABA VALIDAÇÃO ──────────────────────────────────────────── */}
        {/* Mostra status de validação por domínio/aba (itens 5,6,7,8,9 do feedback) */}
        <TabsContent value="validacao" className="mt-5">
          <PainelValidacaoAbas
            idImovel={Number(id)}
            onMudanca={() => {
              // Recarrega o imóvel quando uma aba é validada/revogada
              // para refletir possível mudança de status
              imoveisApi.buscarPorId(Number(id))
                .then(setImovel)
                .catch(() => {});
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}