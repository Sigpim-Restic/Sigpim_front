import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus, Search, MoreVertical, Shield,
  UserCheck, UserX, Loader2, AlertCircle, RefreshCw,
  Clock, Trash2, RotateCcw, ShieldOff, KeyRound,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  usuariosApi, type UsuarioResponse, type PerfilUsuario,
} from "../../api/usuarios";
import { usePermissoes } from "../../hooks/usePermissoes";
import { useAuth } from "../../contexts/AuthContext";
import { ModalResetSenha } from "./ModalResetSenha";

const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  ADMINISTRADOR_SISTEMA:     "Admin. Sistema",
  ADMINISTRADOR_PATRIMONIAL: "Admin. Patrimonial",
  CADASTRADOR_SETORIAL:      "Cadastrador",
  VALIDADOR_DOCUMENTAL:      "Validador Documental",
  VISTORIADOR:               "Vistoriador",
  PLANEJAMENTO:              "Planejamento",
  AUDITOR:                   "Auditor",
};

const TODOS_PERFIS = Object.entries(PERFIL_LABELS) as [PerfilUsuario, string][];

interface ConfirmacaoState {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  variante: "default" | "destrutivo";
  onConfirmar: () => Promise<void>;
}

interface DefinirPerfilState {
  aberto: boolean;
  usuario: UsuarioResponse | null;
  perfilSelecionado: PerfilUsuario | "";
}

