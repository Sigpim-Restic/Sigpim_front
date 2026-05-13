import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, Clock, Shield, ShieldOff, Loader2,
  ChevronDown, ChevronUp, Info, XCircle, AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  validacoesAbaApi,
  type StatusValidacaoResponse,
  type DominioValidado,
  DOMINIO_LABEL,
  DOMINIO_ORGAO,
} from "../../api/validacoesAba";
import { usePermissoes } from "../../hooks/usePermissoes";
import { type ImovelResponse } from "../../api/imoveis";

interface Props {
  idImovel: number;
  imovel: ImovelResponse | null;
  onMudanca?: () => void;
}

// ── Campos a mostrar por domínio no preview inline ────────────────────────────

type CampoPreview = { label: string; valor: string | null | undefined };

function getCamposDominio(dominio: string, imovel: ImovelResponse | null): CampoPreview[] {
  if (!imovel) return [];
  const fmt = (v: unknown) => v != null ? String(v) : null;
  const fmtBool = (v: boolean | null | undefined) =>
    v == null ? null : v ? "Sim" : "Não";

  switch (dominio) {
    case "CORE":
      return [
        { label: "Nome de referência",  valor: imovel.nomeReferencia },
        { label: "Tipo de imóvel",      valor: imovel.nomeTipoImovel },
        { label: "Descrição",           valor: imovel.descricao },
        { label: "Observações gerais",  valor: imovel.observacoesGerais },
      ];
    case "GIS":
      return [
        { label: "Latitude",            valor: fmt(imovel.latitude) },
        { label: "Longitude",           valor: fmt(imovel.longitude) },
        { label: "Inscrição imobiliária", valor: imovel.inscricaoImobiliaria },
      ];
    case "CLASSIFICACAO":
      return [
        { label: "Categoria macro",     valor: imovel.categoriaMacro },
        { label: "Tipologia",           valor: imovel.tipologia },
        { label: "Situação dominial",   valor: imovel.nomeSituacaoDominial },
      ];
    case "DADOS_FISICOS":
      return [
        { label: "Área terreno (m²)",   valor: fmt(imovel.areaTerrenoM2) },
        { label: "Área construída (m²)",valor: fmt(imovel.areaConstruidaM2) },
        { label: "Nº pavimentos",       valor: fmt(imovel.numeroPavimentos) },
        { label: "Ano construção",      valor: fmt(imovel.anoConstrucao) },
        { label: "Estado conservação",  valor: imovel.estadoConservacaoAtual },
      ];
    case "DOMINIAL":
      return [
        { label: "Matrícula registro",  valor: imovel.matriculaRegistro },
        { label: "Cartório",            valor: imovel.cartorio },
        { label: "Situação dominial",   valor: imovel.nomeSituacaoDominial },
        { label: "Origem do cadastro",  valor: imovel.nomeOrigemCadastro },
      ];
    case "FISCAL":
      return [
        { label: "Inscrição imobiliária", valor: imovel.inscricaoImobiliaria },
        { label: "Registro energia",    valor: imovel.registroEnergia },
        { label: "Registro água",       valor: imovel.registroAgua },
      ];
    case "HISTORICO":
      return [
        { label: "Tombado historicamente", valor: fmtBool(imovel.tombadoHistorico) },
        { label: "Proteção cultural",      valor: fmtBool(imovel.tombadoCultural) },
      ];
    default:
      return [
        { label: "Nome de referência",  valor: imovel.nomeReferencia },
        { label: "Código SIGPIM",       valor: imovel.codigoSigpim },
      ];
  }
}

// ── Componente principal ──────────────────────────────────────────────────────

