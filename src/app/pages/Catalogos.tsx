import React, { useState } from "react";
import { Database, Search, Plus, Edit2, Check, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const dominios = [
  { codigo: "TIPOLOGIA", nome: "Tipologias de Imóvel", desc: "Classificação funcional do imóvel.", itens: ["Administrativo", "Saúde", "Educação", "Segurança Pública", "Cultura e Patrimônio", "Logística e Armazenagem", "Residencial Funcional", "Outro"] },
  { codigo: "CATEGORIA_MACRO", nome: "Categorias Macro", desc: "Agrupamento estratégico do imóvel.", itens: ["Uso próprio", "Cedido a terceiros", "Imóvel locado", "Sem uso definido"] },
  { codigo: "TIPO_DOCUMENTO", nome: "Tipos de Documento", desc: "Classificação dos anexos e evidências.", itens: ["Matrícula do Imóvel", "Planta Baixa", "Fotografia", "Laudo Técnico", "Contrato", "Decreto / Ato", "Certidão", "Outro"] },
  { codigo: "FONTE_GEOMETRIA", nome: "Fontes de Geometria", desc: "Origem do dado georreferenciado.", itens: ["GPS em campo", "Planta cadastral", "Imagem de satélite", "Levantamento por drone", "Carta georeferenciada"] },
  { codigo: "TIPO_RELATORIO", nome: "Tipos de Relatório", desc: "Modelos de relatórios disponíveis.", itens: ["Ficha do Imóvel", "Lista de Imóveis", "Relatório de Ocupação"] },
  { codigo: "ESTADO_CONSERVACAO", nome: "Estados de Conservação", desc: "Nível de conservação físico do imóvel.", itens: ["Ótimo", "Bom", "Regular", "Ruim", "Péssimo"] },
];

export function Catalogos() {
  const [search, setSearch] = useState("");
  const filtered = dominios.filter((d) => !search || [d.codigo, d.nome, d.desc, ...d.itens].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Catálogos administrativos — valores configuráveis pelos administradores do sistema
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Buscar domínio ou valor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
          <Plus className="mr-2 h-4 w-4" />Novo Domínio
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((d) => (
          <Card key={d.codigo} className="overflow-hidden">
            <CardHeader className="bg-gray-50 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#1351B4]" />
                  <div>
                    <CardTitle className="text-sm font-semibold text-gray-900">{d.nome}</CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{d.desc}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-xs shrink-0">{d.codigo}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-wrap gap-2">
                {d.itens.map((item) => (
                  <div key={item} className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-[#1351B4] hover:bg-blue-50 transition-colors cursor-default group">
                    <Check className="h-3 w-3 text-green-500" />
                    {item}
                    <button className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 className="h-2.5 w-2.5 text-gray-400 hover:text-[#1351B4]" />
                    </button>
                  </div>
                ))}
                <button className="flex items-center gap-1 rounded-md border border-dashed border-gray-300 px-2.5 py-1 text-xs text-gray-400 hover:border-[#1351B4] hover:text-[#1351B4] transition-colors">
                  <Plus className="h-3 w-3" />Adicionar
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-400">{d.itens.length} valores cadastrados</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
