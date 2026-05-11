import { toast } from "sonner";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, MoreVertical, Loader2, AlertCircle,
  RefreshCw, Trash2, Pencil, User, Building2, Landmark,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "../../components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  pessoasApi, type PessoaResponse, type PessoaRequest,
  type TipoPessoa, TIPO_PESSOA_LABELS,
} from "../../api/pessoas";

// ── Ícone por tipo ────────────────────────────────────────────────────────────
function TipoIcon({ tipo }: { tipo: TipoPessoa }) {
  if (tipo === "PF")           return <User className="h-3.5 w-3.5 text-blue-500" />;
  if (tipo === "PJ")           return <Building2 className="h-3.5 w-3.5 text-purple-500" />;
  return <Landmark className="h-3.5 w-3.5 text-emerald-500" />;
}

const TIPO_COR: Record<TipoPessoa, string> = {
  PF:           "bg-blue-50 text-blue-700 border-blue-200",
  PJ:           "bg-purple-50 text-purple-700 border-purple-200",
  ORGAO_PUBLICO: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ── Formulário ────────────────────────────────────────────────────────────────
const FORM_VAZIO: PessoaRequest = {
  tipoPessoa: "PF",
  nome: "",
};

interface ModalPessoaProps {
  aberto: boolean;
  editando: PessoaResponse | null;
  onFechar: () => void;
  onSalvo: () => void;
}

function ModalPessoa({ aberto, editando, onFechar, onSalvo }: ModalPessoaProps) {
  const [form,     setForm]     = useState<PessoaRequest>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setErro(null);
      if (editando) {
        setForm({
          tipoPessoa:       editando.tipoPessoa,
          nome:             editando.nome,
          cpfCnpj:          editando.cpfCnpj ?? undefined,
          rg:               editando.rg ?? undefined,
          inscricaoMunicipal: editando.inscricaoMunicipal ?? undefined,
          numeroCredor:     editando.numeroCredor ?? undefined,
          logradouro:       editando.logradouro ?? undefined,
          numero:           editando.numero ?? undefined,
          complemento:      editando.complemento ?? undefined,
          bairro:           editando.bairro ?? undefined,
          cidade:           editando.cidade ?? undefined,
          estado:           editando.estado ?? undefined,
          cep:              editando.cep ?? undefined,
          telefone:         editando.telefone ?? undefined,
          email:            editando.email ?? undefined,
          observacoes:      editando.observacoes ?? undefined,
        });
      } else {
        setForm(FORM_VAZIO);
      }
    }
  }, [aberto, editando]);

  const set = (campo: keyof PessoaRequest, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor || undefined }));

  const handleSalvar = async () => {
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    setSalvando(true); setErro(null);
    try {
      if (editando) await pessoasApi.atualizar(editando.id, form);
      else          await pessoasApi.criar(form);
      onSalvo();
      onFechar();
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => { if (!v && !salvando) onFechar(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar Pessoa" : "Nova Pessoa"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{erro}
            </div>
          )}

          {/* Tipo + Nome */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Tipo *</Label>
              <Select value={form.tipoPessoa} onValueChange={(v) => set("tipoPessoa", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIPO_PESSOA_LABELS) as [TipoPessoa, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-gray-600">Nome / Razão Social *</Label>
              <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Nome completo ou razão social" />
            </div>
          </div>

          {/* CPF/CNPJ + RG */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                {form.tipoPessoa === "PF" ? "CPF" : "CNPJ"}
              </Label>
              <Input value={form.cpfCnpj ?? ""} onChange={(e) => set("cpfCnpj", e.target.value)}
                placeholder={form.tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                {form.tipoPessoa === "PF" ? "RG" : "Inscrição Municipal"}
              </Label>
              <Input
                value={form.tipoPessoa === "PF" ? (form.rg ?? "") : (form.inscricaoMunicipal ?? "")}
                onChange={(e) => set(form.tipoPessoa === "PF" ? "rg" : "inscricaoMunicipal", e.target.value)}
                placeholder={form.tipoPessoa === "PF" ? "Documento de identidade" : "Inscrição municipal"} />
            </div>
          </div>

          {/* Nº Credor + Contato */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Nº Credor (SEMFAZ)</Label>
              <Input value={form.numeroCredor ?? ""} onChange={(e) => set("numeroCredor", e.target.value)}
                placeholder="Referência financeira" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Telefone</Label>
              <Input value={form.telefone ?? ""} onChange={(e) => set("telefone", e.target.value)}
                placeholder="(98) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">E-mail</Label>
              <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)}
                placeholder="email@dominio.com.br" />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</p>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs text-gray-600">Logradouro</Label>
                <Input value={form.logradouro ?? ""} onChange={(e) => set("logradouro", e.target.value)}
                  placeholder="Rua, Av., Travessa..." />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Número</Label>
                <Input value={form.numero ?? ""} onChange={(e) => set("numero", e.target.value)}
                  placeholder="123 ou S/N" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">CEP</Label>
                <Input value={form.cep ?? ""} onChange={(e) => set("cep", e.target.value)}
                  placeholder="65000-000" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Bairro</Label>
                <Input value={form.bairro ?? ""} onChange={(e) => set("bairro", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Cidade</Label>
                <Input value={form.cidade ?? ""} onChange={(e) => set("cidade", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Estado</Label>
                <Input value={form.estado ?? ""} onChange={(e) => set("estado", e.target.value)}
                  maxLength={2} placeholder="MA" />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-600">Observações</Label>
            <Textarea value={form.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)}
              rows={2} className="resize-none" placeholder="Informações adicionais..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={salvando}
            className="bg-[#1351B4] hover:bg-[#0c3b8d]">
            {salvando ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function GerenciarPessoas() {
  const [pessoas,   setPessoas]   = useState<PessoaResponse[]>([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState<string | null>(null);
  const [busca,     setBusca]     = useState("");
  const [filtTipo,  setFiltTipo]  = useState("todos");
  const [page,      setPage]      = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando,  setEditando]  = useState<PessoaResponse | null>(null);
  const [excluindo, setExcluindo] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ aberto: boolean; id: number | null; nome: string }>({
    aberto: false, id: null, nome: "",
  });

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const res = await pessoasApi.buscar({
        busca: busca || undefined,
        tipo: filtTipo !== "todos" ? filtTipo : undefined,
        page,
        size: 20,
      });
      setPessoas(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao carregar pessoas.");
    } finally { setLoading(false); }
  }, [busca, filtTipo, page]);

  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { setPage(0); }, [busca, filtTipo]);

  const handleExcluir = (p: PessoaResponse) =>
    setConfirmDelete({ aberto: true, id: p.id, nome: p.nome });

  const confirmarExcluir = async () => {
    if (!confirmDelete.id) return;
    const id = confirmDelete.id;
    setConfirmDelete((s) => ({ ...s, aberto: false }));
    setExcluindo(id);
    try {
      await pessoasApi.deletar(id);
      toast.success("Pessoa removida.");
      carregar();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Erro ao remover.");
      setErro((e as Error)?.message ?? "Erro ao remover.");
    } finally { setExcluindo(null); }
  };

  const abrirNova = () => { setEditando(null); setModalAberto(true); };
  const abrirEditar = (p: PessoaResponse) => { setEditando(p); setModalAberto(true); };

  return (
    <div className="space-y-6">
      <ModalPessoa
        aberto={modalAberto}
        editando={editando}
        onFechar={() => setModalAberto(false)}
        onSalvo={carregar}
      />

      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Locadores, cessionários, fiscais e contatos patrimoniais
          {!loading && <span className="ml-1 text-gray-400">({total} no total)</span>}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={abrirNova} className="bg-[#1351B4] hover:bg-[#0c3b8d]">
            <Plus className="mr-2 h-4 w-4" />Nova Pessoa
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar por nome ou CPF/CNPJ..."
            value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
        <Select value={filtTipo} onValueChange={setFiltTipo}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {(Object.entries(TIPO_PESSOA_LABELS) as [TipoPessoa, string][]).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erro}
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
        </div>
      ) : pessoas.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <User className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">
            {busca || filtTipo !== "todos" ? "Nenhuma pessoa encontrada." : "Nenhuma pessoa cadastrada."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome / Razão Social</TableHead>
                  <TableHead>CPF / CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pessoas.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50/80">
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 ${TIPO_COR[p.tipoPessoa]}`}>
                        <TipoIcon tipo={p.tipoPessoa} />
                        {TIPO_PESSOA_LABELS[p.tipoPessoa]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">{p.cpfCnpj ?? "—"}</TableCell>
                    <TableCell className="text-gray-600">{p.telefone ?? "—"}</TableCell>
                    <TableCell className="text-gray-600">{p.email ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"
                            disabled={excluindo === p.id}>
                            {excluindo === p.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <MoreVertical className="h-4 w-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => abrirEditar(p)}>
                            <Pencil className="mr-2 h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600"
                            onClick={() => handleExcluir(p)}>
                            <Trash2 className="mr-2 h-4 w-4" />Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{pessoas.length} de {total} · página {page + 1}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm"
              disabled={(page + 1) * 20 >= total || loading}
              onClick={() => setPage((p) => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmDelete.aberto} onOpenChange={(v) => !v && setConfirmDelete((s) => ({ ...s, aberto: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover pessoa</AlertDialogTitle>
            <AlertDialogDescription>
              Remover <strong>{confirmDelete.nome}</strong>? Contratos vinculados perderão o vínculo. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExcluir} className="bg-red-600 hover:bg-red-700 text-white">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}