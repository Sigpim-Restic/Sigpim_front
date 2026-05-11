import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { usePermissoes } from "../../hooks/usePermissoes";
import { toast } from "sonner";
import { AlertCircle, Loader2, Plus, ChevronDown, ChevronUp, Wrench, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import {
  intervencoesApi,
  type IntervencaoResponse, type IntervencaoRequest,
  type StatusIntervencao, type ParecerFumphResponse, type ParecerFumphRequest,
} from "../../api/intervencoes";
import { fmt, STATUS_INTERV_CFG } from "./imovelHelpers";

// ─── Sub-componente: Aba Intervenções ─────────────────────────────────────────

export function AbaIntervencoes({ idImovel }: { idImovel: number }) {
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