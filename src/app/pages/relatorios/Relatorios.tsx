import React, { useState } from "react";
import { FileText, Download, Filter, Building2, ClipboardList, History, BarChart3 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";

const tiposRelatorio = [
  { id: "FICHA_IMOVEL", title: "Ficha do Imóvel", desc: "Relatório completo de um imóvel com localização, dados físicos, ocupação e documentos.", icon: Building2, cor: "bg-blue-50 text-[#1351B4]" },
  { id: "LISTA_IMOVEIS", title: "Lista de Imóveis", desc: "Listagem filtrada do acervo patrimonial com status, tipo e órgão gestor.", icon: FileText, cor: "bg-green-50 text-green-600" },
  { id: "RELATORIO_OCUPACAO", title: "Relatório de Ocupação", desc: "Situação de uso e responsáveis dos imóveis por secretaria e período.", icon: ClipboardList, cor: "bg-purple-50 text-purple-600" },
  { id: "HISTORICO_AUDITORIA", title: "Histórico de Auditoria", desc: "Log de alterações realizadas por usuário, período e entidade.", icon: History, cor: "bg-orange-50 text-orange-600" },
];

const gerados = [
  { id: 1, tipo: "Ficha do Imóvel", filtros: "SIGPIM-000001", data: "06/04/2026 14:32", user: "Maria Silva", status: "GERADO" },
  { id: 2, tipo: "Lista de Imóveis", filtros: "Status: Validado | Órgão: SEMAD", data: "06/04/2026 11:15", user: "João Costa", status: "GERADO" },
  { id: 3, tipo: "Relatório de Ocupação", filtros: "Período: Jan-Mar 2026", data: "05/04/2026 16:00", user: "Ana Souza", status: "GERADO" },
  { id: 4, tipo: "Lista de Imóveis", filtros: "Tipo: Locado | Status: Pré-cadastro", data: "04/04/2026 09:20", user: "Carlos Lima", status: "GERADO" },
];

export function Relatorios() {
  const [selected, setSelected] = useState("");
  const [filtros, setFiltros] = useState({ periodo_ini: "", periodo_fim: "", orgao: "", status: "" });

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Geração de relatórios gerenciais e operacionais do SIGPIM</p>

      {/* Tipos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiposRelatorio.map((t) => {
          const Icon = t.icon;
          return (
            <Card
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`cursor-pointer p-5 transition-all hover:shadow-md ${selected === t.id ? "ring-2 ring-[#1351B4] border-[#1351B4]" : ""}`}
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${t.cor.split(" ")[0]}`}>
                <Icon className={`h-5 w-5 ${t.cor.split(" ")[1]}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Config */}
      {selected && (
        <Card className="p-6">
          <h3 className="mb-5 text-sm font-semibold text-gray-900">
            Configurar: {tiposRelatorio.find((t) => t.id === selected)?.title}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Data inicial</Label>
              <Input type="date" value={filtros.periodo_ini} onChange={(e) => setFiltros({ ...filtros, periodo_ini: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data final</Label>
              <Input type="date" value={filtros.periodo_fim} onChange={(e) => setFiltros({ ...filtros, periodo_fim: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Órgão gestor</Label>
              <Select value={filtros.orgao} onValueChange={(v) => setFiltros({ ...filtros, orgao: v })}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="SEMAD">SEMAD</SelectItem>
                  <SelectItem value="SEMED">SEMED</SelectItem>
                  <SelectItem value="SEMUS">SEMUS</SelectItem>
                  <SelectItem value="SEINFRA">SEINFRA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status do imóvel</Label>
              <Select value={filtros.status} onValueChange={(v) => setFiltros({ ...filtros, status: v })}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="VALIDADO">Validado</SelectItem>
                  <SelectItem value="PRE_CADASTRO">Pré-cadastro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
              <FileText className="mr-2 h-4 w-4" />Gerar Relatório
            </Button>
            <Button variant="outline" onClick={() => setSelected("")}>Cancelar</Button>
          </div>
        </Card>
      )}

      {/* Histórico */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Relatórios Gerados Recentemente</h3>
        <div className="space-y-2">
          {gerados.map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-[#1351B4]" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{g.tipo}</p>
                  <p className="text-xs text-gray-500">{g.filtros} · {g.data} · {g.user}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 text-xs" variant="secondary">{g.status}</Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
