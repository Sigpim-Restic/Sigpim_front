import React, { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const acaoConfig: Record<string, string> = {
  CRIACAO: "bg-green-100 text-green-800",
  ATUALIZACAO: "bg-blue-100 text-blue-800",
  EXCLUSAO: "bg-red-100 text-red-800",
  VALIDACAO: "bg-purple-100 text-purple-800",
  LOGIN: "bg-gray-100 text-gray-700",
  EXPORTACAO: "bg-orange-100 text-orange-800",
};

const mock = [
  { id: 1, tabela: "imoveis", registro: "SIGPIM-001249", acao: "CRIACAO", usuario: "Maria Silva", perfil: "Adm. Patrimonial", ip: "192.168.1.42", data: "06/04/2026 14:32:01", descricao: "Pré-cadastro do imóvel Escola Municipal Turu" },
  { id: 2, tabela: "localizacoes", registro: "SIGPIM-000892", acao: "ATUALIZACAO", usuario: "João Costa", perfil: "Cadastrador Setorial", ip: "10.0.0.15", data: "06/04/2026 11:14:33", descricao: "Atualização de coordenadas e geometria GIS" },
  { id: 3, tabela: "ocupacoes", registro: "SIGPIM-000045", acao: "CRIACAO", usuario: "Ana Souza", perfil: "Cadastrador Setorial", ip: "10.0.0.8", data: "06/04/2026 10:50:12", descricao: "Registro de nova ocupação — órgão: SEMUS" },
  { id: 4, tabela: "imoveis", registro: "SIGPIM-000741", acao: "VALIDACAO", usuario: "Carlos Lima", perfil: "Adm. Patrimonial", ip: "192.168.1.10", data: "05/04/2026 16:22:45", descricao: "Status atualizado para VALIDADO" },
  { id: 5, tabela: "documentos", registro: "SIGPIM-000512", acao: "CRIACAO", usuario: "Maria Silva", perfil: "Adm. Patrimonial", ip: "192.168.1.42", data: "05/04/2026 14:05:00", descricao: "Upload de matrícula nº 45.231" },
  { id: 6, tabela: "usuarios", registro: "usr-021", acao: "LOGIN", usuario: "Paulo Neto", perfil: "Auditor", ip: "172.16.0.5", data: "05/04/2026 08:30:11", descricao: "Login realizado com sucesso" },
  { id: 7, tabela: "relatorios_gerados", registro: "rel-089", acao: "EXPORTACAO", usuario: "Ana Souza", perfil: "Cadastrador Setorial", ip: "10.0.0.8", data: "04/04/2026 16:00:22", descricao: "Exportação: Relatório de Ocupação Jan-Mar 2026" },
  { id: 8, tabela: "imoveis", registro: "SIGPIM-000050", acao: "EXCLUSAO", usuario: "Maria Silva", perfil: "Adm. Patrimonial", ip: "192.168.1.42", data: "04/04/2026 09:10:05", descricao: "Soft delete — motivo: ERRO_CADASTRO" },
];

export function Auditoria() {
  const [search, setSearch] = useState("");
  const [filterAcao, setFilterAcao] = useState("todas");
  const [filterTabela, setFilterTabela] = useState("todas");

  const filtered = mock.filter((l) => {
    const s = !search || [l.tabela, l.registro, l.usuario, l.descricao].join(" ").toLowerCase().includes(search.toLowerCase());
    const a = filterAcao === "todas" || l.acao === filterAcao;
    const t = filterTabela === "todas" || l.tabela === filterTabela;
    return s && a && t;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">Trilha completa de auditoria — quem fez o quê, quando e de onde</p>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />Exportar Log
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar por registro, usuário ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterAcao} onValueChange={setFilterAcao}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as ações</SelectItem>
            <SelectItem value="CRIACAO">Criação</SelectItem>
            <SelectItem value="ATUALIZACAO">Atualização</SelectItem>
            <SelectItem value="EXCLUSAO">Exclusão</SelectItem>
            <SelectItem value="VALIDACAO">Validação</SelectItem>
            <SelectItem value="LOGIN">Login</SelectItem>
            <SelectItem value="EXPORTACAO">Exportação</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTabela} onValueChange={setFilterTabela}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as tabelas</SelectItem>
            <SelectItem value="imoveis">Imóveis</SelectItem>
            <SelectItem value="localizacoes">Localizações</SelectItem>
            <SelectItem value="ocupacoes">Ocupações</SelectItem>
            <SelectItem value="documentos">Documentos</SelectItem>
            <SelectItem value="usuarios">Usuários</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">Data/Hora</TableHead>
                <TableHead className="text-xs">Ação</TableHead>
                <TableHead className="text-xs">Tabela</TableHead>
                <TableHead className="text-xs">Registro</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">IP</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">{l.data}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${acaoConfig[l.acao] || "bg-gray-100 text-gray-700"}`} variant="secondary">
                      {l.acao}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-600">{l.tabela}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-[#1351B4]">{l.registro}</TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-gray-900">{l.usuario}</p>
                    <p className="text-xs text-gray-400">{l.perfil}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">{l.ip}</TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-xs truncate">{l.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="border-t px-6 py-3">
          <p className="text-xs text-gray-500">Exibindo {filtered.length} de {mock.length} registros</p>
        </div>
      </div>
    </div>
  );
}
