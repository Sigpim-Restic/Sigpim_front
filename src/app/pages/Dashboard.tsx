import React from "react";
import { Link } from "react-router";
import { Building2, ClipboardList, FolderOpen, FileText, History, Map, AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const stats = [
  { label: "Imóveis Cadastrados", value: "1.247", icon: Building2, color: "text-[#1351B4]", bg: "bg-blue-50", sub: "+12 este mês" },
  { label: "Validados", value: "891", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", sub: "71% do total" },
  { label: "Pré-cadastro", value: "356", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", sub: "Aguardando validação" },
  { label: "Ocupações Ativas", value: "734", icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50", sub: "58% dos imóveis" },
];

const atividades = [
  { tipo: "Imóvel cadastrado", desc: "Escola Municipal Turu — SIGPIM-001248", tempo: "há 5 min", user: "Maria Silva", cor: "bg-blue-500" },
  { tipo: "Documento anexado", desc: "Matrícula nº 45.231 — SIGPIM-000892", tempo: "há 23 min", user: "João Costa", cor: "bg-green-500" },
  { tipo: "Ocupação registrada", desc: "UBS Cohama — Órgão: SEMUS", tempo: "há 1h", user: "Ana Souza", cor: "bg-purple-500" },
  { tipo: "Status atualizado", desc: "SIGPIM-000741 → Validado", tempo: "há 2h", user: "Carlos Lima", cor: "bg-yellow-500" },
  { tipo: "Relatório gerado", desc: "Ficha do Imóvel — SIGPIM-000512", tempo: "há 3h", user: "Maria Silva", cor: "bg-gray-400" },
];

export function Dashboard() {
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
                  <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
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
        {/* Quick actions */}
        <Card className="p-5 lg:col-span-1">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Ações Rápidas</h3>
          <div className="space-y-2">
            <Link to="/imoveis/novo/etapa-1">
              <Button className="w-full justify-start bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Building2 className="mr-2 h-4 w-4" /> Novo Imóvel
              </Button>
            </Link>
            <Link to="/ocupacoes/nova">
              <Button variant="outline" className="w-full justify-start border-[#1351B4] text-[#1351B4] hover:bg-blue-50">
                <ClipboardList className="mr-2 h-4 w-4" /> Nova Ocupação
              </Button>
            </Link>
            <Link to="/documentos/upload">
              <Button variant="outline" className="w-full justify-start">
                <FolderOpen className="mr-2 h-4 w-4" /> Anexar Documento
              </Button>
            </Link>
            <Link to="/relatorios">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" /> Gerar Relatório
              </Button>
            </Link>
            <Link to="/mapa">
              <Button variant="outline" className="w-full justify-start">
                <Map className="mr-2 h-4 w-4" /> Abrir Mapa GIS
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Atividade Recente</h3>
            <Link to="/auditoria">
              <Button variant="ghost" size="sm" className="text-xs text-[#1351B4]">Ver tudo</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {atividades.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${a.cor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900">{a.tipo}</p>
                  <p className="truncate text-xs text-gray-500">{a.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{a.tempo}</p>
                  <p className="text-xs text-gray-500">{a.user}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Status distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Distribuição por Tipo</h3>
          <div className="space-y-3">
            {[
              { label: "Próprio", value: 768, pct: 62, color: "bg-[#1351B4]" },
              { label: "Locado", value: 312, pct: 25, color: "bg-blue-300" },
              { label: "Incerto", value: 167, pct: 13, color: "bg-gray-300" },
            ].map((t) => (
              <div key={t.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{t.label}</span><span>{t.value} ({t.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className={`h-2 rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Alertas do Sistema</h3>
          <div className="space-y-3">
            {[
              { label: "Imóveis sem localização GIS", count: 89, cor: "text-red-600 bg-red-50" },
              { label: "Ocupações sem instrumento", count: 43, cor: "text-yellow-700 bg-yellow-50" },
              { label: "Documentos pendentes de validação", count: 127, cor: "text-blue-700 bg-blue-50" },
              { label: "Imóveis em pré-cadastro há +30 dias", count: 21, cor: "text-gray-700 bg-gray-50" },
            ].map((a) => (
              <div key={a.label} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${a.cor}`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{a.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{a.count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
