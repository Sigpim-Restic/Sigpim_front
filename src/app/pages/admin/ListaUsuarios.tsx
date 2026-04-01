import React, { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
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
import { EmptyState } from "../../components/layout/States";

export function ListaUsuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrgao, setFilterOrgao] = useState("todos");
  const [filterPerfil, setFilterPerfil] = useState("todos");

  const usuarios = mockUsuarios.filter((usuario) => {
    const matchSearch =
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchOrgao =
      filterOrgao === "todos" || usuario.orgao === filterOrgao;
    const matchPerfil =
      filterPerfil === "todos" || usuario.perfil === filterPerfil;
    return matchSearch && matchOrgao && matchPerfil;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Gerencie usuários e suas permissões de acesso ao sistema
          </p>
        </div>
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
        <Select value={filterOrgao} onValueChange={setFilterOrgao}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Órgão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os órgãos</SelectItem>
            <SelectItem value="SEPLAN">SEPLAN</SelectItem>
            <SelectItem value="SEMED">SEMED</SelectItem>
            <SelectItem value="SEMUS">SEMUS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPerfil} onValueChange={setFilterPerfil}>
          <SelectTrigger className="w-full sm:w-48">
            <Shield className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os perfis</SelectItem>
            <SelectItem value="Administrador">Administrador</SelectItem>
            <SelectItem value="Gestor">Gestor</SelectItem>
            <SelectItem value="Operacional">Operacional</SelectItem>
            <SelectItem value="Consulta">Consulta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {usuarios.length === 0 ? (
        <EmptyState
          icon={<UserX className="h-8 w-8 text-gray-400" />}
          title="Nenhum usuário encontrado"
          description="Não há usuários que correspondam aos filtros selecionados. Tente ajustar os critérios de busca."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterOrgao("todos");
                setFilterPerfil("todos");
              }}
            >
              Limpar filtros
            </Button>
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
                  <TableHead>Órgão/Unidade</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.nome}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {usuario.email}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{usuario.orgao}</p>
                        <p className="text-xs text-gray-500">
                          {usuario.unidade}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          usuario.perfil === "Administrador"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          usuario.perfil === "Administrador"
                            ? "bg-[#1351B4] hover:bg-[#1351B4]"
                            : ""
                        }
                      >
                        {usuario.perfil}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            usuario.status === "Ativo"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm">{usuario.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <Link to={`/usuarios/${usuario.id}/permissoes`}>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Permissões
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>
                            {usuario.status === "Ativo" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
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
          
          {/* Pagination Info */}
          <div className="border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600">
              Exibindo {usuarios.length} de {mockUsuarios.length} usuários
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const mockUsuarios = [
  {
    id: 1,
    nome: "Maria Silva",
    email: "maria.silva@semplan.slz.ma.gov.br",
    orgao: "SEPLAN",
    unidade: "Diretoria de Patrimônio",
    perfil: "Administrador",
    status: "Ativo",
  },
  {
    id: 2,
    nome: "Carlos Santos",
    email: "carlos.santos@semplan.slz.ma.gov.br",
    orgao: "SEPLAN",
    unidade: "Coordenação de Cadastro",
    perfil: "Gestor",
    status: "Ativo",
  },
  {
    id: 3,
    nome: "Ana Paula Oliveira",
    email: "ana.oliveira@semed.slz.ma.gov.br",
    orgao: "SEMED",
    unidade: "Gestão Predial",
    perfil: "Operacional",
    status: "Ativo",
  },
  {
    id: 4,
    nome: "João Ferreira",
    email: "joao.ferreira@semus.slz.ma.gov.br",
    orgao: "SEMUS",
    unidade: "Infraestrutura",
    perfil: "Operacional",
    status: "Ativo",
  },
  {
    id: 5,
    nome: "Pedro Costa",
    email: "pedro.costa@semfaz.slz.ma.gov.br",
    orgao: "SEMFAZ",
    unidade: "Auditoria Patrimonial",
    perfil: "Consulta",
    status: "Ativo",
  },
  {
    id: 6,
    nome: "Juliana Rocha",
    email: "juliana.rocha@semplan.slz.ma.gov.br",
    orgao: "SEPLAN",
    unidade: "GIS e Georreferenciamento",
    perfil: "Gestor",
    status: "Inativo",
  },
];