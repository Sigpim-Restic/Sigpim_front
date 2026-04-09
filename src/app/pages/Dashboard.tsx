import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Building2, ClipboardList, FolderOpen, FileText, Map, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { imoveisApi } from "../api/imoveis";
import { ocupacoesApi } from "../api/ocupacoes";

export function Dashboard() {
  const [totalImoveis,   setTotalImoveis]   = useState<number | null>(null);
  const [totalOcupacoes, setTotalOcupacoes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      imoveisApi.listar(0, 1),
      ocupacoesApi.listar(0, 1),
    ]).then(([im, oc]) => {
      if (im.status === "fulfilled") setTotalImoveis(im.value.totalElements);
      if (oc.status === "fulfilled") setTotalOcupacoes(oc.value.totalElements);
      setLoading(false);
    });
  }, []);

  const fmt = (n: number | null) =>
    loading ? "..." : n !== null ? n.toLocaleString("pt-BR") : "—";

  const stats = [
    { label: "Imóveis Cadastrados", value: fmt(totalImoveis),   icon: Building2,   color: "text-[#1351B4]",  bg: "bg-blue-50",   sub: "total no sistema" },
    { label: "Ocupações Ativas",    value: fmt(totalOcupacoes), icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50", sub: "registradas" },
    { label: "Pré-cadastro",        value: "—",                 icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50", sub: "aguardando validação" },
    { label: "Validados",           value: "—",                 icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  sub: "do acervo" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {loading && s.value === "..."
                      ? <RefreshCw className="h-5 w-5 animate-spin text-gray-300 mt-1" />
                      : s.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ações rápidas */}
        <Card className="p-5 lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Ações Rápidas</h3>
          <div className="space-y-2">
            <Link to="/imoveis/novo/etapa-1">
              <Button className="w-full justify-start bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Building2 className="mr-2 h-4 w-4" /> Novo Imóvel
              </Button>
            </Link>
            <Link to="/ocupacoes">
              <Button variant="outline" className="w-full justify-start border-[#1351B4] text-[#1351B4] hover:bg-blue-50">
                <ClipboardList className="mr-2 h-4 w-4" /> Ver Ocupações
              </Button>
            </Link>
            <Link to="/documentos">
              <Button variant="outline" className="w-full justify-start">
                <FolderOpen className="mr-2 h-4 w-4" /> Ver Documentos
              </Button>
            </Link>
            <Link to="/relatorios">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" /> Relatórios
              </Button>
            </Link>
            <Link to="/mapa">
              <Button variant="outline" className="w-full justify-start">
                <Map className="mr-2 h-4 w-4" /> Abrir Mapa GIS
              </Button>
            </Link>
          </div>
        </Card>

        {/* Resumo */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Resumo do Acervo</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">Carregando dados do banco...</span>
            </div>
          ) : totalImoveis === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <Building2 className="mb-2 h-8 w-8" />
              <p className="text-sm font-medium">Nenhum imóvel cadastrado ainda</p>
              <p className="mt-1 text-xs">Comece o cadastro do acervo patrimonial.</p>
              <Link to="/imoveis/novo/etapa-1" className="mt-3">
                <Button size="sm" className="bg-[#1351B4] hover:bg-[#0c3b8d]">Cadastrar primeiro imóvel</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-xs text-gray-500">Total de imóveis</p>
                  <p className="text-2xl font-bold text-[#1351B4]">{totalImoveis?.toLocaleString("pt-BR")}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="text-xs text-gray-500">Total de ocupações</p>
                  <p className="text-2xl font-bold text-purple-600">{totalOcupacoes?.toLocaleString("pt-BR")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to="/imoveis">
                  <Button size="sm" variant="outline" className="text-xs">Ver todos os imóveis</Button>
                </Link>
                <Link to="/ocupacoes">
                  <Button size="sm" variant="outline" className="text-xs">Ver todas as ocupações</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
