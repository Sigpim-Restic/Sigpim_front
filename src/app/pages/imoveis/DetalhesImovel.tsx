import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, RefreshCw, AlertCircle, MapPin, FileText,
  Building2, Users, Edit, Map, Download, Loader2,
  ClipboardCheck, Wrench, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, AlertTriangle, RotateCcw, DollarSign, Pencil, Trash2, BarChart2, FileCheck,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { imoveisApi, type ImovelResponse } from "../../api/imoveis";
import { documentosApi, type DocumentoResponse } from "../../api/documentos";
import { ocupacoesApi, type OcupacaoResponse } from "../../api/ocupacoes";
import {
  vistoriasApi, type VistoriaResponse, type VistoriaRequest,
} from "../../api/vistorias";
import {
  intervencoesApi,
  type IntervencaoResponse, type IntervencaoRequest,
  type StatusIntervencao, type ParecerFumphResponse, type ParecerFumphRequest,
} from "../../api/intervencoes";
import { relatoriosApi } from "../../api/relatorios";
import { dadosFiscaisApi, type DadoFiscalResponse, type DadoFiscalRequest } from "../../api/dadosFiscais";
import {
  avaliacoesPatrimoniaisApi,
  type AvaliacaoPatrimonialResponse,
  type AvaliacaoPatrimonialRequest,
  METODOLOGIAS,
} from "../../api/avaliacoesPatrimoniais";
import { usePermissoes } from "../../hooks/usePermissoes";
import {
  instrumentosUsoApi,
  type InstrumentoUsoResponse,
  type InstrumentoUsoRequest,
  TIPOS_INSTRUMENTO,
  STATUS_INSTRUMENTO,
} from "../../api/instrumentosUso";

// ─── helpers visuais ──────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  VALIDADO:     { label: "Validado",      cls: "bg-green-100 text-green-800" },
  PRE_CADASTRO: { label: "Pré-cadastro",  cls: "bg-yellow-100 text-yellow-800" },
  GESTAO_PLENA: { label: "Gestão Plena",  cls: "bg-blue-100 text-blue-800" },
};

const CRITICIDADE_CFG: Record<string, { cls: string; label: string }> = {
  BAIXO:   { cls: "bg-green-100 text-green-800",   label: "Baixo" },
  MEDIO:   { cls: "bg-yellow-100 text-yellow-800", label: "Médio" },
  ALTO:    { cls: "bg-orange-100 text-orange-800", label: "Alto" },
  CRITICO: { cls: "bg-red-100 text-red-800",       label: "Crítico" },
};

const STATUS_INTERV_CFG: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
  PLANEJADA:               { cls: "bg-gray-100 text-gray-700",    label: "Planejada",           icon: <Clock className="h-3 w-3" /> },
  AGUARDANDO_PARECER:      { cls: "bg-yellow-100 text-yellow-800",label: "Ag. Parecer FUMPH",   icon: <AlertTriangle className="h-3 w-3" /> },
  EM_CONTRATACAO:          { cls: "bg-purple-100 text-purple-800",label: "Em Contratação",      icon: <Clock className="h-3 w-3" /> },
  EM_EXECUCAO:             { cls: "bg-blue-100 text-blue-800",    label: "Em Execução",         icon: <Wrench className="h-3 w-3" /> },
  SUSPENSA:                { cls: "bg-orange-100 text-orange-800",label: "Suspensa",            icon: <AlertCircle className="h-3 w-3" /> },
  CONCLUIDA:               { cls: "bg-green-100 text-green-800",  label: "Concluída",           icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELADA:               { cls: "bg-red-100 text-red-800",      label: "Cancelada",           icon: <XCircle className="h-3 w-3" /> },
};