export function ListaUsuarios() {
  const navigate  = useNavigate();
  const perm      = usePermissoes();
  const { usuario: usuarioLogado } = useAuth();
  const ehAdminSistema = usuarioLogado?.perfil === "ADMINISTRADOR_SISTEMA";

  const [usuarios,     setUsuarios]     = useState<UsuarioResponse[]>([]);
  const [inativos,     setInativos]     = useState<UsuarioResponse[]>([]);
  const [deletados,    setDeletados]    = useState<UsuarioResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [erro,         setErro]         = useState<string | null>(null);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterPerfil, setFilterPerfil] = useState("todos");
  const [acaoLoading,  setAcaoLoading]  = useState<number | null>(null);

  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState>({
    aberto: false, titulo: "", mensagem: "",
    variante: "default", onConfirmar: async () => {},
  });

  const [definirPerfil, setDefinirPerfil] = useState<DefinirPerfilState>({
    aberto: false, usuario: null, perfilSelecionado: "",
  });

  // Estado do modal de reset de senha
  const [resetSenha, setResetSenha] = useState<{ id: number; nome: string } | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setErro(null);
    Promise.all([
      usuariosApi.listar(),
      usuariosApi.listarInativos(),
      usuariosApi.listarDeletados(),
    ])
      .then(([todos, pendentes, excluidos]) => {
        setUsuarios(todos.filter((u) => u.ativo));
        setInativos(pendentes);
        setDeletados(excluidos);
      })
      .catch((e) => setErro(e.message ?? "Erro ao carregar usuários."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const executarAcao = async (idUsuario: number, acao: () => Promise<void>) => {
    setAcaoLoading(idUsuario);
    try { await acao(); carregar(); }
    catch (e: unknown) { setErro((e as Error).message ?? "Erro ao executar ação."); }
    finally { setAcaoLoading(null); }
  };

  const confirmar = (cfg: Omit<ConfirmacaoState, "aberto">) =>
    setConfirmacao({ ...cfg, aberto: true });

  const fecharConfirmacao = () =>
    setConfirmacao((c) => ({ ...c, aberto: false }));

  const handleAtivar = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Ativar usuário",
      mensagem:  `Deseja ativar "${u.nomeCompleto}"? Ele terá acesso ao sistema.`,
      variante:  "default",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.ativar(u.id)),
    });
  };

  const handleDesativarNormal = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Desativar usuário",
      mensagem:  `Deseja desativar "${u.nomeCompleto}"? O acesso será bloqueado.`,
      variante:  "destrutivo",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.desativar(u.id)),
    });
  };

  const handleExcluir = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Excluir usuário",
      mensagem:  `Tem certeza que deseja excluir "${u.nomeCompleto}"? O usuário será movido para a lixeira.`,
      variante:  "destrutivo",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.excluir(u.id)),
    });
  };

  // Carregar pendentes de voto ao montar
  useEffect(() => {
    desativacaoAdminApi.listarPendentes()
      .then(setPendentesVoto)
      .catch(() => {});
  }, []);

  const handleDesativarAdmin = async (u: UsuarioResponse) => {
    setModalDesativacaoAdmin({ aberto: true, usuario: u, solicitacaoExistente: null, carregando: true });
    try {
      const res = await desativacaoAdminApi.buscarParaAlvo(u.id);
      setModalDesativacaoAdmin((prev) => ({
        ...prev, carregando: false,
        solicitacaoExistente: res.solicitacao ?? null,
      }));
    } catch {
      setModalDesativacaoAdmin((prev) => ({ ...prev, carregando: false }));
    }
  };

  const handleSolicitarDesativacaoAdmin = async (idAlvo: number) => {
    try {
      const res = await desativacaoAdminApi.solicitar(idAlvo);
      setModalDesativacaoAdmin((prev) => ({ ...prev, solicitacaoExistente: res }));
      setPendentesVoto((prev) => prev.filter((p) => p.idAlvo !== idAlvo));
      toast.success("Solicitação enviada. Aguardando aprovação dos demais administradores.");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Erro ao solicitar desativação.");
    }
  };

  const handleVotarDesativacaoAdmin = async (idSolicitacao: number, aprovar: boolean) => {
    try {
      await desativacaoAdminApi.votar(idSolicitacao, aprovar);
      setPendentesVoto((prev) => prev.filter((p) => p.idSolicitacao !== idSolicitacao));
      await carregar();
      toast.success(aprovar ? "Voto de aprovação registrado." : "Solicitação rejeitada.");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Erro ao votar.");
    }
  };

  const handleDesativar = (u: UsuarioResponse) => {
    if (u.perfil === "ADMINISTRADOR_SISTEMA") {
      handleDesativarAdmin(u);
      return;
    }
    handleDesativarNormal(u);
  };

  const handleReativar = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Reativar usuário",
      mensagem:  `Deseja reativar "${u.nomeCompleto}"? A conta voltará para "Aguardando Ativação".`,
      variante:  "default",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.reativar(u.id)),
    });
  };

  const handleExcluirPermanente = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "⚠️ Exclusão permanente",
      mensagem:  `Esta ação é IRREVERSÍVEL. O usuário "${u.nomeCompleto}" será removido definitivamente. Deseja continuar?`,
      variante:  "destrutivo",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.excluirPermanentemente(u.id)),
    });
  };

  const handleResetarMfa = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Resetar MFA",
      mensagem:  `O MFA de "${u.nomeCompleto}" será desativado. O usuário precisará reconfigurar o app autenticador no próximo login.`,
      variante:  "destrutivo",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.resetarMfa(u.id)),
    });
  };

  const abrirDefinirPerfil = (u: UsuarioResponse) =>
    setDefinirPerfil({ aberto: true, usuario: u, perfilSelecionado: u.perfil ?? "" });

  const handleSalvarPerfil = async () => {
    if (!definirPerfil.usuario || !definirPerfil.perfilSelecionado) return;
    const { usuario, perfilSelecionado } = definirPerfil;
    setDefinirPerfil((s) => ({ ...s, aberto: false }));
    await executarAcao(usuario.id, () =>
      usuariosApi.definirPerfil(usuario.id, perfilSelecionado as PerfilUsuario)
    );
  };

  const filtradosAtivos = usuarios.filter((u) => {
    const matchSearch = u.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPerfil = filterPerfil === "todos" || u.perfil === filterPerfil;
    return matchSearch && matchPerfil;
  });

  return (
    <div className="space-y-6">

      {/* Modal de confirmação */}
      <Dialog open={confirmacao.aberto} onOpenChange={(v) => !v && fecharConfirmacao()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{confirmacao.titulo}</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">{confirmacao.mensagem}</p>
          <DialogFooter>
            <Button variant="outline" onClick={fecharConfirmacao}>Cancelar</Button>
            <Button
              variant={confirmacao.variante === "destrutivo" ? "destructive" : "default"}
              className={confirmacao.variante === "default" ? "bg-[#1351B4] hover:bg-[#0c3b8d]" : ""}
              onClick={async () => { fecharConfirmacao(); await confirmacao.onConfirmar(); }}
            >Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de definir perfil */}
      <Dialog
        open={definirPerfil.aberto}
        onOpenChange={(v) => !v && setDefinirPerfil((s) => ({ ...s, aberto: false }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Definir Perfil de Acesso</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-gray-600">
              Usuário: <span className="font-medium">{definirPerfil.usuario?.nomeCompleto}</span>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Perfil</label>
              <Select
                value={definirPerfil.perfilSelecionado}
                onValueChange={(v) => setDefinirPerfil((s) => ({ ...s, perfilSelecionado: v as PerfilUsuario }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {TODOS_PERFIS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDefinirPerfil((s) => ({ ...s, aberto: false }))}>
              Cancelar
            </Button>
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              disabled={!definirPerfil.perfilSelecionado}
              onClick={handleSalvarPerfil}
            >
              Salvar Perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de reset de senha */}
      {resetSenha && (
        <ModalResetSenha
          idUsuario={resetSenha.id}
          nomeUsuario={resetSenha.nome}
          aberto={!!resetSenha}
          onFechar={() => setResetSenha(null)}
        />
      )}


      {/* ── Modal de desativação de ADMIN_SISTEMA ── */}
      {modalDesativacaoAdmin.aberto && modalDesativacaoAdmin.usuario && (
        <Dialog open onOpenChange={() => setModalDesativacaoAdmin(
          { aberto: false, usuario: null, solicitacaoExistente: null, carregando: false })}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-700">
                <Vote className="h-5 w-5" />
                Desativar Administrador do Sistema
              </DialogTitle>
            </DialogHeader>

            {modalDesativacaoAdmin.carregando ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : modalDesativacaoAdmin.solicitacaoExistente ? (
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <p className="font-semibold mb-1">Solicitação em andamento</p>
                  <p>Aguardando votos dos demais administradores para desativar{" "}
                    <strong>{modalDesativacaoAdmin.usuario.nomeCompleto}</strong>.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Votos</p>
                  {modalDesativacaoAdmin.solicitacaoExistente.votos.map((v) => (
                    <div key={v.idVotante}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                      <span className="text-gray-800">{v.nomeVotante}</span>
                      {v.aprovado
                        ? <span className="flex items-center gap-1 text-green-700 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />Aprovou
                          </span>
                        : <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                            <XCircle className="h-3.5 w-3.5" />Rejeitou
                          </span>}
                    </div>
                  ))}
                  {modalDesativacaoAdmin.solicitacaoExistente.totalPendentes > 0 && (
                    <p className="text-xs text-gray-400 text-center">
                      {modalDesativacaoAdmin.solicitacaoExistente.totalPendentes} voto(s) pendente(s)
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800">
                  <p className="font-semibold mb-1">Aprovação coletiva necessária</p>
                  <p>Para desativar <strong>{modalDesativacaoAdmin.usuario.nomeCompleto}</strong>,
                    todos os demais Administradores do Sistema devem aprovar a solicitação.
                    Um único voto de rejeição cancela o processo.</p>
                </div>
                <p className="text-xs text-gray-500">
                  Sua aprovação será registrada automaticamente ao criar a solicitação.
                </p>
                <DialogFooter>
                  <Button variant="outline"
                    onClick={() => setModalDesativacaoAdmin(
                      { aberto: false, usuario: null, solicitacaoExistente: null, carregando: false })}>
                    Cancelar
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700"
                    onClick={() => handleSolicitarDesativacaoAdmin(modalDesativacaoAdmin.usuario!.id)}>
                    <Vote className="mr-2 h-4 w-4" />
                    Iniciar Votação
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Banner de votos pendentes */}
      {pendentesVoto.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 mb-4">
          <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Vote className="h-4 w-4" />
            {pendentesVoto.length} solicitação(ões) de desativação aguardando seu voto
          </p>
          {pendentesVoto.map((s) => (
            <div key={s.idSolicitacao}
              className="flex items-center justify-between rounded-md bg-white border border-amber-200 px-3 py-2 mb-1.5 text-sm">
              <div>
                <p className="font-medium text-gray-800">{s.nomeAlvo}</p>
                <p className="text-xs text-gray-500">
                  Solicitado por {s.nomeSolicitante} · {s.totalAprovacoes}/{s.totalAdminsNecessarios} aprovações
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"
                  className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => handleVotarDesativacaoAdmin(s.idSolicitacao, false)}>
                  <XCircle className="mr-1 h-3 w-3" />Rejeitar
                </Button>
                <Button size="sm"
                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => handleVotarDesativacaoAdmin(s.idSolicitacao, true)}>
                  <CheckCircle2 className="mr-1 h-3 w-3" />Aprovar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">Gerencie usuários e suas permissões de acesso ao sistema</p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {perm.canManageUsuario && (
            <Link to="/dashboard/usuarios/novo">
              <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Plus className="mr-2 h-4 w-4" />Novo Usuário
              </Button>
            </Link>
          )}
        </div>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{erro}</div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>Tentar novamente</Button>
        </div>
      )}

      <Tabs defaultValue="ativos">
        <TabsList>
          <TabsTrigger value="ativos">
            Ativos
            {usuarios.length > 0 && (
              <span className="ml-2 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium">{usuarios.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pendentes">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Aguardando Ativação
            {inativos.length > 0 && (
              <span className="ml-2 rounded-full bg-yellow-200 px-1.5 py-0.5 text-xs font-medium text-yellow-800">{inativos.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="deletados">
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Usuários Deletados
            {deletados.length > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">{deletados.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── ABA: ATIVOS ─────────────────────────────────────────────────── */}
        <TabsContent value="ativos" className="space-y-4 mt-4">
          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Buscar por nome ou e-mail..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterPerfil} onValueChange={setFilterPerfil}>
              <SelectTrigger className="w-full sm:w-56">
                <Shield className="mr-2 h-4 w-4" /><SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os perfis</SelectItem>
                {TODOS_PERFIS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
            </div>
          ) : filtradosAtivos.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
              <UserX className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="font-medium">
                {searchTerm || filterPerfil !== "todos" ? "Nenhum usuário corresponde aos filtros." : "Nenhum usuário ativo."}
              </p>
            </div>
          ) : (
            <TabelaUsuarios
              usuarios={filtradosAtivos}
              acaoLoading={acaoLoading}
              perm={perm}
              ehAdminSistema={ehAdminSistema}
              onDefinirPerfil={abrirDefinirPerfil}
              onAtivar={handleAtivar}
              onDesativar={handleDesativar}
              onExcluir={handleExcluir}
              onResetarMfa={handleResetarMfa}
              onResetarSenha={(u) => setResetSenha({ id: u.id, nome: u.nomeCompleto })}
              navigate={navigate}
            />
          )}
        </TabsContent>

        {/* ── ABA: PENDENTES ──────────────────────────────────────────────── */}
        <TabsContent value="pendentes" className="space-y-4 mt-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Estas contas foram criadas mas ainda não têm perfil ou ativação. Defina o perfil e ative cada uma para liberar o acesso.
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
            </div>
          ) : inativos.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
              <UserCheck className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="font-medium">Nenhuma conta aguardando ativação.</p>
            </div>
          ) : (
            <TabelaUsuarios
              usuarios={inativos}
              acaoLoading={acaoLoading}
              perm={perm}
              ehAdminSistema={ehAdminSistema}
              onDefinirPerfil={abrirDefinirPerfil}
              onAtivar={handleAtivar}
              onDesativar={handleDesativar}
              onExcluir={handleExcluir}
              onResetarMfa={handleResetarMfa}
              onResetarSenha={(u) => setResetSenha({ id: u.id, nome: u.nomeCompleto })}
              navigate={navigate}
              destacarPendentes
            />
          )}
        </TabsContent>

        {/* ── ABA: DELETADOS ──────────────────────────────────────────────── */}
        <TabsContent value="deletados" className="space-y-4 mt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Usuários removidos logicamente. Você pode <strong>reativar</strong> a conta ou <strong>excluir permanentemente</strong> do banco de dados.
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
            </div>
          ) : deletados.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
              <Trash2 className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="font-medium">Nenhum usuário na lixeira.</p>
            </div>
          ) : (
            <TabelaDeletados
              usuarios={deletados}
              acaoLoading={acaoLoading}
              perm={perm}
              onReativar={handleReativar}
              onExcluirPermanente={handleExcluirPermanente}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Sub-componente tabela de ativos/pendentes ────────────────────────────────

interface TabelaProps {
  usuarios: UsuarioResponse[];
  acaoLoading: number | null;
  perm: ReturnType<typeof usePermissoes>;
  ehAdminSistema: boolean;
  onDefinirPerfil: (u: UsuarioResponse) => void;
  onAtivar: (u: UsuarioResponse) => void;
  onDesativar: (u: UsuarioResponse) => void;
  onExcluir: (u: UsuarioResponse) => void;
  onResetarMfa: (u: UsuarioResponse) => void;
  onResetarSenha: (u: UsuarioResponse) => void;
  navigate: ReturnType<typeof useNavigate>;
  destacarPendentes?: boolean;
}

function TabelaUsuarios({
  usuarios, acaoLoading, perm, ehAdminSistema,
  onDefinirPerfil, onAtivar, onDesativar, onExcluir,
  onResetarMfa, onResetarSenha,
  navigate, destacarPendentes,
}: TabelaProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} className="hover:bg-gray-50/80">
                <TableCell className="font-medium">{u.nomeCompleto}</TableCell>
                <TableCell className="text-gray-600">{u.email}</TableCell>
                <TableCell className="font-mono text-sm text-gray-500">{u.nomeUsuario}</TableCell>
                <TableCell>
                  {u.perfil ? (
                    <Badge
                      variant={u.perfil.startsWith("ADMINISTRADOR") ? "default" : "secondary"}
                      className={u.perfil.startsWith("ADMINISTRADOR") ? "bg-[#1351B4]" : ""}
                    >
                      {PERFIL_LABELS[u.perfil] ?? u.perfil}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-yellow-700 border-yellow-400 bg-yellow-50">
                      Sem perfil
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {acaoLoading === u.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                      : <div className={`h-2 w-2 rounded-full ${u.ativo ? "bg-green-500" : destacarPendentes ? "bg-yellow-500" : "bg-gray-300"}`} />
                    }
                    <span className="text-sm">{u.ativo ? "Ativo" : destacarPendentes ? "Pendente" : "Inativo"}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {perm.canManageUsuario ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={acaoLoading === u.id}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDefinirPerfil(u)}>
                          <Shield className="mr-2 h-4 w-4" />Definir Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/dashboard/permissoes")}>
                          <Shield className="mr-2 h-4 w-4 text-gray-400" />Ver Permissões
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => u.ativo ? onDesativar(u) : onAtivar(u)}>
                          {u.ativo
                            ? <><UserX className="mr-2 h-4 w-4" />Desativar</>
                            : <><UserCheck className="mr-2 h-4 w-4" />Ativar</>
                          }
                        </DropdownMenuItem>

                        {/* Opções exclusivas do ADMINISTRADOR_SISTEMA */}
                        {ehAdminSistema && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onResetarSenha(u)}
                              className="gap-2"
                            >
                              <KeyRound className="mr-2 h-4 w-4 text-blue-500" />
                              Redefinir Senha
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-orange-600 focus:text-orange-700"
                              onClick={() => onResetarMfa(u)}
                            >
                              <ShieldOff className="mr-2 h-4 w-4" />Resetar MFA
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => onExcluir(u)}>
                          <Trash2 className="mr-2 h-4 w-4" />Excluir usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Sub-componente tabela de deletados ───────────────────────────────────────

interface TabelaDeletadosProps {
  usuarios: UsuarioResponse[];
  acaoLoading: number | null;
  perm: ReturnType<typeof usePermissoes>;
  onReativar: (u: UsuarioResponse) => void;
  onExcluirPermanente: (u: UsuarioResponse) => void;
}

function TabelaDeletados({ usuarios, acaoLoading, perm, onReativar, onExcluirPermanente }: TabelaDeletadosProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Excluído em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} className="hover:bg-red-50/40 opacity-75">
                <TableCell className="font-medium text-gray-500 line-through">{u.nomeCompleto}</TableCell>
                <TableCell className="text-gray-400">{u.email}</TableCell>
                <TableCell className="font-mono text-sm text-gray-400">{u.nomeUsuario}</TableCell>
                <TableCell>
                  {u.perfil ? (
                    <Badge variant="secondary" className="opacity-60">
                      {PERFIL_LABELS[u.perfil] ?? u.perfil}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-gray-400">
                  {u.atualizadoEm ? new Date(u.atualizadoEm).toLocaleDateString("pt-BR") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {perm.canManageUsuario && (
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline" size="sm"
                        className="text-green-700 border-green-300 hover:bg-green-50 gap-1.5"
                        disabled={acaoLoading === u.id}
                        onClick={() => onReativar(u)}
                      >
                        {acaoLoading === u.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <RotateCcw className="h-3.5 w-3.5" />
                        }
                        Reativar
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 gap-1.5"
                        disabled={acaoLoading === u.id}
                        onClick={() => onExcluirPermanente(u)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />Excluir
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}