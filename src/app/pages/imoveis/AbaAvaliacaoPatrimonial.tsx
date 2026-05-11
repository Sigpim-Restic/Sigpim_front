import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { usePermissoes } from "../../hooks/usePermissoes";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, BarChart2 } from "lucide-react";
import {
  avaliacoesPatrimoniaisApi,
  type AvaliacaoPatrimonialResponse,
  type AvaliacaoPatrimonialRequest,
  METODOLOGIAS,
} from "../../api/avaliacoesPatrimoniais";
import { fmtMoeda, fmtData } from "./imovelHelpers";

// ─── Sub-componente: Aba Avaliação Patrimonial ────────────────────────────────

export function AbaAvaliacaoPatrimonial({ idImovel }: { idImovel: number }) {
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