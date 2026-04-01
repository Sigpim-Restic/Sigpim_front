import React, { useState } from "react";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";

export function Relatorios() {
  const [selectedReport, setSelectedReport] = useState("");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-gray-600">
          Geração de relatórios gerenciais e operacionais do sistema
        </p>
      </div>

      {/* Report Types */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer p-6 transition-all hover:border-[#1351B4] hover:shadow-md"
            onClick={() => setSelectedReport(report.id)}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-6 w-6 text-[#1351B4]" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">
              {report.title}
            </h3>
            <p className="text-sm text-gray-600">{report.description}</p>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      {selectedReport && (
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Configurar Relatório
          </h3>

          <div className="space-y-6">
            {/* Date Range */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Inicial</Label>
                <Input id="dataInicio" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Final</Label>
                <Input id="dataFim" type="date" />
              </div>
            </div>

            {/* Filters */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orgao">Órgão</Label>
                <Select>
                  <SelectTrigger id="orgao">
                    <SelectValue placeholder="Todos os órgãos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="SEPLAN">SEPLAN</SelectItem>
                    <SelectItem value="SEMED">SEMED</SelectItem>
                    <SelectItem value="SEMUS">SEMUS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="completo">Completo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="analise">Em Análise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Formato de Exportação</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pdf" defaultChecked />
                  <label
                    htmlFor="pdf"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    PDF
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="excel" />
                  <label
                    htmlFor="excel"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Excel
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="csv" />
                  <label
                    htmlFor="csv"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    CSV
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedReport("")}
              >
                Cancelar
              </Button>
              <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Download className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Reports */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Relatórios Recentes
        </h3>
        <div className="space-y-3">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {report.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {report.date}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {report.size}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const reportTypes = [
  {
    id: "inventario",
    title: "Inventário Patrimonial",
    description: "Relatório completo de todos os imóveis cadastrados",
  },
  {
    id: "ocupacao",
    title: "Ocupação de Imóveis",
    description: "Análise de ocupação e destinação dos imóveis",
  },
  {
    id: "pendencias",
    title: "Pendências e SLAs",
    description: "Relatório de pendências e prazos vencidos",
  },
  {
    id: "dominial",
    title: "Situação Dominial",
    description: "Status de regularização e titularidade",
  },
  {
    id: "manutencao",
    title: "Manutenção e Vistorias",
    description: "Histórico de intervenções e vistorias",
  },
  {
    id: "patrimonio",
    title: "Patrimônio Histórico",
    description: "Bens tombados e protegidos",
  },
];

const recentReports = [
  {
    id: 1,
    name: "Inventário Patrimonial - Janeiro 2026",
    date: "17/02/2026",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Pendências - Fevereiro 2026",
    date: "15/02/2026",
    size: "856 KB",
  },
  {
    id: 3,
    name: "Relatório de Ocupação - Anual 2025",
    date: "10/02/2026",
    size: "3.1 MB",
  },
];