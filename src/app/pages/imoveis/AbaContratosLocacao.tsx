import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { usePermissoes } from "../../hooks/usePermissoes";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, FileText, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { contratosLocacaoApi, type ContratoLocacaoResponse, type ContratoLocacaoRequest, STATUS_CONTRATO } from "../../api/contratoLocacao";
import { PessoaCombobox } from "../../components/ui/PessoaCombobox";
import { AbaAditivos } from "./AbaAditivos";
import { fmtMoeda, fmtData } from "./imovelHelpers";

// ─── Sub-componente: Aba Contratos de Locação ────────────────────────────────

export function AbaContratosLocacao({ idImovel }: { idImovel: number }) {
  const perm = usePermissoes();
  const [contratos,    setContratos]    = useState<ContratoLocacaoResponse[]>([]);
  const [carregando,   setCarregando]   = useState(false);
  const [erro,         setErro]         = useState<string | null>(null);
  const [modalAberto,  setModalAberto]  = useState(false);
  const [editando,     setEditando]     = useState<ContratoLocacaoResponse | null>(null);
  const [salvando,     setSalvando]     = useState(false);
  const [formErro,     setFormErro]     = useState<string | null>(null);
  const [expandido,    setExpandido]    = useState<number | null>(null);
  const [form, setForm] = useState<Partial<ContratoLocacaoRequest>>({
    statusContrato: "VIGENTE",
    alertaDias: [90, 60, 30],
  });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setContratos(await contratosLocacaoApi.listar(idImovel));
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar contratos.");
    } finally { setCarregando(false); }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm({ statusContrato: "VIGENTE", alertaDias: [90, 60, 30] });
    setFormErro(null);
    setModalAberto(true);
  };

  const abrirEditar = (c: ContratoLocacaoResponse) => {
    setEditando(c);
    setForm({
      numeroContrato:    c.numeroContrato ?? undefined,
      locador:           c.locador,
      dataAssinatura:    c.dataAssinatura ?? undefined,
      vigenciaInicio:    c.vigenciaInicio,
      vigenciaFim:       c.vigenciaFim ?? undefined,
      valorMensal:       c.valorMensal,
      reajuste:          c.reajuste ?? undefined,
      fiscalContrato:    c.fiscalContrato ?? undefined,
      idOrgaoBeneficiario: c.idOrgaoBeneficiario ?? undefined,
      alertaDias:        c.alertaDias,
      statusContrato:    c.statusContrato,
      observacoes:       c.observacoes ?? undefined,
    });
    setFormErro(null);
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!form.locador?.trim() && !(form as any).idLocador) {
      setFormErro("Locador é obrigatório."); return;
    }
    if (!form.vigenciaInicio) { setFormErro("Início de vigência é obrigatório."); return; }
    if (!form.valorMensal || form.valorMensal <= 0) {
      setFormErro("Valor mensal deve ser maior que zero."); return;
    }
    setSalvando(true); setFormErro(null);
    try {
      if (editando) {
        await contratosLocacaoApi.atualizar(idImovel, editando.id, form as ContratoLocacaoRequest);
      } else {
        await contratosLocacaoApi.criar(idImovel, form as ContratoLocacaoRequest);
      }
      setModalAberto(false);
      carregar();
    } catch (e) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar contrato.");
    } finally { setSalvando(false); }
  };

  const handleDeletar = async (c: ContratoLocacaoResponse) => {
    if (!confirm(`Remover o contrato "${c.numeroContrato ?? c.locador}"?`)) return;
    try {
      await contratosLocacaoApi.deletar(idImovel, c.id);
      carregar();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao remover contrato.");
    }
  };

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

  const alertaVencimento = (dataVenc: string | null) => {
    if (!dataVenc) return false;
    const diff = (new Date(dataVenc).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 60;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Contratos de Locação</h3>
          <p className="text-xs text-gray-400 mt-0.5">Imóveis locados pela prefeitura com vigência e alertas</p>
        </div>
        {perm.canWriteInstrumentoUso && (
          <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirNovo}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Novo Contrato
          </Button>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalAberto} onOpenChange={(v) => { if (!v && !salvando) setModalAberto(false); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Contrato" : "Novo Contrato de Locação"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {formErro && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formErro}</p>
            )}
            <div className="space-y-1.5">
              <Label>Locador <span className="text-red-500">*</span></Label>
              <PessoaCombobox
                value={(form as any).idLocador ?? null}
                valorTexto={form.locador}
                onChange={(id, nome) => setForm((f) => ({ ...f, idLocador: id ?? undefined, locador: nome || undefined }))}
                onTextoChange={(txt) => setForm((f) => ({ ...f, locador: txt || undefined, idLocador: undefined }))}
                placeholder="Buscar locador cadastrado..."
                disabled={salvando}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Número do Contrato</Label>
                <Input placeholder="Ex: 001/2025" value={form.numeroContrato ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, numeroContrato: e.target.value || undefined }))}
                  disabled={salvando} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.statusContrato ?? "VIGENTE"}
                  onValueChange={(v) => setForm((f) => ({ ...f, statusContrato: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_CONTRATO.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Assinatura</Label>
                <Input type="date" value={form.dataAssinatura ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dataAssinatura: e.target.value || undefined }))}
                  disabled={salvando} />
              </div>
              <div className="space-y-1.5">
                <Label>Início <span className="text-red-500">*</span></Label>
                <Input type="date" value={form.vigenciaInicio ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, vigenciaInicio: e.target.value || undefined }))}
                  disabled={salvando} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input type="date" value={form.vigenciaFim ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, vigenciaFim: e.target.value || undefined }))}
                  disabled={salvando} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Valor Mensal (R$) <span className="text-red-500">*</span></Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00"
                  value={form.valorMensal ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, valorMensal: e.target.value ? Number(e.target.value) : undefined }))}
                  disabled={salvando} />
              </div>
              <div className="space-y-1.5">
                <Label>Índice de Reajuste</Label>
                <Input placeholder="IPCA, IGP-M, INPC..." value={form.reajuste ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, reajuste: e.target.value || undefined }))}
                  disabled={salvando} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Fiscal do Contrato</Label>
              <Input placeholder="Nome do fiscal responsável" value={form.fiscalContrato ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, fiscalContrato: e.target.value || undefined }))}
                disabled={salvando} />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <textarea className="w-full rounded-md border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1351B4]"
                rows={2} placeholder="Condições especiais, garantias..."
                value={form.observacoes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value || undefined }))}
                disabled={salvando} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : editando ? "Salvar alterações" : "Registrar contrato"}
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

      {!carregando && contratos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-gray-400">
          <FileText className="h-8 w-8 mb-2" />
          <p className="text-sm">Nenhum contrato de locação registrado.</p>
        </div>
      )}

      {!carregando && contratos.length > 0 && (
        <div className="space-y-3">
          {contratos.map((c) => {
            const aberto = expandido === c.id;
            return (
              <div key={c.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <button
                  onClick={() => setExpandido(aberto ? null : c.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 truncate">{c.locador}</span>
                        {c.numeroContrato && (
                          <span className="text-xs text-gray-400">— {c.numeroContrato}</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(c.statusContrato)}`}>
                          {STATUS_CONTRATO.find((s) => s.value === c.statusContrato)?.label ?? c.statusContrato}
                        </span>
                        {alertaVencimento(c.vigenciaFim) && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                            <AlertTriangle className="h-3 w-3" />Vence em breve
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-gray-500">
                        <span>{fmtMoeda(c.valorMensal)}/mês</span>
                        {c.vigenciaInicio && <span>Início: {fmtData(c.vigenciaInicio)}</span>}
                        {c.vigenciaFim && <span>Fim: {fmtData(c.vigenciaFim)}</span>}
                        {c.reajuste && <span>Reajuste: {c.reajuste}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {perm.canWriteInstrumentoUso && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-[#1351B4]"
                          onClick={(e) => { e.stopPropagation(); abrirEditar(c); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); handleDeletar(c); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {aberto
                      ? <ChevronUp className="h-4 w-4 text-gray-400 ml-1" />
                      : <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />}
                  </div>
                </button>

                {/* Detalhes expandidos + Aditivos */}
                {aberto && (
                  <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                    {(c.fiscalContrato || c.observacoes) && (
                      <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        {c.fiscalContrato && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Fiscal do Contrato</p>
                            <p className="text-gray-800">{c.fiscalContrato}</p>
                          </div>
                        )}
                        {c.observacoes && (
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">Observações</p>
                            <p className="text-gray-600 italic text-xs">{c.observacoes}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Histórico de Aditivos */}
                    <div className="border-t border-gray-100 pt-4">
                      <AbaAditivos
                        idContrato={c.id}
                        valorMensalAtual={c.valorMensal}
                        canWrite={perm.canWriteInstrumentoUso}
                      />
                    </div>
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