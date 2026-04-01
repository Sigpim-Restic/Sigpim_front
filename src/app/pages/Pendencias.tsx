import React, { useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  Clock,
  Filter,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card } from "../components/ui/card";

export function Pendencias() {
  const [filterTipo, setFilterTipo] = useState("todas");
  const [filterPrioridade, setFilterPrioridade] = useState("todas");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600">
          Gerencie pendências, validações e SLAs de imóveis cadastrados
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Pendências
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">12</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Vencendo Hoje
              </p>
              <p className="mt-2 text-3xl font-semibold text-red-600">3</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Resolvidas (Mês)
              </p>
              <p className="mt-2 text-3xl font-semibold text-green-600">28</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-56">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo de Pendência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Pendências</SelectItem>
            <SelectItem value="documentacao">Documentação</SelectItem>
            <SelectItem value="validacao">Validação</SelectItem>
            <SelectItem value="gis">Coordenadas GIS</SelectItem>
            <SelectItem value="patrimonio">Patrimônio Histórico</SelectItem>
            <SelectItem value="vistoria">Vistoria</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pendências List */}
      <div className="space-y-4">
        {mockPendencias.map((pendencia) => (
          <Card
            key={pendencia.id}
            className="p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      pendencia.prioridade === "Alta"
                        ? "destructive"
                        : pendencia.prioridade === "Média"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      pendencia.prioridade === "Média"
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        : ""
                    }
                  >
                    {pendencia.prioridade}
                  </Badge>
                  <Badge variant="outline">{pendencia.tipo}</Badge>
                  <span className="text-xs text-gray-500">
                    {pendencia.imovel}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {pendencia.titulo}
                </h3>
                <p className="mb-3 text-sm text-gray-600">
                  {pendencia.descricao}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      Vence em:{" "}
                      <span
                        className={
                          pendencia.diasRestantes <= 1
                            ? "font-medium text-red-600"
                            : "font-medium text-gray-900"
                        }
                      >
                        {pendencia.diasRestantes}{" "}
                        {pendencia.diasRestantes === 1 ? "dia" : "dias"}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Building2 className="h-4 w-4" />
                    <span>{pendencia.orgao}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/imoveis/${pendencia.imovelId}`}>
                  <Button variant="outline" size="sm">
                    Ver Imóvel
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                  Resolver
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const mockPendencias = [
  {
    id: 1,
    imovel: "IMO-2026-0042",
    endereco: "Av. Litorânea, 3400 - Calhau",
    tipo: "Documentação",
    descricao: "Título de propriedade ausente",
    prazo: "26/02/2026",
    prioridade: "Alta",
    diasRestantes: 1,
    orgao: "SEPLAN",
  },
  {
    id: 2,
    imovel: "IMO-2026-0045",
    endereco: "Rua da Paz, 88 - Cohab",
    tipo: "Vistoria",
    descricao: "Vistoria técnica vencida",
    prazo: "27/02/2026",
    prioridade: "Alta",
    diasRestantes: 2,
    orgao: "SEPLAN",
  },
];