import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { usePermissoes } from "../../hooks/usePermissoes";
import { toast } from "sonner";
import { AlertCircle, Loader2, Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import { dadosFiscaisApi, type DadoFiscalResponse, type DadoFiscalRequest } from "../../api/dadosFiscais";
import { fmtMoeda } from "./imovelHelpers";

// ─── Sub-componente: Aba Fiscal ───────────────────────────────────────────────

export function AbaFiscal({ idImovel }: { idImovel: number }) {
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