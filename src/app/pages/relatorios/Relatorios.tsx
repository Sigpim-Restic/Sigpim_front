import React, { useState } from "react";
import { FileText, Building2, ClipboardList, History } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const tiposRelatorio = [
  { id: "FICHA_IMOVEL",        title: "Ficha do Imóvel",        desc: "Relatório completo de um imóvel com localização, dados físicos, ocupação e documentos.", icon: Building2,    cor: "bg-blue-50 text-[#1351B4]" },
  { id: "LISTA_IMOVEIS",       title: "Lista de Imóveis",       desc: "Listagem filtrada do acervo patrimonial com status, tipo e órgão gestor.",               icon: FileText,     cor: "bg-green-50 text-green-600" },
  { id: "RELATORIO_OCUPACAO",  title: "Relatório de Ocupação",  desc: "Situação de uso e responsáveis dos imóveis por secretaria e período.",                   icon: ClipboardList, cor: "bg-purple-50 text-purple-600" },
  { id: "HISTORICO_AUDITORIA", title: "Histórico de Auditoria", desc: "Log de alterações realizadas por usuário, período e entidade.",                          icon: History,      cor: "bg-orange-50 text-orange-600" },
];

export function Relatorios() {
  const [selected, setSelected] = useState("");
  const [filtros, setFiltros] = useState({ periodo_ini: "", periodo_fim: "", orgao: "", status: "" });

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Geração de relatórios gerenciais e operacionais do SIGPIM</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiposRelatorio.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.id} onClick={() => setSelected(t.id)}
              className={`cursor-pointer p-5 transition-all hover:shadow-md ${selected === t.id ? "ring-2 ring-[#1351B4] border-[#1351B4]" : ""}`}>
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${t.cor.split(" ")[0]}`}>
                <Icon className={`h-5 w-5 ${t.cor.split(" ")[1]}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t.desc}</p>
            </Card>
          );
        })}
      </div>

      {selected && (
        <Card className="p-6">
          <h3 className="mb-5 text-sm font-semibold text-gray-900">
            Configurar: {tiposRelatorio.find(t => t.id === selected)?.title}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Data inicial</Label>
              <Input type="date" value={filtros.periodo_ini} onChange={e => setFiltros({ ...filtros, periodo_ini: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data final</Label>
              <Input type="date" value={filtros.periodo_fim} onChange={e => setFiltros({ ...filtros, periodo_fim: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Órgão gestor</Label>
              <Select value={filtros.orgao} onValueChange={v => setFiltros({ ...filtros, orgao: v })}>
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
              <Label className="text-xs">Status</Label>
              <Select value={filtros.status} onValueChange={v => setFiltros({ ...filtros, status: v })}>
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

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Relatórios Gerados Recentemente</h3>
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p>Nenhum relatório gerado ainda.</p>
          <p className="mt-1 text-xs">Selecione um tipo acima e clique em "Gerar Relatório".</p>
        </div>
      </div>
    </div>
  );
}
