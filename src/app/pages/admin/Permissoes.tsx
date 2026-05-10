import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Shield, AlertTriangle, Loader2,
  AlertCircle, RotateCcw, Save, Info,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { AlertBox } from "../../components/layout/States";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  permissoesApi,
  type PermissoesUsuarioResponse,
  type PermissaoAcaoResponse,
  type PermissaoItem,
} from "../../api/permissoes";
import type { PerfilUsuario } from "../../api/usuarios";

const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  ADMINISTRADOR_SISTEMA:     "Adm. Sistema",
  ADMINISTRADOR_PATRIMONIAL: "Adm. Patrimonial",
  CADASTRADOR_SETORIAL:      "Cadastrador Setorial",
  VALIDADOR_DOCUMENTAL:      "Validador Documental",
  VISTORIADOR:               "Vistoriador",
  PLANEJAMENTO:              "Planejamento",
  AUDITOR:                   "Auditor",
};

const MODULOS_META: Record<string, { nome: string; descricao: string; critical?: boolean }> = {
  dashboard:     { nome: "Painel Geral",      descricao: "Visualização de estatísticas e indicadores" },
  imoveis:       { nome: "Gestão de Imóveis", descricao: "Cadastro, edição e consulta de imóveis" },
  pendencias:    { nome: "Pendências",         descricao: "Gestão de pendências e validações" },
  gis:           { nome: "Mapa GIS",           descricao: "Visualização georreferenciada" },
  relatorios:    { nome: "Relatórios",          descricao: "Geração e exportação de relatórios" },
  usuarios:      { nome: "Usuários e Perfis",  descricao: "Gestão de usuários do sistema",   critical: true },
  auditoria:     { nome: "Auditoria",           descricao: "Logs e rastreamento de ações",    critical: true },
  configuracoes: { nome: "Configurações",       descricao: "Configurações gerais do sistema", critical: true },
};

const ACOES: { id: "visualizar" | "criar" | "editar" | "excluir"; nome: string }[] = [
  { id: "visualizar", nome: "Visualizar" },
  { id: "criar",      nome: "Criar" },
  { id: "editar",     nome: "Editar" },
  { id: "excluir",    nome: "Excluir" },
];

type PendingMap = Record<string, boolean>;

interface CelulaProps {
  acao: PermissaoAcaoResponse;
  moduloId: string;
  acaoId: string;
  pendente: boolean | null;
  onChange: (modulo: string, acao: string, conceder: boolean) => void;
}

