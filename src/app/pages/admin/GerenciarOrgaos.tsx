import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Plus, Pencil, ArrowLeft, RefreshCw, AlertCircle, Building2,
  ChevronRight, ChevronDown, Layers, Power, PowerOff, AlertTriangle, Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { orgaosApi, type OrgaoResponse, type OrgaoRequest } from "../../api/orgaos";
import { unidadesApi, type UnidadeOrganizacionalResponse, type UnidadeOrganizacionalRequest } from "../../api/unidades";

// ── Form states ────────────────────────────────────────────────────────────────

interface OrgaoForm {
  aberto: boolean;
  modo: "criar" | "editar";
  id: number | null;
  nome: string;
  sigla: string;
  codigo: string;
}

interface UnidadeForm {
  aberto: boolean;
  modo: "criar" | "editar";
  id: number | null;
  idOrgao: number | null;
  nomeOrgao: string;
  nome: string;
  sigla: string;
  codigo: string;
}

const orgaoFormVazio: OrgaoForm = {
  aberto: false, modo: "criar", id: null, nome: "", sigla: "", codigo: "",
};
const unidadeFormVazio: UnidadeForm = {
  aberto: false, modo: "criar", id: null, idOrgao: null, nomeOrgao: "",
  nome: "", sigla: "", codigo: "",
};

// ── Componente ─────────────────────────────────────────────────────────────────

