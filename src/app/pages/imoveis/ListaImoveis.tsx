import React, { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Eye,
  MapPin,
  Download,
  Building2,
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

export function ListaImoveis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Gerencie o cadastro completo dos imóveis públicos municipais
          </p>
        </div>
        <Link to="/imoveis/novo/etapa-1">
          <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
            <Plus className="mr-2 h-4 w-4" />
            Novo Imóvel
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por código, endereço ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="completo">Cadastro Completo</SelectItem>
            <SelectItem value="pendente">Com Pendências</SelectItem>
            <SelectItem value="analise">Em Análise</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Código</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Órgão Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockImoveis.map((imovel) => (
                <TableRow key={imovel.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {imovel.codigo}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{imovel.endereco}</p>
                      <p className="text-xs text-gray-500">
                        {imovel.bairro} - {imovel.cidade}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{imovel.tipo}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{imovel.orgao}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        imovel.status === "Completo" ? "default" : "secondary"
                      }
                      className={
                        imovel.status === "Completo"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : imovel.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : imovel.status === "Em Análise"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : ""
                      }
                    >
                      {imovel.status}
                    </Badge>
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
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MapPin className="mr-2 h-4 w-4" />
                          Ver no Mapa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Exportar Ficha
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
            Exibindo 10 de 1.247 imóveis cadastrados
          </p>
        </div>
      </div>
    </div>
  );
}

const mockImoveis = [
  {
    id: 1,
    codigo: "IMV-2024-001",
    nome: "Edifício Sede SEPLAN",
    endereco: "Av. Pedro II, 150 - Centro",
    cidade: "São Luís",
    tipo: "Prédio Administrativo",
    orgao: "SEPLAN",
    status: "Completo",
  },
  {
    id: 2,
    codigo: "IMO-2026-0046",
    endereco: "Av. dos Franceses, 1200",
    bairro: "São Francisco",
    cidade: "São Luís",
    tipo: "Escola",
    orgao: "SEMED",
    status: "Pendente",
  },
  {
    id: 3,
    codigo: "IMO-2026-0045",
    endereco: "Rua da Paz, 88",
    bairro: "Cohab",
    cidade: "São Luís",
    tipo: "UBS",
    orgao: "SEMUS",
    status: "Em Análise",
  },
  {
    id: 4,
    codigo: "IMO-2026-0044",
    endereco: "Av. Colares Moreira, 2500",
    bairro: "Renascença",
    cidade: "São Luís",
    tipo: "Terreno",
    orgao: "SEMFAZ",
    status: "Completo",
  },
  {
    id: 5,
    codigo: "IMO-2026-0043",
    endereco: "Rua Grande, 175",
    bairro: "Centro Histórico",
    cidade: "São Luís",
    tipo: "Patrimônio Histórico",
    orgao: "SECULT",
    status: "Em Análise",
  },
  {
    id: 6,
    codigo: "IMO-2026-0042",
    endereco: "Av. Litorânea, 3400",
    bairro: "Calhau",
    cidade: "São Luís",
    tipo: "Área de Lazer",
    orgao: "SEINFRA",
    status: "Pendente",
  },
  {
    id: 7,
    codigo: "IMO-2026-0041",
    endereco: "Rua Sete de Setembro, 200",
    bairro: "Centro",
    cidade: "São Luís",
    tipo: "Arquivo Público",
    orgao: "SEPLAN",
    status: "Completo",
  },
  {
    id: 8,
    codigo: "IMO-2026-0040",
    endereco: "Av. Castelo Branco, 1500",
    bairro: "Turu",
    cidade: "São Luís",
    tipo: "Creche",
    orgao: "SEMED",
    status: "Rascunho",
  },
  {
    id: 9,
    codigo: "IMO-2026-0039",
    endereco: "Rua do Egito, 320",
    bairro: "João Paulo",
    cidade: "São Luís",
    tipo: "Galpão",
    orgao: "SEINFRA",
    status: "Completo",
  },
  {
    id: 10,
    codigo: "IMO-2026-0038",
    endereco: "Largo do Carmo, s/n",
    bairro: "Centro Histórico",
    cidade: "São Luís",
    tipo: "Igreja",
    orgao: "SECULT",
    status: "Em Análise",
  },
];