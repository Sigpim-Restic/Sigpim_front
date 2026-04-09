import React, { useState } from "react";
import { Upload, Search, Download, Eye, FileText, Image, File, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const tipoIcon: Record<string, React.ReactNode> = {
  FOTO: <Image className="h-4 w-4 text-blue-500" />,
  PLANTA: <FileText className="h-4 w-4 text-purple-500" />,
  MATRICULA: <FileText className="h-4 w-4 text-green-500" />,
  CONTRATO: <FileText className="h-4 w-4 text-orange-500" />,
  OUTRO: <File className="h-4 w-4 text-gray-400" />,
};

const mock = [
  { id: 1, imovel: "SIGPIM-000001", tipo: "MATRICULA", descricao: "Matrícula nº 45.231 — Cartório 2º RI", data: "2024-01-10", validacao: "VALIDADO", tamanho: "420 KB", mime: "PDF" },
  { id: 2, imovel: "SIGPIM-000001", tipo: "FOTO", descricao: "Fachada principal — foto de campo", data: "2024-01-08", validacao: "VALIDADO", tamanho: "2.1 MB", mime: "JPEG" },
  { id: 3, imovel: "SIGPIM-000045", tipo: "CONTRATO", descricao: "Contrato de locação nº 012/2023", data: "2023-03-01", validacao: "PENDENTE", tamanho: "890 KB", mime: "PDF" },
  { id: 4, imovel: "SIGPIM-000046", tipo: "PLANTA", descricao: "Planta baixa — térreo", data: "2023-11-15", validacao: "PENDENTE", tamanho: "5.4 MB", mime: "PDF" },
  { id: 5, imovel: "SIGPIM-000042", tipo: "FOTO", descricao: "Vista aérea — levantamento drone", data: "2024-02-20", validacao: "REJEITADO", tamanho: "8.2 MB", mime: "JPEG" },
];

const valCfg: Record<string, { cls: string; icon: React.ReactNode }> = {
  VALIDADO: { cls: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-3 w-3" /> },
  PENDENTE: { cls: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> },
  REJEITADO: { cls: "bg-red-100 text-red-800", icon: <XCircle className="h-3 w-3" /> },
};

export function ListaDocumentos() {
  const [search, setSearch] = useState("");
  const filtered = mock.filter((d) => !search || [d.imovel, d.tipo, d.descricao].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">Gestão de documentos e anexos dos imóveis</p>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
          <Upload className="mr-2 h-4 w-4" />Anexar Documento
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Buscar por imóvel, tipo ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Imóvel</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs">Formato</TableHead>
                <TableHead className="text-xs">Tamanho</TableHead>
                <TableHead className="text-xs">Validação</TableHead>
                <TableHead className="text-right text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => {
                const vc = valCfg[d.validacao] || valCfg.PENDENTE;
                return (
                  <TableRow key={d.id} className="hover:bg-gray-50/80">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tipoIcon[d.tipo] || tipoIcon.OUTRO}
                        <span className="text-xs text-gray-600">{d.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-[#1351B4]">{d.imovel}</TableCell>
                    <TableCell className="text-sm text-gray-700">{d.descricao}</TableCell>
                    <TableCell className="text-xs text-gray-500">{d.data}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{d.mime}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500">{d.tamanho}</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit text-xs ${vc.cls}`} variant="secondary">
                        {vc.icon}{d.validacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
