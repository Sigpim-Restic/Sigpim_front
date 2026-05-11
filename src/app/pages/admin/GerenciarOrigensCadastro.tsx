import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Plus, Pencil, ArrowLeft, RefreshCw, AlertCircle,
  CheckCircle2, XCircle, MapPin,
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
  origensCadastroApi,
  type OrigemCadastroResponse,
  type OrigemCadastroRequest,
} from "../../api/origens-cadastro";

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

export function GerenciarOrigensCadastro() {
  const navigate = useNavigate();

  const [origens,     setOrigens]     = useState<OrigemCadastroResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [acaoLoading, setAcaoLoading] = useState<number | null>(null);
  const [form,        setForm]        = useState<FormState>(formVazio);
  const [formErro,    setFormErro]    = useState<string | null>(null);
  const [salvando,    setSalvando]    = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    origensCadastroApi.listarTodas()
      .then(setOrigens)
      .catch(() => setErro("Não foi possível carregar as origens de cadastro."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirCriar = () =>
    setForm({ aberto: true, modo: "criar", id: null, nome: "", codigo: "" });

  const abrirEditar = (o: OrigemCadastroResponse) =>
    setForm({ aberto: true, modo: "editar", id: o.id, nome: o.nome, codigo: o.codigo });

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

    const req: OrigemCadastroRequest = {
      nome:   form.nome.trim(),
      codigo: form.codigo.trim().toUpperCase(),
    };

    setSalvando(true);
    try {
      if (form.modo === "criar") {
        await origensCadastroApi.criar(req);
      } else {
        await origensCadastroApi.atualizar(form.id!, req);
      }
      fecharForm();
      carregar();
      toast.success("Salvo com sucesso.");
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar.");
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (o: OrigemCadastroResponse) => {
    setAcaoLoading(o.id);
    try {
      if (o.ativo) {
        await origensCadastroApi.desativar(o.id);
      } else {
        await origensCadastroApi.ativar(o.id);
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

      <Dialog open={form.aberto} onOpenChange={(v) => !v && fecharForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form.modo === "criar" ? "Nova Origem de Cadastro" : "Editar Origem de Cadastro"}
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
                placeholder="Ex: Inventário Patrimonial, Transferência..."
                value={form.nome}
                onChange={(e) => handleNomeChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Código <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ex: INVENTARIO_PATRIMONIAL"
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
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleSalvar} disabled={salvando}>
              {salvando
                ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                : form.modo === "criar" ? "Criar Origem" : "Salvar Alterações"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/configuracoes")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Origens de Cadastro</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie as origens disponíveis no cadastro de imóveis</p>
        </div>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirCriar}>
          <Plus className="mr-2 h-4 w-4" />Nova Origem
        </Button>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>Tentar novamente</Button>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        As origens padrão são <strong>Levantamento em campo</strong>, <strong>Demanda de secretaria</strong>, <strong>Processo administrativo</strong>, <strong>Importação de planilha</strong>, <strong>Denúncia / ocorrência</strong> e <strong>Outro</strong>. Você pode criar novas origens e desativar as que não forem utilizadas.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-7 w-7 animate-spin text-[#1351B4]" />
        </div>
      ) : origens.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhuma origem cadastrada.</p>
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
              {origens.map((o) => (
                <TableRow key={o.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-medium">{o.nome}</TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700">{o.codigo}</code>
                  </TableCell>
                  <TableCell>
                    {o.ativo ? (
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
                      <Button variant="ghost" size="sm" onClick={() => abrirEditar(o)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className={o.ativo ? "text-red-600 hover:text-red-700" : "text-green-700 hover:text-green-800"}
                        disabled={acaoLoading === o.id}
                        onClick={() => handleToggleAtivo(o)}
                      >
                        {acaoLoading === o.id
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : o.ativo ? "Desativar" : "Ativar"
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