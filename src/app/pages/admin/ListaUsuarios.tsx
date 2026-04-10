import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { EmptyState, ErrorState } from "../../components/layout/States";
import { usuariosApi, type UsuarioResponse, type PerfilUsuario } from "../../api/usuarios";
import { api } from "../../api/client";

const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  ADMINISTRADOR_SISTEMA: "Admin. Sistema",
  ADMINISTRADOR_PATRIMONIAL: "Admin. Patrimonial",
  CADASTRADOR_SETORIAL: "Cadastrador",
  VALIDADOR_DOCUMENTAL: "Validador",
  VISTORIADOR: "Vistoriador",
  PLANEJAMENTO: "Planejamento",
  AUDITOR: "Auditor",
};

export function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPerfil, setFilterPerfil] = useState("todos");

  const carregar = () => {
    setLoading(true);
    setErro(null);
    usuariosApi
      .listar()
      .then(setUsuarios)
      .catch((e) => setErro(e.message ?? "Erro ao carregar usuários."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleAtivar = async (id: number) => {
    try {
      await api.patch(`/usuarios/${id}/ativar`);
      carregar();
    } catch (e: any) {
      alert(e.message ?? "Erro ao ativar usuário.");
    }
  };

  const handleDesativar = async (id: number) => {
    try {
      await api.patch(`/usuarios/${id}/desativar`);
      carregar();
    } catch (e: any) {
      alert(e.message ?? "Erro ao desativar usuário.");
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      carregar();
    } catch (e: any) {
      alert(e.message ?? "Erro ao excluir usuário.");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchSearch =
      u.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPerfil = filterPerfil === "todos" || u.perfil === filterPerfil;
    return matchSearch && matchPerfil;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Gerencie usuários e suas permissões de acesso ao sistema
        </p>
        <Link to="/usuarios/novo">
          <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
        </div>
      ) : erro ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {erro}
          <Button variant="outline" size="sm" className="ml-4" onClick={carregar}>
            Tentar novamente
          </Button>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <EmptyState
          icon={<UserX className="h-8 w-8 text-gray-400" />}
          title="Nenhum usuário encontrado"
          description={
            searchTerm || filterPerfil !== "todos"
              ? "Nenhum usuário corresponde aos filtros aplicados."
              : "Nenhum usuário cadastrado ainda."
          }
          action={
            (searchTerm || filterPerfil !== "todos") ? (
              <Button
                variant="outline"
                onClick={() => { setSearchTerm(""); setFilterPerfil("todos"); }}
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
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
                {usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nomeCompleto}</TableCell>
                    <TableCell className="text-gray-600">{usuario.email}</TableCell>
                    <TableCell className="text-gray-500 font-mono text-sm">{usuario.nomeUsuario}</TableCell>
                    <TableCell>
                      <Badge
                        variant={usuario.perfil.startsWith("ADMINISTRADOR") ? "default" : "secondary"}
                        className={usuario.perfil.startsWith("ADMINISTRADOR") ? "bg-[#1351B4]" : ""}
                      >
                        {PERFIL_LABELS[usuario.perfil] ?? usuario.perfil}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${usuario.ativo ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="text-sm">{usuario.ativo ? "Ativo" : "Inativo"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/usuarios/${usuario.id}/permissoes`}>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Permissões
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() => usuario.ativo ? handleDesativar(usuario.id) : handleAtivar(usuario.id)}
                          >
                            {usuario.ativo ? (
                              <><UserX className="mr-2 h-4 w-4" />Desativar</>
                            ) : (
                              <><UserCheck className="mr-2 h-4 w-4" />Ativar</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleExcluir(usuario.id)}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600">
              Exibindo {usuariosFiltrados.length} de {usuarios.length} usuários
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
