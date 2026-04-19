import React, { useState, useEffect, useCallback } from "react";
import {
  Database, Search, Plus, Edit2, Check, X,
  RefreshCw, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../components/ui/dialog";
import { catalogosApi, type CatalogoItem } from "../api/catalogos";
import { usePermissoes } from "../hooks/usePermissoes";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface Dominio {
  tipo: string;
  itens: CatalogoItem[];
}

interface FormState {
  aberto: boolean;
  modo: "novo_dominio" | "novo_valor" | "editar_valor";
  item: CatalogoItem | null;
  tipoPadrao: string;
  // campos
  tipo: string;
  codigo: string;
  valor: string;
  descricao: string;
}

const formVazio: FormState = {
  aberto: false,
  modo: "novo_dominio",
  item: null,
  tipoPadrao: "",
  tipo: "",
  codigo: "",
  valor: "",
  descricao: "",
};

// Labels legíveis para os tipos conhecidos
const TIPO_LABEL: Record<string, string> = {
  TIPOLOGIA:          "Tipologias de Imóvel",
  CATEGORIA_MACRO:    "Categorias Macro",
  TIPO_DOCUMENTO:     "Tipos de Documento",
  FONTE_GEOMETRIA:    "Fontes de Geometria",
  TIPO_RELATORIO:     "Tipos de Relatório",
  ESTADO_CONSERVACAO: "Estados de Conservação",
};

const TIPO_DESC: Record<string, string> = {
  TIPOLOGIA:          "Classificação funcional do imóvel.",
  CATEGORIA_MACRO:    "Agrupamento estratégico do imóvel.",
  TIPO_DOCUMENTO:     "Classificação dos anexos e evidências.",
  FONTE_GEOMETRIA:    "Origem do dado georreferenciado.",
  TIPO_RELATORIO:     "Modelos de relatórios disponíveis.",
  ESTADO_CONSERVACAO: "Nível de conservação físico do imóvel.",
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function Catalogos() {
  const perm = usePermissoes();

  const [dominios,   setDominios]   = useState<Dominio[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [erro,       setErro]       = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());

  const [form,     setForm]     = useState<FormState>(formVazio);
  const [formErro, setFormErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [acaoId,   setAcaoId]   = useState<number | null>(null);

  // ── Carregamento ────────────────────────────────────────────────────────────

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const tipos = await catalogosApi.listarTipos();
      const resultados = await Promise.all(
        tipos.map(async (tipo) => {
          const itens = await catalogosApi.listarTodosPorTipo(tipo);
          return { tipo, itens };
        })
      );
      setDominios(resultados);
      // Expande todos por padrão na primeira carga
      setExpandidos(new Set(resultados.map((d) => d.tipo)));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar catálogos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  // ── Filtro ──────────────────────────────────────────────────────────────────

  const dominiosFiltrados = dominios.filter((d) => {
    if (!search) return true;
    const txt = search.toLowerCase();
    return (
      d.tipo.toLowerCase().includes(txt) ||
      (TIPO_LABEL[d.tipo] ?? "").toLowerCase().includes(txt) ||
      d.itens.some((i) => i.valor.toLowerCase().includes(txt) || i.codigo.toLowerCase().includes(txt))
    );
  });

  // ── Toggle expand ────────────────────────────────────────────────────────────

  const toggleExpandir = (tipo: string) => {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  };

  // ── Abrir modais ─────────────────────────────────────────────────────────────

  const abrirNovoDominio = () => {
    setForm({ ...formVazio, aberto: true, modo: "novo_dominio" });
    setFormErro(null);
  };

  const abrirNovoValor = (tipo: string) => {
    setForm({ ...formVazio, aberto: true, modo: "novo_valor", tipoPadrao: tipo, tipo });
    setFormErro(null);
  };

  const abrirEditarValor = (item: CatalogoItem) => {
    setForm({
      aberto: true,
      modo: "editar_valor",
      item,
      tipoPadrao: item.tipo,
      tipo: item.tipo,
      codigo: item.codigo,
      valor: item.valor,
      descricao: item.descricao ?? "",
    });
    setFormErro(null);
  };

  const fecharForm = () => { setForm(formVazio); setFormErro(null); };

  // ── Auto-geração de código ───────────────────────────────────────────────────

  const handleNomeChange = (nome: string, campo: "tipo" | "valor") => {
    const codigoAuto = nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "");

    if (campo === "tipo") {
      setForm((f) => ({ ...f, tipo: nome, codigo: f.modo === "novo_dominio" ? codigoAuto : f.codigo }));
    } else {
      setForm((f) => ({ ...f, valor: nome, codigo: f.modo !== "editar_valor" ? codigoAuto : f.codigo }));
    }
  };

  // ── Salvar ───────────────────────────────────────────────────────────────────

  const handleSalvar = async () => {
    setFormErro(null);

    const tipo   = form.tipo.toUpperCase().trim();
    const codigo = form.codigo.toUpperCase().trim();
    const valor  = form.valor.trim();

    if (!tipo)   { setFormErro("Tipo é obrigatório."); return; }
    if (!codigo) { setFormErro("Código é obrigatório."); return; }
    if (!valor)  { setFormErro("Valor (label) é obrigatório."); return; }

    setSalvando(true);
    try {
      if (form.modo === "editar_valor" && form.item) {
        await catalogosApi.atualizar(form.item.id, {
          tipo, codigo, valor, descricao: form.descricao || undefined,
        });
      } else {
        await catalogosApi.criar({
          tipo, codigo, valor, descricao: form.descricao || undefined,
        });
      }
      fecharForm();
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  // ── Toggle ativo/inativo ─────────────────────────────────────────────────────

  const handleToggleAtivo = async (item: CatalogoItem) => {
    setAcaoId(item.id);
    try {
      if (item.ativo) {
        await catalogosApi.desativar(item.id);
      } else {
        await catalogosApi.ativar(item.id);
      }
      carregar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao alterar status.");
    } finally {
      setAcaoId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* Modal criar/editar */}
      <Dialog open={form.aberto} onOpenChange={(v) => !v && fecharForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form.modo === "novo_dominio" && "Novo Domínio"}
              {form.modo === "novo_valor"   && `Novo Valor — ${TIPO_LABEL[form.tipoPadrao] ?? form.tipoPadrao}`}
              {form.modo === "editar_valor" && `Editar Valor — ${TIPO_LABEL[form.tipoPadrao] ?? form.tipoPadrao}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {formErro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formErro}</span>
              </div>
            )}

            {/* Tipo — só exibido no modo "novo_dominio" */}
            {form.modo === "novo_dominio" && (
              <div className="space-y-2">
                <Label>Nome do domínio <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ex: Tipos de Uso, Status de Obra..."
                  value={form.tipo}
                  onChange={(e) => handleNomeChange(e.target.value, "tipo")}
                />
                <p className="text-xs text-gray-400">
                  Código gerado automaticamente: <code className="font-mono">{form.codigo || "—"}</code>
                </p>
              </div>
            )}

            {/* Valor */}
            <div className="space-y-2">
              <Label>
                {form.modo === "novo_dominio" ? "Primeiro valor" : "Valor (label)"}
                <span className="text-red-500"> *</span>
              </Label>
              <Input
                placeholder="Ex: Em Obra, Concluído..."
                value={form.valor}
                onChange={(e) => handleNomeChange(e.target.value, "valor")}
              />
              {form.modo !== "editar_valor" && (
                <p className="text-xs text-gray-400">
                  Código gerado: <code className="font-mono">{form.codigo || "—"}</code>
                </p>
              )}
            </div>

            {/* Código — editável manualmente */}
            <div className="space-y-2">
              <Label>Código <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Ex: EM_OBRA"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase().replace(/\s/g, "_") }))}
                disabled={form.modo === "editar_valor"}
                className={form.modo === "editar_valor" ? "bg-gray-50 text-gray-400" : ""}
              />
              {form.modo === "editar_valor" && (
                <p className="text-xs text-gray-400">O código não pode ser alterado após a criação.</p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição <span className="text-gray-400 text-xs">(opcional)</span></Label>
              <Input
                placeholder="Descrição complementar..."
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
                : form.modo === "editar_valor" ? "Salvar alterações" : "Criar"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <p className="text-sm text-gray-500">
        Catálogos administrativos — valores configuráveis pelos administradores do sistema
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar domínio ou valor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {perm.canManageCatalogo && (
          <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirNovoDominio}>
            <Plus className="mr-2 h-4 w-4" />Novo Domínio
          </Button>
        )}
      </div>

      {/* Erro global */}
      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-7 w-7 animate-spin text-[#1351B4]" />
        </div>
      )}

      {/* Grid de domínios */}
      {!loading && (
        <div className="grid gap-5 lg:grid-cols-2">
          {dominiosFiltrados.map((d) => {
            const expandido = expandidos.has(d.tipo);
            const ativos   = d.itens.filter((i) => i.ativo !== false);
            const inativos = d.itens.filter((i) => i.ativo === false);

            return (
              <Card key={d.tipo} className="overflow-hidden">
                <CardHeader className="bg-gray-50 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => toggleExpandir(d.tipo)}
                      className="flex items-center gap-2 text-left group"
                    >
                      <Database className="h-4 w-4 text-[#1351B4] shrink-0" />
                      <div>
                        <CardTitle className="text-sm font-semibold text-gray-900 group-hover:text-[#1351B4] transition-colors">
                          {TIPO_LABEL[d.tipo] ?? d.tipo}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {TIPO_DESC[d.tipo] ?? "Domínio configurável."}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="font-mono text-xs">{d.tipo}</Badge>
                      <button onClick={() => toggleExpandir(d.tipo)} className="text-gray-400 hover:text-gray-600">
                        {expandido
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>
                </CardHeader>

                {expandido && (
                  <CardContent className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {/* Itens ativos */}
                      {ativos.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-[#1351B4] hover:bg-blue-50 transition-colors group"
                          title={item.descricao ?? item.codigo}
                        >
                          <Check className="h-3 w-3 text-green-500 shrink-0" />
                          {item.valor}
                          {perm.canManageCatalogo && (
                            <div className="ml-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => abrirEditarValor(item)}
                                title="Editar"
                                className="p-0.5 rounded hover:bg-blue-100"
                              >
                                <Edit2 className="h-2.5 w-2.5 text-[#1351B4]" />
                              </button>
                              <button
                                onClick={() => handleToggleAtivo(item)}
                                title="Desativar"
                                disabled={acaoId === item.id}
                                className="p-0.5 rounded hover:bg-red-100"
                              >
                                {acaoId === item.id
                                  ? <RefreshCw className="h-2.5 w-2.5 animate-spin text-gray-400" />
                                  : <X className="h-2.5 w-2.5 text-red-500" />
                                }
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Itens inativos */}
                      {inativos.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-1 rounded-md border border-dashed border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-400 group"
                          title={`Inativo — ${item.codigo}`}
                        >
                          <X className="h-3 w-3 text-gray-300 shrink-0" />
                          <span className="line-through">{item.valor}</span>
                          {perm.canManageCatalogo && (
                            <button
                              onClick={() => handleToggleAtivo(item)}
                              title="Reativar"
                              disabled={acaoId === item.id}
                              className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-100"
                            >
                              {acaoId === item.id
                                ? <RefreshCw className="h-2.5 w-2.5 animate-spin text-gray-400" />
                                : <Check className="h-2.5 w-2.5 text-green-600" />
                              }
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Botão Adicionar */}
                      {perm.canManageCatalogo && (
                        <button
                          onClick={() => abrirNovoValor(d.tipo)}
                          className="flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-400 hover:border-[#1351B4] hover:text-[#1351B4] transition-colors"
                        >
                          <Plus className="h-3 w-3" />Adicionar
                        </button>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-gray-400">
                      {ativos.length} valor(es) ativo(s)
                      {inativos.length > 0 && ` · ${inativos.length} inativo(s)`}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {!loading && dominiosFiltrados.length === 0 && !erro && (
            <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
              <Database className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="font-medium">
                {search ? "Nenhum domínio corresponde à busca." : "Nenhum catálogo cadastrado."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}