export function GerenciarOrgaos() {
  const navigate = useNavigate();

  const [orgaos,       setOrgaos]       = useState<OrgaoResponse[]>([]);
  const [unidades,     setUnidades]     = useState<Record<number, UnidadeOrganizacionalResponse[]>>({});
  const [expanded,     setExpanded]     = useState<Set<number>>(new Set());
  const [loading,      setLoading]      = useState(true);
  const [loadingUnid,  setLoadingUnid]  = useState<Record<number, boolean>>({});
  const [erro,         setErro]         = useState<string | null>(null);
  const [acaoLoading,  setAcaoLoading]  = useState<string | null>(null);

  const [orgaoForm,    setOrgaoForm]    = useState<OrgaoForm>(orgaoFormVazio);
  const [unidadeForm,  setUnidadeForm]  = useState<UnidadeForm>(unidadeFormVazio);
  const [formErro,     setFormErro]     = useState<string | null>(null);
  const [salvando,     setSalvando]     = useState(false);

  const [extinguirConfirm, setExtinguirConfirm] = useState<OrgaoResponse | null>(null);

  // ── Carregamento ─────────────────────────────────────────────────────────────

  const carregarOrgaos = useCallback(() => {
    setLoading(true);
    setErro(null);
    orgaosApi.listarTodos()
      .then(setOrgaos)
      .catch(() => setErro("Não foi possível carregar os órgãos."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregarOrgaos(); }, [carregarOrgaos]);

  const carregarUnidades = useCallback(async (idOrgao: number) => {
    setLoadingUnid((p) => ({ ...p, [idOrgao]: true }));
    try {
      const lista = await unidadesApi.listarPorOrgao(idOrgao);
      setUnidades((p) => ({ ...p, [idOrgao]: lista }));
    } finally {
      setLoadingUnid((p) => ({ ...p, [idOrgao]: false }));
    }
  }, []);

  // ── Toggle expansion ─────────────────────────────────────────────────────────

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); return next; }
      next.add(id);
      if (!unidades[id]) carregarUnidades(id);
      return next;
    });
  };

  // ── Órgão CRUD ───────────────────────────────────────────────────────────────

  const abrirCriarOrgao = () => setOrgaoForm({ ...orgaoFormVazio, aberto: true });

  const abrirEditarOrgao = (o: OrgaoResponse) =>
    setOrgaoForm({ aberto: true, modo: "editar", id: o.id, nome: o.nome, sigla: o.sigla, codigo: o.codigo ?? "" });

  const fecharOrgaoForm = () => { setOrgaoForm(orgaoFormVazio); setFormErro(null); };

  const handleSalvarOrgao = async () => {
    setFormErro(null);
    if (!orgaoForm.nome.trim()) { setFormErro("Nome é obrigatório."); return; }
    if (!orgaoForm.sigla.trim()) { setFormErro("Sigla é obrigatória."); return; }

    const req: OrgaoRequest = {
      nome: orgaoForm.nome.trim(),
      sigla: orgaoForm.sigla.trim().toUpperCase(),
      codigo: orgaoForm.codigo.trim() || undefined,
    };

    setSalvando(true);
    try {
      if (orgaoForm.modo === "criar") {
        await orgaosApi.criar(req);
        toast.success("Órgão criado com sucesso.");
      } else {
        await orgaosApi.atualizar(orgaoForm.id!, req);
        toast.success("Órgão atualizado.");
      }
      fecharOrgaoForm();
      carregarOrgaos();
    } catch (e: unknown) {
      setFormErro((e as Error)?.message ?? "Erro ao salvar órgão.");
    } finally {
      setSalvando(false);
    }
  };

  const handleAtivarOrgao = async (o: OrgaoResponse) => {
    const chave = `orgao-${o.id}`;
    setAcaoLoading(chave);
    try {
      const atualizado = o.extinto
        ? await orgaosApi.restabelecer(o.id)
        : await orgaosApi.ativar(o.id);
      setOrgaos((prev) => prev.map((x) => x.id === o.id ? atualizado : x));
      toast.success("Órgão ativado.");
    } catch {
      toast.error("Erro ao ativar órgão.");
    } finally {
      setAcaoLoading(null);
    }
  };

  const handleDesativarOrgao = async (o: OrgaoResponse) => {
    const chave = `orgao-${o.id}`;
    setAcaoLoading(chave);
    try {
      const atualizado = await orgaosApi.desativar(o.id);
      setOrgaos((prev) => prev.map((x) => x.id === o.id ? atualizado : x));
      toast.success("Órgão desativado.");
    } catch {
      toast.error("Erro ao desativar órgão.");
    } finally {
      setAcaoLoading(null);
    }
  };

  const handleExtinguir = async (o: OrgaoResponse) => {
    setExtinguirConfirm(null);
    const chave = `orgao-${o.id}`;
    setAcaoLoading(chave);
    try {
      const atualizado = await orgaosApi.extinguir(o.id);
      setOrgaos((prev) => prev.map((x) => x.id === o.id ? atualizado : x));
      toast.success(`Órgão "${o.sigla}" extinto.`);
    } catch {
      toast.error("Erro ao extinguir órgão.");
    } finally {
      setAcaoLoading(null);
    }
  };

  // ── Unidade CRUD ─────────────────────────────────────────────────────────────

  const abrirCriarUnidade = (orgao: OrgaoResponse) =>
    setUnidadeForm({ aberto: true, modo: "criar", id: null, idOrgao: orgao.id, nomeOrgao: orgao.sigla, nome: "", sigla: "", codigo: "" });

  const abrirEditarUnidade = (u: UnidadeOrganizacionalResponse, nomeOrgao: string) =>
    setUnidadeForm({ aberto: true, modo: "editar", id: u.id, idOrgao: u.idOrgao, nomeOrgao, nome: u.nome, sigla: u.sigla ?? "", codigo: u.codigo ?? "" });

  const fecharUnidadeForm = () => { setUnidadeForm(unidadeFormVazio); setFormErro(null); };

  const handleSalvarUnidade = async () => {
    setFormErro(null);
    if (!unidadeForm.nome.trim()) { setFormErro("Nome é obrigatório."); return; }

    const req: UnidadeOrganizacionalRequest = {
      idOrgao: unidadeForm.idOrgao!,
      nome: unidadeForm.nome.trim(),
      sigla: unidadeForm.sigla.trim().toUpperCase() || undefined,
      codigo: unidadeForm.codigo.trim() || undefined,
    };

    setSalvando(true);
    try {
      if (unidadeForm.modo === "criar") {
        await unidadesApi.criar(req);
        toast.success("Departamento criado com sucesso.");
      } else {
        await unidadesApi.atualizar(unidadeForm.id!, req);
        toast.success("Departamento atualizado.");
      }
      fecharUnidadeForm();
      carregarUnidades(unidadeForm.idOrgao!);
    } catch (e: unknown) {
      setFormErro((e as Error)?.message ?? "Erro ao salvar departamento.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleUnidade = async (u: UnidadeOrganizacionalResponse) => {
    const chave = `unidade-${u.id}`;
    setAcaoLoading(chave);
    try {
      const atualizado = u.ativo
        ? await unidadesApi.desativar(u.id)
        : await unidadesApi.ativar(u.id);
      setUnidades((prev) => ({
        ...prev,
        [u.idOrgao]: (prev[u.idOrgao] ?? []).map((x) => x.id === u.id ? atualizado : x),
      }));
      toast.success(u.ativo ? "Departamento desativado." : "Departamento ativado.");
    } catch {
      toast.error("Erro ao alterar departamento.");
    } finally {
      setAcaoLoading(null);
    }
  };

  // ── Status badge ──────────────────────────────────────────────────────────────

  const StatusBadge = ({ o }: { o: OrgaoResponse }) => {
    if (o.extinto) return <Badge className="bg-red-50 text-red-600 border-red-200 text-xs">Extinto</Badge>;
    if (!o.ativo)  return <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-xs">Inativo</Badge>;
    return <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Ativo</Badge>;
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/configuracoes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#1351B4]" />
            Órgãos e Secretarias
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie os órgãos da Prefeitura e seus departamentos. Extinguir um órgão preserva o histórico patrimonial.
          </p>
        </div>
        <Button onClick={abrirCriarOrgao} className="bg-[#1351B4] hover:bg-[#0c3b8d] gap-1.5">
          <Plus className="h-4 w-4" />Novo Órgão
        </Button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{erro}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={carregarOrgaos}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-8" />
                <TableHead>Sigla</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgaos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    Nenhum órgão cadastrado.
                  </TableCell>
                </TableRow>
              )}
              {orgaos.map((o) => {
                const isExpanded = expanded.has(o.id);
                const isLoadingUnid = loadingUnid[o.id];
                const orgaoUnidades = unidades[o.id] ?? [];
                const isAcaoLoading = acaoLoading === `orgao-${o.id}`;

                return (
                  <React.Fragment key={o.id}>
                    <TableRow className="hover:bg-gray-50/50">
                      <TableCell>
                        <button
                          onClick={() => toggleExpand(o.id)}
                          className="text-gray-400 hover:text-[#1351B4] transition-colors p-1"
                          title={isExpanded ? "Ocultar departamentos" : "Ver departamentos"}
                        >
                          {isExpanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-[#1351B4]">{o.sigla}</TableCell>
                      <TableCell className="font-medium text-gray-900">{o.nome}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{o.codigo ?? "—"}</TableCell>
                      <TableCell><StatusBadge o={o} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-[#1351B4]"
                            title="Editar"
                            onClick={() => abrirEditarOrgao(o)}
                            disabled={isAcaoLoading}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {o.extinto ? (
                            <Button
                              variant="ghost" size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-green-600"
                              title="Restabelecer"
                              onClick={() => handleAtivarOrgao(o)}
                              disabled={isAcaoLoading}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                          ) : o.ativo ? (
                            <>
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 text-gray-400 hover:text-yellow-600"
                                title="Desativar"
                                onClick={() => handleDesativarOrgao(o)}
                                disabled={isAcaoLoading}
                              >
                                <PowerOff className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                                title="Extinguir órgão"
                                onClick={() => setExtinguirConfirm(o)}
                                disabled={isAcaoLoading}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost" size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-green-600"
                              title="Ativar"
                              onClick={() => handleAtivarOrgao(o)}
                              disabled={isAcaoLoading}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Departamentos expandidos */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0 bg-gray-50/50">
                          <div className="ml-8 border-l-2 border-[#1351B4]/20 py-2 pl-4 pr-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5" />
                                Departamentos / Unidades de {o.sigla}
                              </span>
                              {!o.extinto && (
                                <Button
                                  variant="outline" size="sm"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => abrirCriarUnidade(o)}
                                >
                                  <Plus className="h-3 w-3" />Novo Departamento
                                </Button>
                              )}
                            </div>

                            {isLoadingUnid ? (
                              <p className="text-xs text-gray-400 py-2">Carregando...</p>
                            ) : orgaoUnidades.length === 0 ? (
                              <p className="text-xs text-gray-400 py-2 italic">Nenhum departamento cadastrado.</p>
                            ) : (
                              <div className="space-y-1">
                                {orgaoUnidades.map((u) => {
                                  const isUnidLoading = acaoLoading === `unidade-${u.id}`;
                                  return (
                                    <div key={u.id}
                                      className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-100">
                                      <div className="flex items-center gap-2 min-w-0">
                                        {u.sigla && (
                                          <span className="text-xs font-mono text-[#1351B4] font-semibold shrink-0">
                                            {u.sigla}
                                          </span>
                                        )}
                                        <span className="text-sm text-gray-800 truncate">{u.nome}</span>
                                        {u.codigo && (
                                          <span className="text-xs text-gray-400">({u.codigo})</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <Badge className={u.ativo
                                          ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                          : "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                                        }>
                                          {u.ativo ? "Ativo" : "Inativo"}
                                        </Badge>
                                        <Button variant="ghost" size="sm"
                                          className="h-6 w-6 p-0 text-gray-400 hover:text-[#1351B4]"
                                          title="Editar"
                                          onClick={() => abrirEditarUnidade(u, o.sigla)}
                                          disabled={isUnidLoading}>
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm"
                                          className={`h-6 w-6 p-0 text-gray-400 ${u.ativo ? "hover:text-yellow-600" : "hover:text-green-600"}`}
                                          title={u.ativo ? "Desativar" : "Ativar"}
                                          onClick={() => handleToggleUnidade(u)}
                                          disabled={isUnidLoading}>
                                          {u.ativo ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog — Órgão */}
      <Dialog open={orgaoForm.aberto} onOpenChange={(open) => !open && fecharOrgaoForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {orgaoForm.modo === "criar" ? "Novo Órgão / Secretaria" : "Editar Órgão"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="orgao-nome">Nome completo *</Label>
              <Input id="orgao-nome" placeholder="Secretaria Municipal de ..."
                value={orgaoForm.nome}
                onChange={(e) => setOrgaoForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="orgao-sigla">Sigla *</Label>
                <Input id="orgao-sigla" placeholder="SEMAD"
                  value={orgaoForm.sigla}
                  onChange={(e) => setOrgaoForm((f) => ({ ...f, sigla: e.target.value.toUpperCase() }))}
                  maxLength={30}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orgao-codigo">Código</Label>
                <Input id="orgao-codigo" placeholder="ORG-001"
                  value={orgaoForm.codigo}
                  onChange={(e) => setOrgaoForm((f) => ({ ...f, codigo: e.target.value }))}
                />
              </div>
            </div>
            {formErro && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />{formErro}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fecharOrgaoForm} disabled={salvando}>Cancelar</Button>
            <Button onClick={handleSalvarOrgao} disabled={salvando}
              className="bg-[#1351B4] hover:bg-[#0c3b8d]">
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Departamento/Unidade */}
      <Dialog open={unidadeForm.aberto} onOpenChange={(open) => !open && fecharUnidadeForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {unidadeForm.modo === "criar" ? "Novo Departamento" : "Editar Departamento"}
              {unidadeForm.nomeOrgao && (
                <span className="text-sm font-normal text-gray-500 ml-2">— {unidadeForm.nomeOrgao}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="unid-nome">Nome do departamento *</Label>
              <Input id="unid-nome" placeholder="Departamento de Patrimônio Imobiliário"
                value={unidadeForm.nome}
                onChange={(e) => setUnidadeForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="unid-sigla">Sigla</Label>
                <Input id="unid-sigla" placeholder="DPI"
                  value={unidadeForm.sigla}
                  onChange={(e) => setUnidadeForm((f) => ({ ...f, sigla: e.target.value.toUpperCase() }))}
                  maxLength={30}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unid-codigo">Código</Label>
                <Input id="unid-codigo" placeholder="UO-001-02"
                  value={unidadeForm.codigo}
                  onChange={(e) => setUnidadeForm((f) => ({ ...f, codigo: e.target.value }))}
                />
              </div>
            </div>
            {formErro && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />{formErro}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fecharUnidadeForm} disabled={salvando}>Cancelar</Button>
            <Button onClick={handleSalvarUnidade} disabled={salvando}
              className="bg-[#1351B4] hover:bg-[#0c3b8d]">
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de extinção */}
      <AlertDialog open={!!extinguirConfirm} onOpenChange={(open) => !open && setExtinguirConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Extinguir Órgão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja extinguir o órgão <strong>{extinguirConfirm?.sigla} — {extinguirConfirm?.nome}</strong>?
              <br /><br />
              A extinção registra a data de encerramento e preserva todo o histórico patrimonial.
              O órgão não poderá mais ser usado em novos cadastros, mas imóveis e documentos
              vinculados permanecem acessíveis. Esta ação pode ser revertida via "Restabelecer".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => extinguirConfirm && handleExtinguir(extinguirConfirm)}
            >
              Sim, extinguir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
