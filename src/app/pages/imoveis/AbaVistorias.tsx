import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { usePermissoes } from "../../hooks/usePermissoes";
import { toast } from "sonner";
import { AlertCircle, Loader2, Plus, ChevronDown, ChevronUp, ClipboardCheck } from "lucide-react";
import { vistoriasApi, type VistoriaResponse, type VistoriaRequest } from "../../api/vistorias";
import { fmt, fmtData, CRITICIDADE_CFG } from "./imovelHelpers";

// ─── Sub-componente: Aba Vistorias ────────────────────────────────────────────

export function AbaVistorias({ idImovel }: { idImovel: number }) {
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