import React, { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Building2, CheckCircle2, Clock, AlertCircle, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const mock = [
  { id: 1, imovel: "SIGPIM-000001", nome: "Edifício Sede SEMAD", orgao: "SEMAD", unidade: "Coordenação de Bens Patrimoniais", responsavel: "Maria Silva", status: "OCUPADO", nivel: "TOTAL", inicio: "2020-01-15", instrumento: "Cessão de Uso" },
  { id: 2, imovel: "SIGPIM-000045", nome: "UBS Cohama", orgao: "SEMUS", unidade: "Atenção Básica", responsavel: "João Santos", status: "OCUPADO", nivel: "TOTAL", inicio: "2019-03-01", instrumento: "Contrato de Locação" },
  { id: 3, imovel: "SIGPIM-000046", nome: "Escola Municipal Turu", orgao: "SEMED", unidade: "Gestão Escolar", responsavel: "Ana Costa", status: "OCUPADO", nivel: "TOTAL", inicio: "2018-07-20", instrumento: "Cessão de Uso" },
  { id: 4, imovel: "SIGPIM-000044", nome: "Terreno Renascença", orgao: "-", unidade: "-", responsavel: "-", status: "DESOCUPADO", nivel: "-", inicio: "-", instrumento: "-" },
  { id: 5, imovel: "SIGPIM-000042", nome: "Parque do Bom Menino", orgao: "SEINFRA", unidade: "Parques e Jardins", responsavel: "Carlos Lima", status: "OCUPADO", nivel: "PARCIAL", inicio: "2021-05-10", instrumento: "Termo de Outorga" },
];

const statusCfg: Record<string, string> = {
  OCUPADO: "bg-green-100 text-green-800",
  DESOCUPADO: "bg-gray-100 text-gray-600",
  DESCONHECIDO: "bg-yellow-100 text-yellow-800",
};

export function ListaOcupacoes() {
  const [search, setSearch] = useState("");
  const filtered = mock.filter((o) => !search || [o.imovel, o.nome, o.orgao, o.responsavel].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">Histórico e situação atual de ocupação dos imóveis</p>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
          <Plus className="mr-2 h-4 w-4" />Nova Ocupação
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar por imóvel, órgão ou responsável..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Ocupados", value: mock.filter(o => o.status === "OCUPADO").length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Desocupados", value: mock.filter(o => o.status === "DESOCUPADO").length, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "Sem instrumento formal", value: 2, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">Imóvel</TableHead>
                <TableHead className="text-xs">Órgão Ocupante</TableHead>
                <TableHead className="text-xs">Responsável Local</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Nível</TableHead>
                <TableHead className="text-xs">Instrumento</TableHead>
                <TableHead className="text-xs">Início</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className="hover:bg-gray-50/80">
                  <TableCell>
                    <p className="font-mono text-xs font-semibold text-[#1351B4]">{o.imovel}</p>
                    <p className="text-xs text-gray-500">{o.nome}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{o.orgao}</p>
                    <p className="text-xs text-gray-500">{o.unidade}</p>
                  </TableCell>
                  <TableCell className="text-sm">{o.responsavel}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${statusCfg[o.status] || ""}`}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">{o.nivel}</TableCell>
                  <TableCell className="text-xs text-gray-600">{o.instrumento}</TableCell>
                  <TableCell className="text-xs text-gray-600">{o.inicio}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
