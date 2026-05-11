import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { usePermissoes } from "../../hooks/usePermissoes";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, FileCheck, AlertTriangle } from "lucide-react";
import {
  instrumentosUsoApi,
  type InstrumentoUsoResponse,
  type InstrumentoUsoRequest,
  TIPOS_INSTRUMENTO,
  STATUS_INSTRUMENTO,
} from "../../api/instrumentosUso";
import { PessoaCombobox } from "../../components/ui/PessoaCombobox";
import { fmtMoeda, fmtData } from "./imovelHelpers";

// ─── Sub-componente: Aba Instrumentos de Uso ─────────────────────────────────

export function AbaInstrumentosUso({ idImovel }: { idImovel: number }) {
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
                <PessoaCombobox
                  value={(form as any).idCessionario ?? null}
                  valorTexto={form.cessionario}
                  onChange={(id, nome) => setForm((f) => ({ ...f, idCessionario: id ?? undefined, cessionario: nome || undefined }))}
                  onTextoChange={(txt) => setForm((f) => ({ ...f, cessionario: txt || undefined, idCessionario: undefined }))}
                  placeholder="Buscar cessionário cadastrado..."
                />
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