import React, { useState } from "react";
import { Link } from "react-router";
import {
  Building2,
  Search,
  Filter,
  Download,
  Plus,
  Grid3x3,
  List,
  Eye,
  Edit,
  MapPin,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

// Dados mockados de exemplo baseados na Etapa 3
const mockImoveis = [
  {
    id: 1,
    codigo: "IMO-2026-0001",
    denominacao: "Escola Municipal João Silva",
    tipoImovel: "Edificação",
    categoriaUso: "Educação",
    destinacaoAtual: "Uso Próprio do Órgão",
    situacaoOcupacao: "Ocupado",
    unidadeGestora: "SEMED",
    endereco: "Rua das Flores, 123 - Centro",
    status: "Ativo",
  },
  {
    id: 2,
    codigo: "IMO-2026-0002",
    denominacao: "Centro de Saúde Vila Nova",
    tipoImovel: "Edificação",
    categoriaUso: "Saúde",
    destinacaoAtual: "Uso Próprio do Órgão",
    situacaoOcupacao: "Ocupado",
    unidadeGestora: "SEMUS",
    endereco: "Av. Principal, 456 - Vila Nova",
    status: "Ativo",
  },
  {
    id: 3,
    codigo: "IMO-2026-0003",
    denominacao: "Terreno Zona Industrial",
    tipoImovel: "Terreno",
    categoriaUso: "Infraestrutura",
    destinacaoAtual: "Desocupado",
    situacaoOcupacao: "Desocupado",
    unidadeGestora: "SEPLAN",
    endereco: "Zona Industrial Sul - Quadra 10",
    status: "Disponível",
  },
  {
    id: 4,
    codigo: "IMO-2026-0004",
    denominacao: "Casa de Cultura Popular",
    tipoImovel: "Edificação",
    categoriaUso: "Cultura",
    destinacaoAtual: "Cedido",
    situacaoOcupacao: "Ocupado",
    unidadeGestora: "SEMAC",
    endereco: "Praça da República, 789 - Centro Histórico",
    status: "Ativo",
  },
  {
    id: 5,
    codigo: "IMO-2026-0005",
    denominacao: "Praça de Esportes do Bairro",
    tipoImovel: "Área de Uso Especial",
    categoriaUso: "Esporte e Lazer",
    destinacaoAtual: "Uso Próprio do Órgão",
    situacaoOcupacao: "Ocupado",
    unidadeGestora: "SEMEL",
    endereco: "Rua dos Esportes, s/n - Jardim América",
    status: "Ativo",
  },
  {
    id: 6,
    codigo: "IMO-2026-0006",
    denominacao: "Prédio Administrativo SEPLAN",
    tipoImovel: "Edificação",
    categoriaUso: "Administrativo",
    destinacaoAtual: "Uso Próprio do Órgão",
    situacaoOcupacao: "Ocupado",
    unidadeGestora: "SEPLAN",
    endereco: "Av. dos Holandeses, 1000 - Ponta d'Areia",
    status: "Ativo",
  },
  {
    id: 7,
    codigo: "IMO-2026-0007",
    denominacao: "Área Verde Parque Municipal",
    tipoImovel: "Área Verde",
    categoriaUso: "Esporte e Lazer",
    destinacaoAtual: "Uso Próprio do Órgão",
    situacaoOcupacao: "Ocupado",
    unidadeGestora: "SEMMAM",
    endereco: "Parque Ecológico - Cohama",
    status: "Ativo",
  },
  {
    id: 8,
    codigo: "IMO-2026-0008",
    denominacao: "Galpão de Manutenção",
    tipoImovel: "Edificação",
    categoriaUso: "Infraestrutura",
    destinacaoAtual: "Em Obras/Reforma",
    situacaoOcupacao: "Parcialmente Ocupado",
    unidadeGestora: "SEMOSP",
    endereco: "Distrito Industrial - Lote 25",
    status: "Em Reforma",
  },
];

export function Catalogo() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterCategoria, setFilterCategoria] = useState<string>("todos");
  const [filterSituacao, setFilterSituacao] = useState<string>("todos");

  // Filtrar imóveis
  const imoveisFiltrados = mockImoveis.filter((imovel) => {
    const matchSearch =
      searchTerm === "" ||
      imovel.denominacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.endereco.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo =
      filterTipo === "todos" || imovel.tipoImovel === filterTipo;
    const matchCategoria =
      filterCategoria === "todos" || imovel.categoriaUso === filterCategoria;
    const matchSituacao =
      filterSituacao === "todos" ||
      imovel.situacaoOcupacao === filterSituacao;

    return matchSearch && matchTipo && matchCategoria && matchSituacao;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 border-green-200";
      case "Disponível":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Em Reforma":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catálogo de Imóveis
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualize e consulte imóveis por classificação e uso
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Link to="/imoveis/novo/etapa-1">
            <Button className="gap-2 bg-[#1351B4] hover:bg-[#0c3b8d]">
              <Plus className="h-4 w-4" />
              Novo Imóvel
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filtros e Busca</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setFilterTipo("todos");
                setFilterCategoria("todos");
                setFilterSituacao("todos");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Busca */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Código, nome ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tipo de Imóvel */}
            <div className="space-y-2">
              <Label htmlFor="filterTipo">Tipo de Imóvel</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger id="filterTipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Terreno">Terreno</SelectItem>
                  <SelectItem value="Edificação">Edificação</SelectItem>
                  <SelectItem value="Área Verde">Área Verde</SelectItem>
                  <SelectItem value="Área de Uso Especial">
                    Área de Uso Especial
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria de Uso */}
            <div className="space-y-2">
              <Label htmlFor="filterCategoria">Categoria de Uso</Label>
              <Select
                value={filterCategoria}
                onValueChange={setFilterCategoria}
              >
                <SelectTrigger id="filterCategoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Cultura">Cultura</SelectItem>
                  <SelectItem value="Esporte e Lazer">
                    Esporte e Lazer
                  </SelectItem>
                  <SelectItem value="Infraestrutura">
                    Infraestrutura
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Situação de Ocupação */}
            <div className="space-y-2">
              <Label htmlFor="filterSituacao">Situação de Ocupação</Label>
              <Select value={filterSituacao} onValueChange={setFilterSituacao}>
                <SelectTrigger id="filterSituacao">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Ocupado">Ocupado</SelectItem>
                  <SelectItem value="Parcialmente Ocupado">
                    Parcialmente Ocupado
                  </SelectItem>
                  <SelectItem value="Desocupado">Desocupado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de Visualização */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {imoveisFiltrados.length} {imoveisFiltrados.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid"
                ? "bg-[#1351B4] hover:bg-[#0c3b8d]"
                : ""
            }
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "bg-[#1351B4] hover:bg-[#0c3b8d]"
                : ""
            }
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Imóveis */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {imoveisFiltrados.map((imovel) => (
            <Card key={imovel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1351B4]/10">
                      <Building2 className="h-5 w-5 text-[#1351B4]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {imovel.codigo}
                      </p>
                      <CardTitle className="text-base">
                        {imovel.denominacao}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">{imovel.endereco}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium text-gray-900">
                      {imovel.tipoImovel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium text-gray-900">
                      {imovel.categoriaUso}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Destinação:</span>
                    <span className="font-medium text-gray-900">
                      {imovel.destinacaoAtual}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Situação:</span>
                    <span className="font-medium text-gray-900">
                      {imovel.situacaoOcupacao}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <Badge className={getStatusColor(imovel.status)}>
                    {imovel.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {imoveisFiltrados.map((imovel) => (
                <div
                  key={imovel.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#1351B4]/10">
                    <Building2 className="h-6 w-6 text-[#1351B4]" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {imovel.denominacao}
                      </p>
                      <Badge className={getStatusColor(imovel.status)}>
                        {imovel.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{imovel.codigo}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {imovel.endereco}
                    </div>
                  </div>
                  <div className="hidden flex-shrink-0 space-y-1 text-right lg:block">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tipo:</span>{" "}
                      {imovel.tipoImovel}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Categoria:</span>{" "}
                      {imovel.categoriaUso}
                    </p>
                  </div>
                  <div className="hidden flex-shrink-0 space-y-1 text-right lg:block">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Destinação:</span>{" "}
                      {imovel.destinacaoAtual}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Situação:</span>{" "}
                      {imovel.situacaoOcupacao}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado Vazio */}
      {imoveisFiltrados.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Nenhum imóvel encontrado
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Tente ajustar os filtros de busca
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}