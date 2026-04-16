import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Plus, Pencil, ArrowLeft, RefreshCw, AlertCircle,
  CheckCircle2, XCircle, Scale,
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
  situacoesDominiaisApi,
  type SituacaoDominialResponse,
  type SituacaoDominialRequest,
} from "../../api/situacoes-dominiais";

interface FormState {
  aberto: boolean;
  modo: "criar" | "editar";
  id: number | null;
  nome: string;
  codigo: string;
}

const formVazio: FormState = {
  aberto: false, modo: "criar", id: null, nome: "", codigo: "",
};

export function GerenciarSituacoesDominiais() {
  const navigate = useNavigate();

  const [situacoes,    setSituacoes]    = useState<SituacaoDominialResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState<string | null>(null);
  const [acaoLoading,  setAcaoLoading]  = useState<number | null>(null);
  const [form,         setForm]         = useState<FormState>(formVazio);
  const [formErro,     setFormErro]     = useState<string | null>(null);
  const [salvando,     setSalvando]     = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    situacoesDominiaisApi.listarTodas()
      .then(setSituacoes)
      .catch(() => setErro("Não foi possível carregar as situações dominiais."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirCriar = () =>
    setForm({ aberto: true, modo: "criar", id: null, nome: "", codigo: "" });

  const abrirEditar = (s: SituacaoDominialResponse) =>
    setForm({ aberto: true, modo: "editar", id: s.id, nome: s.nome, codigo: s.codigo });

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
    if (!form.nome.trim()) { setFormErro("Nome é obrigatório."); return; }
    if (!form.codigo.trim()) { setFormErro("Código é obrigatório."); return; }

    const req: SituacaoDominialRequest = {
      nome:   form.nome.trim(),
      codigo: form.codigo.trim().toUpperCase(),
    };

    setSalvando(true);
    try {
      if (form.modo === "criar") {
        await situacoesDominiaisApi.criar(req);
      } else {
        await situacoesDominiaisApi.atualizar(form.id!, req);
      }
      fecharForm();
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (s: SituacaoDominialResponse) => {
    setAcaoLoading(s.id);
    try {
      if (s.ativo) {
        await situacoesDominiaisApi.desativar(s.id);
      } else {
        await situacoesDominiaisApi.ativar(s.id);
      }
      carregar();
    } catch (e: unknown) {
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
              {form.modo === "criar" ? "Nova Situação Dominial" : "Editar Situação Dominial"}
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
                placeholder="Ex: Em Disputa Judicial, Cedido..."
                value={form.nome}
                onChange={(e) => handleNomeChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Código <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ex: EM_DISPUTA"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              />
              <p className="text-xs text-gray-500">
                Identificador único em maiúsculas, sem espaços. Gerado automaticamente pelo nome.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={fecharForm} disabled={salvando}>Cancelar</Button>
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando
                ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                : form.modo === "criar" ? "Criar Situação" : "Salvar Alterações"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/configuracoes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Situações Dominiais</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie as situações disponíveis no cadastro de imóveis
          </p>
        </div>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirCriar}>
          <Plus className="mr-2 h-4 w-4" />Nova Situação
        </Button>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        As situações <strong>Regular</strong>, <strong>Irregular</strong>, <strong>Em Apuração</strong> e <strong>Em Litígio</strong> são os valores padrão. Você pode criar novas situações e desativar as que não forem utilizadas.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-7 w-7 animate-spin text-[#1351B4]" />
        </div>
      ) : situacoes.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <Scale className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhuma situação cadastrada.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {situacoes.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-medium">{s.nome}</TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700">
                      {s.codigo}
                    </code>
                  </TableCell>
                  <TableCell>
                    {s.ativo ? (
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
                      <Button variant="ghost" size="sm" onClick={() => abrirEditar(s)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={s.ativo ? "text-red-600 hover:text-red-700" : "text-green-700 hover:text-green-800"}
                        disabled={acaoLoading === s.id}
                        onClick={() => handleToggleAtivo(s)}
                      >
                        {acaoLoading === s.id
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : s.ativo ? "Desativar" : "Ativar"
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
