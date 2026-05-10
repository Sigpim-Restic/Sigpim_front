import React, { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertCircle, Pencil, Trash2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  aditivosContratoApi,
  type AditivoContratoResponse,
  type AditivoContratoRequest,
  type TipoAditivo,
  TIPO_ADITIVO_LABELS,
} from "../../api/aditivosContrato";

function fmtData(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}
function fmtMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TIPO_COR: Record<TipoAditivo, string> = {
  PRORROGACAO:    "bg-blue-50 text-blue-700 border-blue-200",
  REAJUSTE:       "bg-amber-50 text-amber-700 border-amber-200",
  ALTERACAO_VALOR: "bg-purple-50 text-purple-700 border-purple-200",
  RESCISAO:       "bg-red-50 text-red-700 border-red-200",
  OUTROS:         "bg-gray-50 text-gray-700 border-gray-200",
};

const FORM_VAZIO: AditivoContratoRequest = {
  numeroAditivo: "",
  tipoAditivo:   "PRORROGACAO",
  dataAssinatura: "",
  vigenciaInicio: "",
  valorMensal:   0,
};

interface Props {
  idContrato: number;
  valorMensalAtual: number;
  canWrite: boolean;
}

export function AbaAditivos({ idContrato, valorMensalAtual, canWrite }: Props) {
  const [aditivos,     setAditivos]     = useState<AditivoContratoResponse[]>([]);
  const [carregando,   setCarregando]   = useState(true);
  const [erro,         setErro]         = useState<string | null>(null);
  const [modalAberto,  setModalAberto]  = useState(false);
  const [editando,     setEditando]     = useState<AditivoContratoResponse | null>(null);
  const [expandido,    setExpandido]    = useState<number | null>(null);
  const [salvando,     setSalvando]     = useState(false);
  const [formErro,     setFormErro]     = useState<string | null>(null);
  const [form,         setForm]         = useState<AditivoContratoRequest>(FORM_VAZIO);

  const carregar = useCallback(async () => {
    setCarregando(true); setErro(null);
    try {
      setAditivos(await aditivosContratoApi.listar(idContrato));
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao carregar aditivos.");
    } finally { setCarregando(false); }
  }, [idContrato]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ ...FORM_VAZIO, valorMensal: valorMensalAtual });
    setFormErro(null);
    setModalAberto(true);
  };

  const abrirEditar = (a: AditivoContratoResponse) => {
    setEditando(a);
    setForm({
      numeroAditivo: a.numeroAditivo,
      tipoAditivo:   a.tipoAditivo,
      dataAssinatura: a.dataAssinatura,
      vigenciaInicio: a.vigenciaInicio,
      vigenciaFim:   a.vigenciaFim ?? undefined,
      valorMensal:   a.valorMensal,
      objeto:        a.objeto ?? undefined,
      observacoes:   a.observacoes ?? undefined,
    });
    setFormErro(null);
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!form.numeroAditivo.trim()) { setFormErro("Número do aditivo é obrigatório."); return; }
    if (!form.dataAssinatura)       { setFormErro("Data de assinatura é obrigatória."); return; }
    if (!form.vigenciaInicio)       { setFormErro("Início de vigência é obrigatório."); return; }
    if (!form.valorMensal || form.valorMensal <= 0) { setFormErro("Valor mensal deve ser maior que zero."); return; }

    setSalvando(true); setFormErro(null);
    try {
      if (editando) await aditivosContratoApi.atualizar(idContrato, editando.id, form);
      else          await aditivosContratoApi.criar(idContrato, form);
      setModalAberto(false);
      carregar();
    } catch (e: unknown) {
      setFormErro((e as Error)?.message ?? "Erro ao salvar aditivo.");
    } finally { setSalvando(false); }
  };

  const handleDeletar = async (a: AditivoContratoResponse) => {
    if (!confirm(`Remover o aditivo "${a.numeroAditivo}"?`)) return;
    try {
      await aditivosContratoApi.deletar(idContrato, a.id);
      carregar();
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao remover.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Modal */}
      <Dialog open={modalAberto} onOpenChange={(v) => { if (!v && !salvando) setModalAberto(false); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Aditivo" : "Novo Aditivo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{formErro}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Número do Aditivo *</Label>
                <Input value={form.numeroAditivo}
                  onChange={(e) => setForm((f) => ({ ...f, numeroAditivo: e.target.value }))}
                  placeholder="Ex: 01/2025" disabled={salvando} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Tipo *</Label>
                <Select value={form.tipoAditivo}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipoAditivo: v as TipoAditivo }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(TIPO_ADITIVO_LABELS) as [TipoAditivo, string][]).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Data de Assinatura *</Label>
                <Input type="date" value={form.dataAssinatura}
                  onChange={(e) => setForm((f) => ({ ...f, dataAssinatura: e.target.value }))}
                  disabled={salvando} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Valor Mensal Vigente (R$) *</Label>
                <Input type="number" step="0.01" min="0"
                  value={form.valorMensal || ""}
                  onChange={(e) => setForm((f) => ({ ...f, valorMensal: Number(e.target.value) }))}
                  placeholder="0,00" disabled={salvando} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Início da Vigência *</Label>
                <Input type="date" value={form.vigenciaInicio}
                  onChange={(e) => setForm((f) => ({ ...f, vigenciaInicio: e.target.value }))}
                  disabled={salvando} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Fim da Vigência</Label>
                <Input type="date" value={form.vigenciaFim ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, vigenciaFim: e.target.value || undefined }))}
                  disabled={salvando} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Objeto / O que foi alterado</Label>
              <Textarea value={form.objeto ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, objeto: e.target.value || undefined }))}
                rows={2} className="resize-none" placeholder="Descreva o que foi alterado neste aditivo..."
                disabled={salvando} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Observações</Label>
              <Textarea value={form.observacoes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value || undefined }))}
                rows={2} className="resize-none" disabled={salvando} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={salvando} className="bg-[#1351B4] hover:bg-[#0c3b8d]">
              {salvando ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar Aditivo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Histórico de Aditivos</h3>
          <p className="text-xs text-gray-400 mt-0.5">Prorrogações, reajustes e alterações contratuais</p>
        </div>
        {canWrite && (
          <Button size="sm" variant="outline" onClick={abrirNovo}
            className="text-[#1351B4] border-[#1351B4] hover:bg-blue-50">
            <Plus className="mr-1.5 h-3.5 w-3.5" />Novo Aditivo
          </Button>
        )}
      </div>

      {erro && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{erro}
        </div>
      )}

      {carregando ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : aditivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-gray-400">
          <FileText className="h-8 w-8 mb-2" />
          <p className="text-sm">Nenhum aditivo registrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {aditivos.map((a) => {
            const aberto = expandido === a.id;
            return (
              <div key={a.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <button onClick={() => setExpandido(aberto ? null : a.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className={`shrink-0 text-xs ${TIPO_COR[a.tipoAditivo]}`}>
                      {TIPO_ADITIVO_LABELS[a.tipoAditivo]}
                    </Badge>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{a.numeroAditivo}</span>
                        <span className="text-xs text-gray-400">{fmtData(a.dataAssinatura)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmtMoeda(a.valorMensal)}/mês · vigência: {fmtData(a.vigenciaInicio)}
                        {a.vigenciaFim ? ` → ${fmtData(a.vigenciaFim)}` : " (indeterminado)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {canWrite && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-[#1351B4]"
                          onClick={(e) => { e.stopPropagation(); abrirEditar(a); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); handleDeletar(a); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {aberto
                      ? <ChevronUp className="h-4 w-4 text-gray-400 ml-1" />
                      : <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />}
                  </div>
                </button>
                {aberto && (a.objeto || a.observacoes) && (
                  <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                    {a.objeto && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Objeto</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{a.objeto}</p>
                      </div>
                    )}
                    {a.observacoes && (
                      <p className="text-xs text-gray-400 italic">{a.observacoes}</p>
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