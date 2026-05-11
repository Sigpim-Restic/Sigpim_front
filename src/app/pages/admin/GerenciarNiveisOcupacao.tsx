import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Plus, Pencil, ArrowLeft, RefreshCw, AlertCircle,
  CheckCircle2, XCircle, Layers,
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
  niveisOcupacaoApi,
  type NivelOcupacaoResponse,
  type NivelOcupacaoRequest,
} from "../../api/niveis-ocupacao";

interface FormState {
  aberto: boolean;
  modo: "criar" | "editar";
  id: number | null;
  nome: string;
  codigo: string;
  descricao: string;
}

const formVazio: FormState = {
  aberto: false, modo: "criar", id: null, nome: "", codigo: "", descricao: "",
};

export function GerenciarNiveisOcupacao() {
  const navigate = useNavigate();

  const [niveis,      setNiveis]      = useState<NivelOcupacaoResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [acaoLoading, setAcaoLoading] = useState<number | null>(null);
  const [form,        setForm]        = useState<FormState>(formVazio);
  const [formErro,    setFormErro]    = useState<string | null>(null);
  const [salvando,    setSalvando]    = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    niveisOcupacaoApi.listarTodos()
      .then(setNiveis)
      .catch(() => setErro("Não foi possível carregar os níveis de ocupação."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirCriar = () =>
    setForm({ aberto: true, modo: "criar", id: null, nome: "", codigo: "", descricao: "" });

  const abrirEditar = (n: NivelOcupacaoResponse) =>
    setForm({
      aberto: true, modo: "editar", id: n.id,
      nome: n.nome, codigo: n.codigo, descricao: n.descricao ?? "",
    });

  const fecharForm = () => { setForm(formVazio); setFormErro(null); };

  const handleNomeChange = (nome: string) => {
    const codigoAuto = nome.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "");
    setForm((f) => ({
      ...f,
      nome,
      codigo: f.modo === "criar" ? codigoAuto : f.codigo,
    }));
  };

  const handleSalvar = async () => {
    setFormErro(null);
    if (!form.nome.trim())   { setFormErro("Nome é obrigatório."); return; }
    if (!form.codigo.trim()) { setFormErro("Código é obrigatório."); return; }

    const req: NivelOcupacaoRequest = {
      nome:      form.nome.trim(),
      codigo:    form.codigo.trim().toUpperCase(),
      descricao: form.descricao.trim() || undefined,
    };

    setSalvando(true);
    try {
      if (form.modo === "criar") {
        await niveisOcupacaoApi.criar(req);
      } else {
        await niveisOcupacaoApi.atualizar(form.id!, req);
      }
      fecharForm();
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (n: NivelOcupacaoResponse) => {
    setAcaoLoading(n.id);
    try {
      if (n.ativo) {
        await niveisOcupacaoApi.desativar(n.id);
      } else {
        await niveisOcupacaoApi.ativar(n.id);
      }
      carregar();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao alterar status.");
      setErro(e instanceof Error ? e.message : "Erro ao alterar status.");
    } finally {
      setAcaoLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Modal criar/editar */}
      <Dialog open={form.aberto} onOpenChange={(v) => !v && fecharForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form.modo === "criar" ? "Novo Nível de Ocupação" : "Editar Nível de Ocupação"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formErro}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label>Nome <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ex: Total, Parcial, Compartilhado..."
                value={form.nome}
                onChange={(e) => handleNomeChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Código <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ex: TOTAL"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              />
              <p className="text-xs text-gray-500">
                Identificador único em maiúsculas, sem espaços. Gerado automaticamente pelo nome.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Descrição opcional do nível de ocupação"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fecharForm} disabled={salvando}>Cancelar</Button>
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando
                ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                : form.modo === "criar" ? "Criar Nível" : "Salvar Alterações"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Voltar para configurações" onClick={() => navigate("/dashboard/configuracoes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Níveis de Ocupação</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie os níveis disponíveis no cadastro de ocupações de imóveis
          </p>
        </div>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirCriar}>
          <Plus className="mr-2 h-4 w-4" />Novo Nível
        </Button>
      </div>

      {/* Erro */}
      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Os níveis <strong>Total</strong>, <strong>Parcial</strong> e <strong>Compartilhado</strong> são
        os padrões do sistema (conforme Aba 5 do Manual Operacional v1.1). Novos níveis podem ser
        criados conforme necessidade do município.
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-7 w-7 animate-spin text-[#1351B4]" />
        </div>
      ) : niveis.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <Layers className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhum nível de ocupação cadastrado.</p>
          <button onClick={abrirCriar} className="mt-2 text-[#1351B4] text-xs hover:underline">
            Criar primeiro nível
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {niveis.map((n) => (
                <TableRow key={n.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-medium">{n.nome}</TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700">
                      {n.codigo}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{n.descricao ?? "—"}</TableCell>
                  <TableCell>
                    {n.ativo ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="mr-1 h-3 w-3" />Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <XCircle className="mr-1 h-3 w-3" />Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => abrirEditar(n)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className={n.ativo
                          ? "text-red-600 hover:text-red-700"
                          : "text-green-700 hover:text-green-800"}
                        disabled={acaoLoading === n.id}
                        onClick={() => handleToggleAtivo(n)}
                      >
                        {acaoLoading === n.id
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : n.ativo ? "Desativar" : "Ativar"
                        }
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
