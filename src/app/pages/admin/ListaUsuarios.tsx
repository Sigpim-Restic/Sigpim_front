import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus, Search, MoreVertical, Edit, Shield,
  UserCheck, UserX, Loader2, AlertCircle, RefreshCw,
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
import { usuariosApi, type UsuarioResponse, type PerfilUsuario } from "../../api/usuarios";
import { usePermissoes } from "../../hooks/usePermissoes";

const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  ADMINISTRADOR_SISTEMA:     "Admin. Sistema",
  ADMINISTRADOR_PATRIMONIAL: "Admin. Patrimonial",
  CADASTRADOR_SETORIAL:      "Cadastrador",
  VALIDADOR_DOCUMENTAL:      "Validador",
  VISTORIADOR:               "Vistoriador",
  PLANEJAMENTO:              "Planejamento",
  AUDITOR:                   "Auditor",
};

interface ConfirmacaoState {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  variante: "default" | "destrutivo";
  onConfirmar: () => Promise<void>;
}

export function ListaUsuarios() {
  const navigate = useNavigate();
  const perm     = usePermissoes();

  const [usuarios,      setUsuarios]      = useState<UsuarioResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [erro,          setErro]          = useState<string | null>(null);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterPerfil,  setFilterPerfil]  = useState("todos");
  const [acaoLoading,   setAcaoLoading]   = useState<number | null>(null); // id do usuário em ação

  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState>({
    aberto: false, titulo: "", mensagem: "",
    variante: "default", onConfirmar: async () => {},
  });

  const carregar = () => {
    setLoading(true);
    setErro(null);
    usuariosApi
      .listar()
      .then(setUsuarios)
      .catch((e) => setErro(e.message ?? "Erro ao carregar usuários."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  // ── executa ação com loading no botão ──────────────────────────────────────
  const executarAcao = async (idUsuario: number, acao: () => Promise<void>) => {
    setAcaoLoading(idUsuario);
    try {
      await acao();
      carregar();
    } catch (e: any) {
      setErro(e.message ?? "Erro ao executar ação.");
    } finally {
      setAcaoLoading(null);
    }
  };

  // ── confirmação genérica ───────────────────────────────────────────────────
  const confirmar = (cfg: Omit<ConfirmacaoState, "aberto">) =>
    setConfirmacao({ ...cfg, aberto: true });

  const fecharConfirmacao = () =>
    setConfirmacao((c) => ({ ...c, aberto: false }));

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleAtivar = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Ativar usuário",
      mensagem:  `Deseja ativar o usuário "${u.nomeCompleto}"? Ele voltará a ter acesso ao sistema.`,
      variante:  "default",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.ativar(u.id)),
    });
  };

  const handleDesativar = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Desativar usuário",
      mensagem:  `Deseja desativar "${u.nomeCompleto}"? O acesso ao sistema será bloqueado.`,
      variante:  "destrutivo",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.desativar(u.id)),
    });
  };

  const handleExcluir = (u: UsuarioResponse) => {
    confirmar({
      titulo:    "Excluir usuário",
      mensagem:  `Tem certeza que deseja excluir "${u.nomeCompleto}"? Esta ação não pode ser desfeita.`,
      variante:  "destrutivo",
      onConfirmar: () => executarAcao(u.id, () => usuariosApi.excluir(u.id)),
    });
  };

  const filtrados = usuarios.filter((u) => {
    const matchSearch =
      u.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPerfil = filterPerfil === "todos" || u.perfil === filterPerfil;
    return matchSearch && matchPerfil;
  });

  return (
    <div className="space-y-6">

      {/* Modal de confirmação */}
      <Dialog open={confirmacao.aberto} onOpenChange={(v) => !v && fecharConfirmacao()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmacao.titulo}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">{confirmacao.mensagem}</p>
          <DialogFooter>
            <Button variant="outline" onClick={fecharConfirmacao}>
              Cancelar
            </Button>
            <Button
              variant={confirmacao.variante === "destrutivo" ? "destructive" : "default"}
              className={confirmacao.variante === "default" ? "bg-[#1351B4] hover:bg-[#0c3b8d]" : ""}
              onClick={async () => {
                fecharConfirmacao();
                await confirmacao.onConfirmar();
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Gerencie usuários e suas permissões de acesso ao sistema
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {perm.canManageUsuario && (
            <Link to="/usuarios/novo">
              <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Plus className="mr-2 h-4 w-4" />Novo Usuário
              </Button>
            </Link>
          )}
        </div>
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

      {/* Filtros */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPerfil} onValueChange={setFilterPerfil}>
          <SelectTrigger className="w-full sm:w-56">
            <Shield className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os perfis</SelectItem>
            {Object.entries(PERFIL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          <UserX className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="font-medium">
            {searchTerm || filterPerfil !== "todos"
              ? "Nenhum usuário corresponde aos filtros."
              : "Nenhum usuário cadastrado ainda."}
          </p>
          {(searchTerm || filterPerfil !== "todos") && (
            <Button
              variant="outline" size="sm" className="mt-3"
              onClick={() => { setSearchTerm(""); setFilterPerfil("todos"); }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
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
                {filtrados.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50/80">
                    <TableCell className="font-medium">{u.nomeCompleto}</TableCell>
                    <TableCell className="text-gray-600">{u.email}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">{u.nomeUsuario}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.perfil.startsWith("ADMINISTRADOR") ? "default" : "secondary"}
                        className={u.perfil.startsWith("ADMINISTRADOR") ? "bg-[#1351B4]" : ""}
                      >
                        {PERFIL_LABELS[u.perfil] ?? u.perfil}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {acaoLoading === u.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                          : <div className={`h-2 w-2 rounded-full ${u.ativo ? "bg-green-500" : "bg-gray-300"}`} />
                        }
                        <span className="text-sm">{u.ativo ? "Ativo" : "Inativo"}</span>
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
                            <DropdownMenuItem onClick={() => navigate(`/usuarios/${u.id}/permissoes`)}>
                              <Shield className="mr-2 h-4 w-4" />Permissões
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => u.ativo ? handleDesativar(u) : handleAtivar(u)}
                            >
                              {u.ativo
                                ? <><UserX     className="mr-2 h-4 w-4" />Desativar</>
                                : <><UserCheck className="mr-2 h-4 w-4" />Ativar</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleExcluir(u)}
                            >
                              Excluir usuário
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
          <div className="border-t border-gray-200 px-6 py-3">
            <p className="text-xs text-gray-500">
              Exibindo {filtrados.length} de {usuarios.length} usuários
            </p>
          </div>
        </div>
      )}
    </div>
  );
}