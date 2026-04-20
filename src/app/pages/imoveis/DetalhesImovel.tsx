import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, RefreshCw, AlertCircle, MapPin, FileText,
  Building2, Users, Edit, Map, Download, Loader2,
  ClipboardCheck, Wrench, Plus, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, AlertTriangle, RotateCcw,
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
import { usePermissoes } from "../../hooks/usePermissoes";

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
      </Tabs>
    </div>
  );
}