function CelulaPermissao({ acao, moduloId, acaoId, pendente, onChange }: CelulaProps) {
  const CheckIcon = () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
  const XIcon = () => (
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="3" x2="9" y2="9" /><line x1="9" y1="3" x2="3" y2="9" />
    </svg>
  );

  // Perfil base — não editável
  if (acao.doPerfil && pendente === null) {
    return (
      <div className="flex justify-center" title="Permissão do perfil — não editável">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 cursor-default">
          <CheckIcon />
        </span>
      </div>
    );
  }

  // Grant extra existente — clique para revogar
  if (acao.grantExtra && pendente === null) {
    const tooltip = `Grant extra — concedido por ${acao.concedidaPor ?? "admin"}${
      acao.concedidaEm ? ` em ${new Date(acao.concedidaEm).toLocaleDateString("pt-BR")}` : ""
    }\nClique para revogar`;
    return (
      <div className="flex justify-center">
        <button onClick={() => onChange(moduloId, acaoId, false)} title={tooltip}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[#1351B4] border-2 border-[#1351B4] hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors">
          <CheckIcon />
        </button>
      </div>
    );
  }

  // Pendente conceder
  if (pendente === true) {
    return (
      <div className="flex justify-center">
        <button onClick={() => onChange(moduloId, acaoId, false)} title="Clique para cancelar"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 border-2 border-amber-400 hover:bg-gray-100 hover:border-gray-300 transition-colors animate-pulse">
          <CheckIcon />
        </button>
      </div>
    );
  }

  // Pendente revogar
  if (pendente === false && acao.grantExtra) {
    return (
      <div className="flex justify-center">
        <button onClick={() => onChange(moduloId, acaoId, true)} title="Clique para cancelar a revogação"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 border-2 border-red-400 hover:bg-blue-100 hover:border-[#1351B4] transition-colors">
          <XIcon />
        </button>
      </div>
    );
  }

  // Sem permissão — clique para conceder
  return (
    <div className="flex justify-center">
      <button onClick={() => onChange(moduloId, acaoId, true)} title="Clique para conceder"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-300 border border-gray-200 hover:bg-blue-50 hover:border-[#1351B4] hover:text-[#1351B4] transition-colors">
        <XIcon />
      </button>
    </div>
  );
}

export function Permissoes() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const [dados,        setDados]        = useState<PermissoesUsuarioResponse | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [salvando,     setSalvando]     = useState(false);
  const [erro,         setErro]         = useState<string | null>(null);
  const [pending,      setPending]      = useState<PendingMap>({});
  const [confirmReset, setConfirmReset] = useState(false);

  const temMudancas = Object.keys(pending).length > 0;

  const carregar = useCallback(() => {
    if (!id) { setErro("ID não informado."); setLoading(false); return; }
    setLoading(true);
    setErro(null);
    permissoesApi.buscar(Number(id))
      .then((d) => { setDados(d); setPending({}); })
      .catch((e) => setErro(e?.message ?? "Erro ao carregar permissões."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleCelulaChange = (modulo: string, acao: string, conceder: boolean) => {
    const chave = `${modulo}:${acao}`;
    const moduloDados  = dados?.modulos.find((m) => m.modulo === modulo);
    const acaoDados    = moduloDados?.[acao as keyof typeof moduloDados] as PermissaoAcaoResponse | undefined;
    const estadoOriginal = acaoDados?.concedida ?? false;

    setPending((prev) => {
      const next = { ...prev };
      if (conceder === estadoOriginal) delete next[chave];
      else next[chave] = conceder;
      return next;
    });
  };

  const handleSalvar = async () => {
    if (!id || !temMudancas) return;
    setSalvando(true);
    setErro(null);

    const conceder: PermissaoItem[] = [];
    const revogar:  PermissaoItem[] = [];
    for (const [chave, flag] of Object.entries(pending)) {
      const [modulo, acao] = chave.split(":");
      if (flag) conceder.push({ modulo, acao });
      else      revogar.push({ modulo, acao });
    }

    try {
      const novo = await permissoesApi.salvar(Number(id), { conceder, revogar });
      setDados(novo);
      setPending({});
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao salvar permissões.");
    } finally {
      setSalvando(false);
    }
  };

  const handleReset = async () => {
    if (!id) return;
    setConfirmReset(false);
    setSalvando(true);
    try {
      const novo = await permissoesApi.resetar(Number(id));
      setDados(novo);
      setPending({});
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao resetar permissões.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
      </div>
    );
  }

  if (erro && !dados) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/usuarios")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{erro}</span>
        </div>
      </div>
    );
  }

  if (!dados) return null;

  const perfilLabel    = dados.perfil ? (PERFIL_LABELS[dados.perfil] ?? dados.perfil) : null;
  const ehAdmin        = dados.perfil?.startsWith("ADMINISTRADOR");
  const temGrantsExtras = dados.modulos.some((m) =>
    ACOES.some((a) => (m[a.id as keyof typeof m] as PermissaoAcaoResponse).grantExtra)
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Resetar permissões extras</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Todos os grants extras de <strong>{dados.nomeCompleto}</strong> serão removidos.
            O usuário voltará às permissões padrão do perfil <strong>{perfilLabel ?? "sem perfil"}</strong>.
            Esta ação é registrada na auditoria.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReset(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReset} disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/usuarios")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">Gerenciar Permissões</h2>
          <p className="text-sm text-gray-600">
            Usuário: <span className="font-medium">{dados.nomeCompleto}</span>
            {perfilLabel && (
              <>{" • "}<Badge className={ehAdmin ? "bg-[#1351B4]" : "bg-gray-500"}>{perfilLabel}</Badge></>
            )}
          </p>
        </div>
      </div>

      <AlertBox variant="warning" title="Atenção — Módulos Críticos">
        <p>
          Os módulos marcados com <AlertTriangle className="inline h-4 w-4 text-yellow-600" />{" "}
          afetam a segurança e governança do sistema.
        </p>
      </AlertBox>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{erro}</span>
        </div>
      )}

      {temMudancas && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            Você tem <strong>{Object.keys(pending).length}</strong> alteração(ões) não salva(s).
          </span>
          <Button variant="outline" size="sm"
            className="text-amber-700 border-amber-400 hover:bg-amber-100"
            onClick={() => setPending({})}>
            Descartar
          </Button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">Módulo</span>
                  </div>
                </th>
                {ACOES.map((a) => (
                  <th key={a.id} className="px-4 py-4 text-center font-semibold text-gray-900">{a.nome}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dados.modulos.map((modulo, index) => {
                const meta = MODULOS_META[modulo.modulo] ?? { nome: modulo.modulo, descricao: "" };
                return (
                  <tr key={modulo.modulo} className={[
                    "border-b border-gray-100 transition-colors",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                    meta.critical ? "bg-yellow-50/20" : "",
                  ].join(" ")}>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        {meta.critical && <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />}
                        <div>
                          <p className="font-medium text-gray-900">{meta.nome}</p>
                          <p className="text-xs text-gray-500">{meta.descricao}</p>
                        </div>
                      </div>
                    </td>
                    {ACOES.map((acao) => {
                      const acaoDados = modulo[acao.id as keyof typeof modulo] as PermissaoAcaoResponse;
                      const chave     = `${modulo.modulo}:${acao.id}`;
                      const pendente  = chave in pending ? pending[chave] : null;
                      return (
                        <td key={acao.id} className="px-4 py-4">
                          <CelulaPermissao
                            acao={acaoDados}
                            moduloId={modulo.modulo}
                            acaoId={acao.id}
                            pendente={pendente}
                            onChange={handleCelulaChange}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">✓</span>
          Do perfil — não editável
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[#1351B4] border-2 border-[#1351B4]">✓</span>
          Grant extra — clique para revogar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-300 border border-gray-200">✕</span>
          Sem permissão — clique para conceder
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 border-2 border-amber-400">✓</span>
          Pendente (não salvo)
        </span>
      </div>

      {/* Ações */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <div>
          {temGrantsExtras && (
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => setConfirmReset(true)} disabled={salvando}>
              <RotateCcw className="mr-2 h-4 w-4" />Resetar para o perfil
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard/usuarios")}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={!temMudancas || salvando}
            className="bg-[#1351B4] hover:bg-[#0c3b8d] disabled:opacity-50">
            {salvando
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
              : <><Save className="mr-2 h-4 w-4" />Salvar Permissões</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}