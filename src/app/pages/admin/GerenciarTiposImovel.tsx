import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Plus, Pencil, ArrowLeft, RefreshCw, AlertCircle,
  CheckCircle2, XCircle, Tag,
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
  tiposImovelApi,
  type TipoImovelResponse,
  type TipoImovelRequest,
} from "../../api/tipos-imovel-alertas";

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

export function GerenciarTiposImovel() {
  const navigate = useNavigate();

  const [tipos,       setTipos]       = useState<TipoImovelResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [acaoLoading, setAcaoLoading] = useState<number | null>(null);
  const [form,        setForm]        = useState<FormState>(formVazio);
  const [formErro,    setFormErro]    = useState<string | null>(null);
  const [salvando,    setSalvando]    = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    tiposImovelApi.listarTodos()
      .then(setTipos)
      .catch(() => setErro("Não foi possível carregar os tipos de imóvel."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirCriar = () =>
    setForm({ aberto: true, modo: "criar", id: null, nome: "", codigo: "" });

  const abrirEditar = (t: TipoImovelResponse) =>
    setForm({ aberto: true, modo: "editar", id: t.id, nome: t.nome, codigo: t.codigo });

  const fecharForm = () => { setForm(formVazio); setFormErro(null); };

  // Auto-generate codigo from nome while user types (only on create)
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

    const req: TipoImovelRequest = {
      nome:   form.nome.trim(),
      codigo: form.codigo.trim().toUpperCase(),
    };

    setSalvando(true);
    try {
      if (form.modo === "criar") {
        await tiposImovelApi.criar(req);
      } else {
        await tiposImovelApi.atualizar(form.id!, req);
      }
      fecharForm();
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleAtivo = async (t: TipoImovelResponse) => {
    setAcaoLoading(t.id);
    try {
      if (t.ativo) {
        await tiposImovelApi.desativar(t.id);
      } else {
        await tiposImovelApi.ativar(t.id);
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
              {form.modo === "criar" ? "Novo Tipo de Imóvel" : "Editar Tipo de Imóvel"}
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
                placeholder="Ex: Cedido, Em Comodato..."
                value={form.nome}
                onChange={(e) => handleNomeChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Código <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ex: CEDIDO"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              />
              <p className="text-xs text-gray-500">
                Identificador único em maiúsculas, sem espaços. Gerado automaticamente pelo nome.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={fecharForm} disabled={salvando}>
              Cancelar
            </Button>
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando
                ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                : form.modo === "criar" ? "Criar Tipo" : "Salvar Alterações"
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
          <h1 className="text-xl font-semibold text-gray-900">Tipos de Imóvel</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie os tipos disponíveis no cadastro de imóveis
          </p>
        </div>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirCriar}>
          <Plus className="mr-2 h-4 w-4" />Novo Tipo
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

      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Os tipos <strong>Próprio</strong>, <strong>Locado</strong> e <strong>Incerto</strong> são os tipos padrão do sistema. Você pode criar novos tipos e desativar os que não forem utilizados.
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-7 w-7 animate-spin text-[#1351B4]" />
        </div>
      ) : tipos.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <Tag className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">Nenhum tipo cadastrado.</p>
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
              {tipos.map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-medium">{t.nome}</TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-700">
                      {t.codigo}
                    </code>
                  </TableCell>
                  <TableCell>
                    {t.ativo ? (
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirEditar(t)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={t.ativo ? "text-red-600 hover:text-red-700" : "text-green-700 hover:text-green-800"}
                        disabled={acaoLoading === t.id}
                        onClick={() => handleToggleAtivo(t)}
                      >
                        {acaoLoading === t.id
                          ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          : t.ativo ? "Desativar" : "Ativar"
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