function fmt(s?: string | null) {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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

// ─── Sub-componente: Aba Vistorias ────────────────────────────────────────────

function AbaVistorias({ idImovel }: { idImovel: number }) {
  const perm = usePermissoes();
  const [vistorias,   setVistorias]   = useState<VistoriaResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [expandido,   setExpandido]   = useState<number | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando,    setSalvando]    = useState(false);
  const [formErro,    setFormErro]    = useState<string | null>(null);

  const [form, setForm] = useState<Partial<VistoriaRequest>>({
    vistoriaInicial: false,
    criticidadeRisco: "BAIXO",
    estadoConservacao: "BOM",
  });

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const res = await vistoriasApi.listar(idImovel);
      setVistorias(res.content);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar vistorias.");
    } finally { setLoading(false); }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleSalvar = async () => {
    setFormErro(null);
    if (!form.dataVistoria) { setFormErro("Data da vistoria é obrigatória."); return; }
    if (!form.estadoConservacao) { setFormErro("Estado de conservação é obrigatório."); return; }
    setSalvando(true);
    try {
      await vistoriasApi.criar(idImovel, form as VistoriaRequest);
      setModalAberto(false);
      setForm({ vistoriaInicial: false, criticidadeRisco: "BAIXO", estadoConservacao: "BOM" });
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar vistoria.");
    } finally { setSalvando(false); }
  };

  return (
    <div className="space-y-4">
      {/* Modal nova vistoria */}
      <Dialog open={modalAberto} onOpenChange={(v) => { if (!v) { setModalAberto(false); setFormErro(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nova Vistoria</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {formErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{formErro}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data da vistoria <span className="text-red-500">*</span></Label>
                <Input type="date" value={form.dataVistoria ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataVistoria: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nº do processo</Label>
                <Input placeholder="Ex: 001234/2026" value={form.numeroProcesso ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, numeroProcesso: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estado de conservação <span className="text-red-500">*</span></Label>
                <Select value={form.estadoConservacao ?? "BOM"}
                  onValueChange={(v) => setForm((f) => ({ ...f, estadoConservacao: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["OTIMO","BOM","REGULAR","RUIM","PESSIMO"].map((e) => (
                      <SelectItem key={e} value={e}>{fmt(e)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Criticidade / Risco <span className="text-red-500">*</span></Label>
                <Select value={form.criticidadeRisco ?? "BAIXO"}
                  onValueChange={(v) => setForm((f) => ({ ...f, criticidadeRisco: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["BAIXO","MEDIO","ALTO","CRITICO"].map((c) => (
                      <SelectItem key={c} value={c}>{fmt(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Equipe / Responsável</Label>
              <Input placeholder="Nome da equipe ou técnico responsável" value={form.equipeDescricao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, equipeDescricao: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Parecer técnico</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={3} placeholder="Descreva o parecer da vistoria..."
                value={form.parecer ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, parecer: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Recomendações</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={2} placeholder="Recomendações para manutenção ou intervenção..."
                value={form.recomendacoes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, recomendacoes: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="vistoriaInicial" className="h-4 w-4 accent-[#1351B4]"
                checked={form.vistoriaInicial ?? false}
                onChange={(e) => setForm((f) => ({ ...f, vistoriaInicial: e.target.checked }))} />
              <label htmlFor="vistoriaInicial" className="text-sm text-gray-700">
                Esta é a vistoria inicial do imóvel (eleva status para Gestão Plena)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Registrar Vistoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topo */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Histórico de vistorias técnicas do imóvel</p>
        {perm.canWriteVistoria && (
          <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={() => setModalAberto(true)}>
            <Plus className="mr-2 h-3.5 w-3.5" />Nova Vistoria
          </Button>
        )}
      </div>

      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erro}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : vistorias.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          <ClipboardCheck className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhuma vistoria registrada.</p>
          {perm.canWriteVistoria && (
            <button onClick={() => setModalAberto(true)}
              className="mt-2 text-[#1351B4] text-xs hover:underline">
              Registrar primeira vistoria
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {vistorias.map((v) => {
            const crit = CRITICIDADE_CFG[v.criticidadeRisco] ?? CRITICIDADE_CFG.BAIXO;
            const aberto = expandido === v.id;
            return (
              <div key={v.id} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Header da vistoria */}
                <button
                  onClick={() => setExpandido(aberto ? null : v.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {new Date(v.dataVistoria + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                        {v.vistoriaInicial && (
                          <Badge className="text-xs bg-blue-100 text-blue-800" variant="secondary">
                            Inicial
                          </Badge>
                        )}
                        <Badge className={`text-xs ${crit.cls}`} variant="secondary">
                          {crit.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {v.estadoConservacao ? fmt(v.estadoConservacao) : "—"}
                        {v.equipeDescricao ? ` · ${v.equipeDescricao}` : ""}
                        {v.numeroProcesso ? ` · Proc. ${v.numeroProcesso}` : ""}
                      </p>
                    </div>
                  </div>
                  {aberto ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                </button>

                {/* Detalhes expandidos */}
                {aberto && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {v.parecer && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Parecer técnico</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{v.parecer}</p>
                      </div>
                    )}
                    {v.recomendacoes && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Recomendações</p>
                        <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3 border border-amber-100">{v.recomendacoes}</p>
                      </div>
                    )}
                    {v.itensChecklist && v.itensChecklist.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Checklist ({v.itensChecklist.length} itens)</p>
                        <div className="space-y-1.5">
                          {v.itensChecklist.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 text-xs">
                              <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                                item.situacao === "CONFORME" ? "bg-green-500" :
                                item.situacao === "NAO_CONFORME" ? "bg-red-500" :
                                "bg-gray-300"
                              }`} />
                              <span className="text-gray-500 font-medium">{item.categoria}:</span>
                              <span className="text-gray-700">{item.item}</span>
                              <span className={`ml-auto shrink-0 ${
                                item.situacao === "CONFORME" ? "text-green-600" :
                                item.situacao === "NAO_CONFORME" ? "text-red-600" :
                                "text-gray-400"
                              }`}>{fmt(item.situacao)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sub-componente: Aba Intervenções ─────────────────────────────────────────

function AbaIntervencoes({ idImovel }: { idImovel: number }) {
  const perm = usePermissoes();
  const [intervencoes, setIntervencoes] = useState<IntervencaoResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState<string | null>(null);
  const [expandido,    setExpandido]    = useState<number | null>(null);
  const [modalAberto,  setModalAberto]  = useState(false);
  const [salvando,     setSalvando]     = useState(false);
  const [formErro,     setFormErro]     = useState<string | null>(null);
  const [parecerMap,   setParecerMap]   = useState<Record<number, ParecerFumphResponse>>({});
  const [avancoLoading, setAvancoLoading] = useState<number | null>(null);

  const [form, setForm] = useState<Partial<IntervencaoRequest>>({
    tipoIntervencao: "MANUTENCAO_PREVENTIVA",
    nivelIntervencao: "N0",
  });

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const res = await intervencoesApi.listar(idImovel);
      setIntervencoes(res.content);
      // Carrega parecer FUMPH para intervenções que requerem
      for (const iv of res.content) {
        if (iv.requerParecerFumph) {
          intervencoesApi.buscarParecerFumph(idImovel, iv.id)
            .then((p) => setParecerMap((m) => ({ ...m, [iv.id]: p })))
            .catch(() => { /* silencia */ });
        }
      }
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar intervenções.");
    } finally { setLoading(false); }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleSalvar = async () => {
    setFormErro(null);
    if (!form.titulo?.trim()) { setFormErro("Título é obrigatório."); return; }
    setSalvando(true);
    try {
      await intervencoesApi.criar(idImovel, form as IntervencaoRequest);
      setModalAberto(false);
      setForm({ tipoIntervencao: "MANUTENCAO_PREVENTIVA", nivelIntervencao: "N0" });
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar intervenção.");
    } finally { setSalvando(false); }
  };

  const handleAvancar = async (iv: IntervencaoResponse, novoStatus: StatusIntervencao) => {
    setAvancoLoading(iv.id);
    try {
      await intervencoesApi.avancarStatus(idImovel, iv.id, novoStatus);
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao avançar status.");
    } finally { setAvancoLoading(null); }
  };

  const proximoStatus = (atual: StatusIntervencao): StatusIntervencao | null => {
    const fluxo: Partial<Record<StatusIntervencao, StatusIntervencao>> = {
      PLANEJADA:          "EM_EXECUCAO",
      AGUARDANDO_PARECER: "EM_EXECUCAO",
      EM_EXECUCAO:        "CONCLUIDA",
      SUSPENSA:           "EM_EXECUCAO",
    };
    return fluxo[atual] ?? null;
  };

  return (
    <div className="space-y-4">
      {/* Modal nova intervenção */}
      <Dialog open={modalAberto} onOpenChange={(v) => { if (!v) { setModalAberto(false); setFormErro(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Nova Intervenção</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {formErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{formErro}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Título <span className="text-red-500">*</span></Label>
              <Input placeholder="Ex: Reforma da cobertura, Manutenção elétrica..."
                value={form.titulo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo <span className="text-red-500">*</span></Label>
                <Select value={form.tipoIntervencao ?? "MANUTENCAO_PREVENTIVA"}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipoIntervencao: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["MANUTENCAO_PREVENTIVA","MANUTENCAO_CORRETIVA","REFORMA","OBRA_NOVA","EMERGENCIAL","DEMOLICAO"].map((t) => (
                      <SelectItem key={t} value={t}>{fmt(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Nível <span className="text-red-500">*</span></Label>
                <Select value={form.nivelIntervencao ?? "N0"}
                  onValueChange={(v) => setForm((f) => ({ ...f, nivelIntervencao: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N0">N0 — Manutenção simples</SelectItem>
                    <SelectItem value="N1">N1 — Intervenção moderada</SelectItem>
                    <SelectItem value="N2">N2 — Intervenção significativa</SelectItem>
                    <SelectItem value="N3">N3 — Intervenção estrutural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Início previsto</Label>
                <Input type="date" value={form.dataPrevistaInicio ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataPrevistaInicio: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim previsto</Label>
                <Input type="date" value={form.dataPrevistaFim ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataPrevistaFim: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Custo estimado (R$)</Label>
              <Input type="number" placeholder="0,00" value={form.custoEstimado ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, custoEstimado: Number(e.target.value) || undefined }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Escopo / Descrição</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={3} placeholder="Descreva o escopo da intervenção..."
                value={form.escopo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, escopo: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Justificativa</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={2} placeholder="Por que esta intervenção é necessária?"
                value={form.justificativa ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, justificativa: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Criar Intervenção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topo */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Plano de intervenções e manutenções do imóvel</p>
        {perm.canWriteIntervencao && (
          <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={() => setModalAberto(true)}>
            <Plus className="mr-2 h-3.5 w-3.5" />Nova Intervenção
          </Button>
        )}
      </div>

      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erro}
          <button onClick={() => setErro(null)} className="ml-auto text-red-400">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : intervencoes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          <Wrench className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhuma intervenção registrada.</p>
          {perm.canWriteIntervencao && (
            <button onClick={() => setModalAberto(true)}
              className="mt-2 text-[#1351B4] text-xs hover:underline">
              Planejar primeira intervenção
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {intervencoes.map((iv) => {
            const st    = STATUS_INTERV_CFG[iv.statusIntervencao] ?? STATUS_INTERV_CFG.PLANEJADA;
            const aberto = expandido === iv.id;
            const prox  = proximoStatus(iv.statusIntervencao);
            const parecer = parecerMap[iv.id];

            return (
              <div key={iv.id} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandido(aberto ? null : iv.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{iv.titulo}</span>
                        <Badge className={`text-xs flex items-center gap-1 ${st.cls}`} variant="secondary">
                          {st.icon}{st.label}
                        </Badge>
                        {iv.requerParecerFumph && (
                          <Badge className="text-xs bg-purple-100 text-purple-800" variant="secondary">
                            FUMPH
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmt(iv.tipoIntervencao)} · Nível {iv.nivelIntervencao}
                        {iv.dataPrevistaInicio ? ` · Início previsto: ${new Date(iv.dataPrevistaInicio + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}
                        {iv.custoEstimado ? ` · R$ ${iv.custoEstimado.toLocaleString("pt-BR")}` : ""}
                      </p>
                    </div>
                  </div>
                  {aberto ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
                </button>

                {aberto && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {/* Escopo */}
                    {iv.escopo && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Escopo</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{iv.escopo}</p>
                      </div>
                    )}
                    {iv.justificativa && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Justificativa</p>
                        <p className="text-sm text-gray-700">{iv.justificativa}</p>
                      </div>
                    )}

                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Campo label="Início previsto"   valor={iv.dataPrevistaInicio ? new Date(iv.dataPrevistaInicio+"T00:00:00").toLocaleDateString("pt-BR") : null} />
                      <Campo label="Fim previsto"      valor={iv.dataPrevistaFim ? new Date(iv.dataPrevistaFim+"T00:00:00").toLocaleDateString("pt-BR") : null} />
                      <Campo label="Início real"       valor={iv.dataInicioReal ? new Date(iv.dataInicioReal+"T00:00:00").toLocaleDateString("pt-BR") : null} />
                      <Campo label="Conclusão real"    valor={iv.dataConclusaoReal ? new Date(iv.dataConclusaoReal+"T00:00:00").toLocaleDateString("pt-BR") : null} />
                    </div>

                    {/* Parecer FUMPH */}
                    {iv.requerParecerFumph && (
                      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                        <p className="text-xs font-semibold text-purple-800 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Parecer FUMPH obrigatório para este imóvel histórico
                        </p>
                        {parecer ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <Campo label="Status" valor={fmt(parecer.statusParecer)} />
                            <Campo label="Nº do Parecer" valor={parecer.numeroParecer} />
                            <Campo label="Responsável FUMPH" valor={parecer.responsavelFumph} />
                            <Campo label="Data do Parecer" valor={parecer.dataParecer ? new Date(parecer.dataParecer+"T00:00:00").toLocaleDateString("pt-BR") : null} />
                            {parecer.aceiteFinal && (
                              <div className="col-span-2">
                                <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                                  <CheckCircle2 className="h-3.5 w-3.5" />Aceite final registrado em {parecer.dataAceiteFinal ? new Date(parecer.dataAceiteFinal+"T00:00:00").toLocaleDateString("pt-BR") : "—"}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-purple-700">Parecer ainda não registrado. Aguardando análise da FUMPH.</p>
                        )}
                      </div>
                    )}

                    {/* Botão de avanço de status */}
                    {perm.canWriteIntervencao && prox && (
                      <div className="flex justify-end">
                        <Button
                          size="sm" variant="outline"
                          disabled={avancoLoading === iv.id}
                          onClick={() => handleAvancar(iv, prox)}
                          className="text-[#1351B4] border-[#1351B4] hover:bg-blue-50"
                        >
                          {avancoLoading === iv.id
                            ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            : <RotateCcw className="mr-2 h-3.5 w-3.5" />
                          }
                          Avançar para: {STATUS_INTERV_CFG[prox]?.label}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sub-componente: Aba Fiscal ───────────────────────────────────────────────

function AbaFiscal({ idImovel }: { idImovel: number }) {
  const perm = usePermissoes();
  const [dados,       setDados]       = useState<DadoFiscalResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando,    setEditando]    = useState<DadoFiscalResponse | null>(null);
  const [salvando,    setSalvando]    = useState(false);
  const [formErro,    setFormErro]    = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);

  const anoAtual = new Date().getFullYear();
  const [form, setForm] = useState<Partial<DadoFiscalRequest>>({
    exercicio: anoAtual,
    divergenciaFiscal: false,
  });

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      setDados(await dadosFiscaisApi.listar(idImovel));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar dados fiscais.");
    } finally { setLoading(false); }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirCriar = () => {
    setEditando(null);
    setForm({ exercicio: anoAtual, divergenciaFiscal: false });
    setFormErro(null);
    setModalAberto(true);
  };

  const abrirEditar = (d: DadoFiscalResponse) => {
    setEditando(d);
    setForm({
      exercicio:            d.exercicio,
      inscricaoImobiliaria: d.inscricaoImobiliaria ?? "",
      cadastroMunicipalRef: d.cadastroMunicipalRef ?? "",
      valorVenalTerreno:    d.valorVenalTerreno    ?? undefined,
      valorVenalConstrucao: d.valorVenalConstrucao ?? undefined,
      divergenciaFiscal:    d.divergenciaFiscal,
      observacoes:          d.observacoes ?? "",
    });
    setFormErro(null);
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    setFormErro(null);
    if (!form.exercicio) { setFormErro("Exercício é obrigatório."); return; }
    setSalvando(true);
    try {
      if (editando) {
        await dadosFiscaisApi.atualizar(idImovel, editando.id, form as DadoFiscalRequest);
      } else {
        await dadosFiscaisApi.criar(idImovel, form as DadoFiscalRequest);
      }
      setModalAberto(false);
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally { setSalvando(false); }
  };

  const handleDeletar = async (d: DadoFiscalResponse) => {
    if (!confirm(`Remover registro do exercício ${d.exercicio}?`)) return;
    setExcluindoId(d.id);
    try {
      await dadosFiscaisApi.deletar(idImovel, d.id);
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao remover.");
    } finally { setExcluindoId(null); }
  };

  const fmtMoeda = (v: number | null | undefined) =>
    v != null ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";

  return (
    <div className="space-y-4">

      {/* Modal criar/editar */}
      <Dialog open={modalAberto} onOpenChange={(v) => { if (!v) { setModalAberto(false); setFormErro(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar — Exercício ${editando.exercicio}` : "Novo Registro Fiscal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{formErro}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Exercício <span className="text-red-500">*</span></Label>
                <Input
                  type="number" min={1900} max={2100}
                  value={form.exercicio ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, exercicio: Number(e.target.value) }))}
                  disabled={!!editando}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Inscrição Imobiliária</Label>
                <Input
                  placeholder="Ex: 01.234.567-8"
                  value={form.inscricaoImobiliaria ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, inscricaoImobiliaria: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Referência Cadastral SEMFAZ</Label>
              <Input
                placeholder="Código complementar na SEMFAZ (opcional)"
                value={form.cadastroMunicipalRef ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, cadastroMunicipalRef: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor Venal do Terreno (R$)</Label>
                <Input
                  type="number" min={0} step={0.01} placeholder="0,00"
                  value={form.valorVenalTerreno ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, valorVenalTerreno: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor Venal da Construção (R$)</Label>
                <Input
                  type="number" min={0} step={0.01} placeholder="0,00"
                  value={form.valorVenalConstrucao ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, valorVenalConstrucao: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
            </div>
            {(form.valorVenalTerreno || form.valorVenalConstrucao) && (
              <p className="text-xs text-gray-500 -mt-2">
                Total calculado: {fmtMoeda((form.valorVenalTerreno ?? 0) + (form.valorVenalConstrucao ?? 0))}
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox" id="divergencia"
                className="h-4 w-4 accent-orange-500"
                checked={form.divergenciaFiscal ?? false}
                onChange={(e) => setForm((f) => ({ ...f, divergenciaFiscal: e.target.checked }))}
              />
              <label htmlFor="divergencia" className="text-sm text-gray-700">
                Divergência fiscal identificada (valores divergem da base SEMFAZ)
              </label>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={2}
                placeholder="Justificativas, isenções, pendências de saneamento..."
                value={form.observacoes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : editando ? "Salvar alterações" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topo */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Inscrição imobiliária e valores venais por exercício (SEMFAZ)</p>
        {perm.canWriteDadoFiscal && (
          <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirCriar}>
            <Plus className="mr-2 h-3.5 w-3.5" />Novo Exercício
          </Button>
        )}
      </div>

      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erro}
          <button onClick={() => setErro(null)} className="ml-auto text-red-400">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : dados.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          <DollarSign className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhum dado fiscal registrado.</p>
          {perm.canWriteDadoFiscal && (
            <button onClick={abrirCriar} className="mt-2 text-[#1351B4] text-xs hover:underline">
              Registrar primeiro exercício
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-3 text-left">Exercício</th>
                <th className="px-4 py-3 text-left">Inscrição Imobiliária</th>
                <th className="px-4 py-3 text-right">V. Venal Terreno</th>
                <th className="px-4 py-3 text-right">V. Venal Construção</th>
                <th className="px-4 py-3 text-right">V. Venal Total</th>
                <th className="px-4 py-3 text-center">Divergência</th>
                {perm.canWriteDadoFiscal && <th className="px-4 py-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {dados.map((d) => (
                <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-semibold text-gray-900">{d.exercicio}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{d.inscricaoImobiliaria ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtMoeda(d.valorVenalTerreno)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtMoeda(d.valorVenalConstrucao)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtMoeda(d.valorVenalTotal)}</td>
                  <td className="px-4 py-3 text-center">
                    {d.divergenciaFiscal ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                        <AlertTriangle className="h-3 w-3" />Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        <CheckCircle2 className="h-3 w-3" />Não
                      </span>
                    )}
                  </td>
                  {perm.canWriteDadoFiscal && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => abrirEditar(d)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          disabled={excluindoId === d.id}
                          onClick={() => handleDeletar(d)}
                        >
                          {excluindoId === d.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ─── Sub-componente: Aba Avaliação Patrimonial ────────────────────────────────

function AbaAvaliacaoPatrimonial({ idImovel }: { idImovel: number }) {
  const perm = usePermissoes();
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoPatrimonialResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<AvaliacaoPatrimonialResponse | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<AvaliacaoPatrimonialRequest>>({
    metodologia: "COMPARATIVO_MERCADO",
    moeda: "BRL",
  });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setAvaliacoes(await avaliacoesPatrimoniaisApi.listar(idImovel));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar avaliações.");
    } finally {
      setCarregando(false);
    }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNova = () => {
    setEditando(null);
    setForm({ metodologia: "COMPARATIVO_MERCADO", moeda: "BRL" });
    setFormErro(null);
    setModalAberto(true);
  };

  const abrirEditar = (a: AvaliacaoPatrimonialResponse) => {
    setEditando(a);
    setForm({
      dataAvaliacao:  a.dataAvaliacao,
      metodologia:    a.metodologia,
      valorAvaliado:  a.valorAvaliado,
      moeda:          a.moeda,
      responsavelNome: a.responsavelNome ?? undefined,
      responsavelCrea: a.responsavelCrea ?? undefined,
      responsavelOrgao: a.responsavelOrgao ?? undefined,
      observacoes:    a.observacoes ?? undefined,
    });
    setFormErro(null);
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!form.dataAvaliacao) { setFormErro("Data da avaliação é obrigatória."); return; }
    if (!form.valorAvaliado || form.valorAvaliado <= 0) { setFormErro("Valor avaliado deve ser maior que zero."); return; }
    setSalvando(true);
    setFormErro(null);
    try {
      if (editando) {
        await avaliacoesPatrimoniaisApi.atualizar(idImovel, editando.id, form as AvaliacaoPatrimonialRequest);
      } else {
        await avaliacoesPatrimoniaisApi.criar(idImovel, form as AvaliacaoPatrimonialRequest);
      }
      setModalAberto(false);
      carregar();
    } catch (e) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar avaliação.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (a: AvaliacaoPatrimonialResponse) => {
    if (!confirm(`Remover avaliação de ${fmtMoeda(a.valorAvaliado)} (${fmtData(a.dataAvaliacao)})?`)) return;
    try {
      await avaliacoesPatrimoniaisApi.deletar(idImovel, a.id);
      carregar();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao remover avaliação.");
    }
  };

  const metodologiaLabel = (v: string) =>
    METODOLOGIAS.find((m) => m.value === v)?.label ?? v;

  // Calcula variação percentual entre valor atual e anterior
  const variacao = (atual: number, anterior: number | null) => {
    if (!anterior || anterior === 0) return null;
    const pct = ((atual - anterior) / anterior) * 100;
    return pct;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Avaliações Patrimoniais</h3>
          <p className="text-xs text-gray-400 mt-0.5">Histórico de avaliações do valor do imóvel</p>
        </div>
        {perm.canWriteAvaliacaoPatrimonial && (
          <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirNova}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Nova Avaliação
          </Button>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Avaliação" : "Nova Avaliação Patrimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {formErro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formErro}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data da Avaliação <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.dataAvaliacao ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataAvaliacao: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Metodologia <span className="text-red-500">*</span></Label>
                <Select
                  value={form.metodologia ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, metodologia: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {METODOLOGIAS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Valor Avaliado (R$) <span className="text-red-500">*</span></Label>
              <Input
                type="number" min={0} step={0.01} placeholder="0,00"
                value={form.valorAvaliado ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, valorAvaliado: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Responsável Técnico</Label>
                <Input
                  placeholder="Nome do avaliador"
                  value={form.responsavelNome ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, responsavelNome: e.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>CREA / CAU</Label>
                <Input
                  placeholder="Nº do registro"
                  value={form.responsavelCrea ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, responsavelCrea: e.target.value || undefined }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Órgão / Empresa</Label>
              <Input
                placeholder="Nome da empresa ou órgão avaliador"
                value={form.responsavelOrgao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, responsavelOrgao: e.target.value || undefined }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <textarea
                className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={2}
                placeholder="Notas, condicionantes da avaliação..."
                value={form.observacoes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value || undefined }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Registrar avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista */}
      {carregando && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {!carregando && avaliacoes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-gray-400">
          <BarChart2 className="h-8 w-8 mb-2" />
          <p className="text-sm">Nenhuma avaliação patrimonial registrada.</p>
        </div>
      )}

      {!carregando && avaliacoes.length > 0 && (
        <div className="space-y-3">
          {avaliacoes.map((av, idx) => {
            const pct = variacao(av.valorAvaliado, av.valorAnterior);
            const subiu = pct !== null && pct >= 0;
            return (
              <div key={av.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold text-gray-900">
                        {fmtMoeda(av.valorAvaliado)}
                      </span>
                      {idx === 0 && (
                        <span className="text-xs bg-[#1351B4]/10 text-[#1351B4] font-medium px-2 py-0.5 rounded-full">
                          Mais recente
                        </span>
                      )}
                      {pct !== null && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${subiu ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {subiu ? "+" : ""}{pct.toFixed(1)}% vs anterior
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      <span>{fmtData(av.dataAvaliacao)}</span>
                      <span>{metodologiaLabel(av.metodologia)}</span>
                      {av.responsavelNome && <span>{av.responsavelNome}{av.responsavelCrea ? ` — CREA ${av.responsavelCrea}` : ""}</span>}
                    </div>
                    {av.observacoes && (
                      <p className="mt-1 text-xs text-gray-400 italic">{av.observacoes}</p>
                    )}
                  </div>
                  {perm.canWriteAvaliacaoPatrimonial && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-[#1351B4]"
                        onClick={() => abrirEditar(av)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() => handleDeletar(av)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── Sub-componente: Aba Instrumentos de Uso ─────────────────────────────────

function AbaInstrumentosUso({ idImovel }: { idImovel: number }) {
  const perm = usePermissoes();
  const [instrumentos, setInstrumentos] = useState<InstrumentoUsoResponse[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<InstrumentoUsoResponse | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<InstrumentoUsoRequest>>({
    tipoInstrumento: "CESSAO_USO",
    statusInstrumento: "VIGENTE",
    oneroso: false,
  });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setInstrumentos(await instrumentosUsoApi.listar(idImovel));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar instrumentos.");
    } finally { setCarregando(false); }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ tipoInstrumento: "CESSAO_USO", statusInstrumento: "VIGENTE", oneroso: false });
    setFormErro(null);
    setModalAberto(true);
  };

  const abrirEditar = (i: InstrumentoUsoResponse) => {
    setEditando(i);
    setForm({
      tipoInstrumento:    i.tipoInstrumento,
      numeroInstrumento:  i.numeroInstrumento ?? undefined,
      dataAssinatura:     i.dataAssinatura ?? undefined,
      dataInicio:         i.dataInicio ?? undefined,
      dataVencimento:     i.dataVencimento ?? undefined,
      cedente:            i.cedente ?? undefined,
      cessionario:        i.cessionario ?? undefined,
      oneroso:            i.oneroso,
      valorMensal:        i.valorMensal ?? undefined,
      statusInstrumento:  i.statusInstrumento,
      observacoes:        i.observacoes ?? undefined,
    });
    setFormErro(null);
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!form.tipoInstrumento) { setFormErro("O tipo do instrumento é obrigatório."); return; }
    setSalvando(true); setFormErro(null);
    try {
      if (editando) {
        await instrumentosUsoApi.atualizar(idImovel, editando.id, form as InstrumentoUsoRequest);
      } else {
        await instrumentosUsoApi.criar(idImovel, form as InstrumentoUsoRequest);
      }
      setModalAberto(false);
      carregar();
    } catch (e) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar instrumento.");
    } finally { setSalvando(false); }
  };

  const handleDeletar = async (i: InstrumentoUsoResponse) => {
    if (!confirm(`Remover o instrumento "${i.numeroInstrumento ?? i.tipoInstrumento}"?`)) return;
    try {
      await instrumentosUsoApi.deletar(idImovel, i.id);
      carregar();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao remover instrumento.");
    }
  };

  const tipoLabel = (v: string) => TIPOS_INSTRUMENTO.find((t) => t.value === v)?.label ?? v;
  const statusLabel = (v: string) => STATUS_INSTRUMENTO.find((s) => s.value === v)?.label ?? v;

  const statusColor = (v: string) => {
    switch (v) {
      case "VIGENTE":    return "bg-green-50 text-green-700 border-green-200";
      case "VENCIDO":    return "bg-red-50 text-red-700 border-red-200";
      case "RESCINDIDO": return "bg-gray-100 text-gray-600 border-gray-200";
      case "RENOVADO":   return "bg-blue-50 text-blue-700 border-blue-200";
      case "SUSPENSO":   return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:           return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Verifica se está próximo do vencimento (≤ 60 dias)
  const alertaVencimento = (dataVenc: string | null) => {
    if (!dataVenc) return false;
    const diff = (new Date(dataVenc).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 60;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Instrumentos de Uso</h3>
          <p className="text-xs text-gray-400 mt-0.5">Cessões, comodatos, permissões e demais instrumentos jurídicos</p>
        </div>
        {perm.canWriteInstrumentoUso && (
          <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirNovo}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Novo Instrumento
          </Button>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Instrumento" : "Novo Instrumento de Uso"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {formErro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formErro}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo <span className="text-red-500">*</span></Label>
                <Select value={form.tipoInstrumento ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, tipoInstrumento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_INSTRUMENTO.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.statusInstrumento ?? "VIGENTE"} onValueChange={(v) => setForm((f) => ({ ...f, statusInstrumento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_INSTRUMENTO.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Número / Identificação</Label>
              <Input placeholder="Ex.: Termo de Cessão nº 001/2024" value={form.numeroInstrumento ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, numeroInstrumento: e.target.value || undefined }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Assinatura</Label>
                <Input type="date" value={form.dataAssinatura ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataAssinatura: e.target.value || undefined }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Início</Label>
                <Input type="date" value={form.dataInicio ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value || undefined }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Vencimento</Label>
                <Input type="date" value={form.dataVencimento ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value || undefined }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cedente</Label>
                <Input placeholder="Órgão cedente" value={form.cedente ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, cedente: e.target.value || undefined }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Cessionário</Label>
                <Input placeholder="Pessoa / órgão que recebe" value={form.cessionario ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, cessionario: e.target.value || undefined }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="oneroso" className="h-4 w-4 accent-[#1351B4]"
                  checked={form.oneroso ?? false}
                  onChange={(e) => setForm((f) => ({ ...f, oneroso: e.target.checked }))} />
                <label htmlFor="oneroso" className="text-sm text-gray-700">Oneroso</label>
              </div>
              {form.oneroso && (
                <div className="flex-1 space-y-1">
                  <Input type="number" min={0} step={0.01} placeholder="Valor mensal (R$)"
                    value={form.valorMensal ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, valorMensal: e.target.value ? Number(e.target.value) : undefined }))} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <textarea className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={2} placeholder="Condições especiais, restrições..."
                value={form.observacoes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value || undefined }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Registrar instrumento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {carregando && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {!carregando && instrumentos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-gray-400">
          <FileCheck className="h-8 w-8 mb-2" />
          <p className="text-sm">Nenhum instrumento de uso registrado.</p>
        </div>
      )}

      {!carregando && instrumentos.length > 0 && (
        <div className="space-y-3">
          {instrumentos.map((inst) => (
            <div key={inst.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {tipoLabel(inst.tipoInstrumento)}
                    </span>
                    {inst.numeroInstrumento && (
                      <span className="text-xs text-gray-500">— {inst.numeroInstrumento}</span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(inst.statusInstrumento)}`}>
                      {statusLabel(inst.statusInstrumento)}
                    </span>
                    {alertaVencimento(inst.dataVencimento) && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <AlertTriangle className="h-3 w-3" />Vence em breve
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    {inst.dataInicio && <span>Início: {fmtData(inst.dataInicio)}</span>}
                    {inst.dataVencimento && <span>Venc.: {fmtData(inst.dataVencimento)}</span>}
                    {inst.cessionario && <span>Cessionário: {inst.cessionario}</span>}
                    {inst.oneroso && inst.valorMensal && (
                      <span className="text-emerald-600 font-medium">Oneroso: {fmtMoeda(inst.valorMensal)}/mês</span>
                    )}
                  </div>
                  {inst.observacoes && (
                    <p className="mt-1 text-xs text-gray-400 italic">{inst.observacoes}</p>
                  )}
                </div>
                {perm.canWriteInstrumentoUso && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-[#1351B4]"
                      onClick={() => abrirEditar(inst)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeletar(inst)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function DetalhesImovel() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const perm     = usePermissoes();

  const [imovel,      setImovel]      = useState<ImovelResponse | null>(null);
  const [documentos,  setDocumentos]  = useState<DocumentoResponse[]>([]);
  const [ocupacoes,   setOcupacoes]   = useState<OcupacaoResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [loadingPdf,  setLoadingPdf]  = useState(false);
  const [erroPdf,     setErroPdf]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    setLoading(true); setErro(null);

    Promise.all([
      imoveisApi.buscarPorId(numId),
      documentosApi.listarPorImovel(numId, 0, 5),
      ocupacoesApi.listarPorImovel(numId, 0, 5),
    ])
      .then(([im, docs, ocup]) => {
        setImovel(im);
        setDocumentos(docs.content);
        setOcupacoes(ocup.content);
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
        </TabsList>

        {/* ── ABA DADOS ─────────────────────────────────────────────── */}
        <TabsContent value="dados" className="space-y-5 mt-5">
          <Secao icone={<Building2 className="h-4 w-4" />} titulo="Identificação">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Campo label="Código SIGPIM"        valor={imovel.codigoSigpim} />
              <Campo label="Tipo de imóvel"       valor={imovel.nomeTipoImovel} />
              <Campo label="Situação dominial"    valor={imovel.nomeSituacaoDominial} />
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
      </Tabs>
    </div>
  );
}