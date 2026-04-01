import React from "react";
import { Link } from "react-router";
import {
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  MapPin,
} from "lucide-react";
import { StatCard } from "../components/layout/States";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Imóveis"
          value="1.247"
          icon={<Building2 className="h-6 w-6 text-[#1351B4]" />}
          trend={{ value: "+12% este mês", isPositive: true }}
        />
        <StatCard
          label="Pendências Ativas"
          value="12"
          icon={<AlertCircle className="h-6 w-6 text-yellow-600" />}
          variant="warning"
        />
        <StatCard
          label="Cadastros Completos"
          value="1.189"
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          variant="success"
        />
        <StatCard
          label="Em Análise"
          value="46"
          icon={<Clock className="h-6 w-6 text-blue-600" />}
          variant="primary"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Ações Rápidas
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/imoveis/novo/etapa-1">
            <Button className="h-auto w-full flex-col gap-2 py-6 bg-[#1351B4] hover:bg-[#0c3b8d]">
              <Building2 className="h-6 w-6" />
              <span>Cadastrar Imóvel</span>
            </Button>
          </Link>
          <Link to="/usuarios/novo">
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-6 border-[#1351B4] text-[#1351B4] hover:bg-blue-50"
            >
              <Users className="h-6 w-6" />
              <span>Novo Usuário</span>
            </Button>
          </Link>
          <Link to="/relatorios">
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-6"
            >
              <FileText className="h-6 w-6" />
              <span>Gerar Relatório</span>
            </Button>
          </Link>
          <Link to="/mapa-gis">
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-6"
            >
              <MapPin className="h-6 w-6" />
              <span>Visualizar Mapa</span>
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Atividades Recentes
            </h3>
            <Link to="/imoveis">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-l-2 border-gray-200 pl-4 py-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <Building2 className="h-4 w-4 text-[#1351B4]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user} • {activity.time}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.status === "concluído"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    activity.status === "concluído"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : ""
                  }
                >
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Items */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Pendências Prioritárias
            </h3>
            <Link to="/pendencias">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {item.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Vence em {item.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Statistics Chart Placeholder */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Cadastros por Mês
        </h3>
        <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 border-2 border-dashed border-gray-300">
          <div className="text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Gráfico de tendências de cadastros
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

const recentActivities = [
  {
    id: 1,
    title: "Imóvel #IMO-2026-0047 cadastrado",
    user: "Carlos Santos",
    time: "há 15 minutos",
    status: "concluído",
  },
  {
    id: 2,
    title: "Documentação anexada ao Imóvel #IMO-2026-0046",
    user: "Ana Paula",
    time: "há 1 hora",
    status: "concluído",
  },
  {
    id: 3,
    title: "Vistoria agendada para Imóvel #IMO-2026-0045",
    user: "João Oliveira",
    time: "há 2 horas",
    status: "em andamento",
  },
  {
    id: 4,
    title: "Novo usuário cadastrado - Pedro Costa",
    user: "Maria Silva",
    time: "há 3 horas",
    status: "concluído",
  },
];

const pendingItems = [
  {
    id: 1,
    title: "Documentação incompleta - Imóvel #IMO-2026-0042",
    description: "Faltam certidões de regularização dominial",
    category: "Documentação",
    dueDate: "3 dias",
  },
  {
    id: 2,
    title: "Validação de coordenadas GIS pendente",
    description: "5 im��veis aguardando validação georreferenciada",
    category: "GIS",
    dueDate: "5 dias",
  },
  {
    id: 3,
    title: "Análise de patrimônio histórico em atraso",
    description: "Imóvel #IMO-2026-0038 aguarda parecer técnico",
    category: "Patrimônio",
    dueDate: "2 dias",
  },
];