export function PainelValidacaoAbas({ idImovel, imovel, onMudanca }: Props) {
  const perm = usePermissoes();

  const [status,    setStatus]    = useState<StatusValidacaoResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState<string | null>(null);
  const [expandido, setExpandido] = useState(true);

  // Modal de revogação
  const [modalRevogar, setModalRevogar] = useState<{
    aberto: boolean; dominio: string; salvando: boolean;
  }>({ aberto: false, dominio: "", salvando: false });

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const data = await validacoesAbaApi.buscarStatus(idImovel);
      setStatus(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar validações.");
    } finally {
      setLoading(false);
    }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const confirmarRevogar = async () => {
    setModalRevogar((m) => ({ ...m, salvando: true }));
    try {
      await validacoesAbaApi.revogar(idImovel, modalRevogar.dominio);
      setModalRevogar((m) => ({ ...m, aberto: false }));
      await carregar();
      onMudanca?.();
    } catch { /* silencia */ } finally {
      setModalRevogar((m) => ({ ...m, salvando: false }));
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-8 justify-center text-gray-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Carregando validações...</span>
    </div>
  );

  if (erro) return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>
  );

  if (!status) return null;

  const totalDominios = status.dominiosValidados.length + status.dominiosPendentes.length;
  const percentual    = Math.round((status.dominiosValidados.length / totalDominios) * 100);
  const recusasAtivas = status.recusasAtivas ?? {};

  return (
    <div className="space-y-4">

      {/* Modal de revogação */}
      <Dialog open={modalRevogar.aberto} onOpenChange={(v) => !v && setModalRevogar((m) => ({ ...m, aberto: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <ShieldOff className="h-5 w-5" />Revogar validação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              Deseja revogar a validação do domínio{" "}
              <strong>{DOMINIO_LABEL[modalRevogar.dominio] ?? modalRevogar.dominio}</strong>?
            </p>
            <p className="text-xs text-orange-700 rounded-lg bg-orange-50 border border-orange-200 p-3">
              Os campos deste domínio voltarão a ser editáveis. A revogação é registrada em auditoria.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRevogar((m) => ({ ...m, aberto: false }))}
              disabled={modalRevogar.salvando}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmarRevogar} disabled={modalRevogar.salvando}>
              {modalRevogar.salvando
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Revogando...</>
                : "Revogar Validação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho com progresso */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpandido((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[#1351B4]" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Validação por Domínio</p>
            <p className="text-xs text-gray-500">
              {status.dominiosValidados.length} de {totalDominios} domínios validados ({percentual}%)
              {Object.keys(recusasAtivas).length > 0 && (
                <span className="ml-2 text-red-600 font-medium">
                  · {Object.keys(recusasAtivas).length} recusa(s) pendente(s)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${percentual}%` }} />
            </div>
            <span className="text-xs font-medium text-gray-600">{percentual}%</span>
          </div>
          {expandido ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {expandido && (
        <div className="space-y-2">

          {perm.isAdminSistema && (
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Administradores do Sistema têm acesso de leitura mas não podem validar domínios.
            </div>
          )}

          {/* Domínios validados */}
          {status.dominiosValidados.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                Validados ({status.dominiosValidados.length})
              </p>
              {status.dominiosValidados.map((v) => (
                <DominioCard
                  key={v.dominio}
                  dominio={v.dominio}
                  estado="validado"
                  infoValidado={v}
                  imovel={imovel}
                  podeRevogar={perm.isAdminPatrimonial}
                  onRevogar={() => setModalRevogar({ aberto: true, dominio: v.dominio, salvando: false })}
                  idImovel={idImovel}
                  onMudanca={async () => { await carregar(); onMudanca?.(); }}
                />
              ))}
            </div>
          )}

          {/* Domínios pendentes */}
          {status.dominiosPendentes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mt-3">
                Pendentes ({status.dominiosPendentes.length})
              </p>
              {status.dominiosPendentes.map((dominio) => {
                const podeValidar = perm.canValidarDominio(dominio);
                const motivoRecusa = recusasAtivas[dominio];
                return (
                  <DominioCard
                    key={dominio}
                    dominio={dominio}
                    estado={motivoRecusa ? "recusado" : "pendente"}
                    motivoRecusa={motivoRecusa}
                    imovel={imovel}
                    podeValidar={podeValidar}
                    idImovel={idImovel}
                    onMudanca={async () => { await carregar(); onMudanca?.(); }}
                  />
                );
              })}
            </div>
          )}

          {status.dominiosValidados.length === totalDominios && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-medium">Todos os domínios foram validados.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Card individual de domínio ────────────────────────────────────────────────

type EstadoDominio = "validado" | "pendente" | "recusado";

function DominioCard({
  dominio, estado, infoValidado, motivoRecusa, imovel,
  podeValidar, podeRevogar, onValidar: _onValidar, onRevogar, idImovel, onMudanca,
}: {
  dominio: string;
  estado: EstadoDominio;
  infoValidado?: DominioValidado;
  motivoRecusa?: string;
  imovel: ImovelResponse | null;
  podeValidar?: boolean;
  podeRevogar?: boolean;
  onValidar?: () => void;
  onRevogar?: () => void;
  idImovel: number;
  onMudanca: () => Promise<void>;
}) {
  const [expandido,    setExpandido]    = useState(false);
  const [modoAcao,     setModoAcao]     = useState<"nenhum" | "validar" | "recusar">("nenhum");
  const [observacao,   setObservacao]   = useState("");
  const [motivo,       setMotivo]       = useState("");
  const [salvando,     setSalvando]     = useState(false);
  const [erro,         setErro]         = useState<string | null>(null);

  const campos = getCamposDominio(dominio, imovel);
  const camposPreenchidos = campos.filter(c => c.valor);

  const handleValidar = async () => {
    setSalvando(true); setErro(null);
    try {
      await validacoesAbaApi.validar(idImovel, { dominio, observacao: observacao || undefined });
      setModoAcao("nenhum");
      setObservacao("");
      await onMudanca();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao validar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleRecusar = async () => {
    if (motivo.trim().length < 10) { setErro("O motivo deve ter pelo menos 10 caracteres."); return; }
    setSalvando(true); setErro(null);
    try {
      await validacoesAbaApi.recusar(idImovel, { dominio, motivo });
      setModoAcao("nenhum");
      setMotivo("");
      await onMudanca();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao recusar.");
    } finally {
      setSalvando(false);
    }
  };

  const cancelarAcao = () => {
    setModoAcao("nenhum");
    setObservacao(""); setMotivo(""); setErro(null);
  };

  // ── Cores do card por estado
  const corCard =
    estado === "validado" ? "border-green-200 bg-green-50" :
    estado === "recusado" ? "border-red-200 bg-red-50" :
    "border-gray-200 bg-white";

  const icone =
    estado === "validado" ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> :
    estado === "recusado" ? <XCircle      className="h-4 w-4 text-red-500 shrink-0" /> :
                            <Clock        className="h-4 w-4 text-gray-400 shrink-0" />;

  const corTitulo =
    estado === "validado" ? "text-green-900" :
    estado === "recusado" ? "text-red-900" :
    "text-gray-800";

  return (
    <div className={`rounded-lg border ${corCard} transition-all`}>

      {/* ── Linha principal ── */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpandido((v) => !v)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icone}
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${corTitulo}`}>
              {DOMINIO_LABEL[dominio] ?? dominio}
            </p>
            <p className="text-xs text-gray-500 truncate">{DOMINIO_ORGAO[dominio] ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {estado === "recusado" && (
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-red-200">
              <AlertTriangle className="mr-1 h-3 w-3" />Recusado
            </Badge>
          )}
          {estado === "pendente" && !podeValidar && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
              Aguardando validador
            </Badge>
          )}
          {estado === "validado" && podeRevogar && (
            <Button variant="ghost" size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
              onClick={onRevogar}>
              <ShieldOff className="mr-1 h-3 w-3" />Revogar
            </Button>
          )}
          {(estado === "pendente" || estado === "recusado") && podeValidar && (
            <div className="flex gap-1">
              <Button size="sm"
                className="bg-[#1351B4] hover:bg-[#0c3b8d] h-7 text-xs px-2.5"
                onClick={() => { setExpandido(true); setModoAcao("validar"); }}>
                <CheckCircle2 className="mr-1 h-3 w-3" />Validar
              </Button>
              <Button size="sm" variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 h-7 text-xs px-2.5"
                onClick={() => { setExpandido(true); setModoAcao("recusar"); }}>
                <XCircle className="mr-1 h-3 w-3" />Recusar
              </Button>
            </div>
          )}
          <ChevronRight className={`h-4 w-4 text-gray-300 transition-transform ${expandido ? "rotate-90" : ""}`} />
        </div>
      </div>

      {/* ── Conteúdo expandido ── */}
      {expandido && (
        <div className={`border-t px-4 pb-4 pt-3 space-y-3 ${
          estado === "validado" ? "border-green-200" :
          estado === "recusado" ? "border-red-200" : "border-gray-100"
        }`}>

          {/* Aviso de recusa ativa */}
          {estado === "recusado" && motivoRecusa && (
            <div className="rounded-md bg-red-100 border border-red-200 px-3 py-2 text-xs text-red-800">
              <p className="font-semibold mb-0.5">Motivo da recusa:</p>
              <p>{motivoRecusa}</p>
            </div>
          )}

          {/* Preview dos dados do domínio */}
          {camposPreenchidos.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {camposPreenchidos.map((c) => (
                <div key={c.label} className="min-w-0">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide truncate">{c.label}</p>
                  <p className="text-xs text-gray-800 font-medium truncate">{c.valor}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Nenhum campo preenchido para este domínio.
            </p>
          )}

          {/* Detalhes de validação já aprovada */}
          {estado === "validado" && infoValidado && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-800 pt-1 border-t border-green-200">
              <div><span className="text-green-600">Validado por:</span> {infoValidado.nomeValidador}</div>
              <div><span className="text-green-600">Órgão:</span> {infoValidado.nomeOrgao}</div>
              <div><span className="text-green-600">Em:</span>{" "}
                {new Date(infoValidado.validadoEm).toLocaleDateString("pt-BR", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
              {infoValidado.observacao && (
                <div className="col-span-2"><span className="text-green-600">Obs:</span> {infoValidado.observacao}</div>
              )}
            </div>
          )}

          {/* ── Formulário de ação (validar ou recusar) ── */}
          {modoAcao !== "nenhum" && (
            <div className={`rounded-lg border p-3 space-y-2.5 ${
              modoAcao === "validar"
                ? "bg-blue-50 border-blue-200"
                : "bg-red-50 border-red-200"
            }`}>
              <p className="text-xs font-semibold text-gray-700">
                {modoAcao === "validar"
                  ? "Confirmar validação deste domínio"
                  : "Informe o motivo da recusa"}
              </p>

              {modoAcao === "validar" ? (
                <>
                  <div className="rounded-md bg-orange-50 border border-orange-200 p-2 text-xs text-orange-800">
                    ⚠ Esta ação é irreversível. Após validar, os campos ficam <strong>imutáveis</strong>.
                  </div>
                  <Textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Observação (opcional)…"
                    rows={2}
                    className="text-xs"
                  />
                </>
              ) : (
                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o que precisa ser corrigido (mín. 10 caracteres)…"
                  rows={3}
                  className={`text-xs ${motivo && motivo.length < 10 ? "border-red-400" : ""}`}
                  autoFocus
                />
              )}

              {erro && <p className="text-xs text-red-600">{erro}</p>}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={cancelarAcao}
                  disabled={salvando} className="h-7 text-xs">
                  Cancelar
                </Button>
                {modoAcao === "validar" ? (
                  <Button size="sm"
                    className="bg-[#1351B4] hover:bg-[#0c3b8d] h-7 text-xs"
                    onClick={handleValidar} disabled={salvando}>
                    {salvando
                      ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Validando…</>
                      : <><CheckCircle2 className="mr-1 h-3 w-3" />Confirmar Validação</>}
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive"
                    className="h-7 text-xs"
                    onClick={handleRecusar}
                    disabled={salvando || motivo.trim().length < 10}>
                    {salvando
                      ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Recusando…</>
                      : <><XCircle className="mr-1 h-3 w-3" />Confirmar Recusa</>}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}