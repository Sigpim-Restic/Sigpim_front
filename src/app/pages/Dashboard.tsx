import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Building2, ClipboardList, FolderOpen, FileText, Map,
  CheckCircle2, Clock, RefreshCw, AlertCircle, AlertTriangle,
  Wrench, ShieldCheck, TrendingUp, MapPin,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { dashboardApi, type DashboardIndicadores } from "../api/dashboard";

// ─── Cores e helpers ──────────────────────────────────────────────────────────

const AZUL     = "#1351B4";
const VERDE    = "#16a34a";
const AMARELO  = "#ca8a04";
const LARANJA  = "#ea580c";
const VERMELHO = "#dc2626";
const CINZA    = "#9ca3af";

const COR_RISCO: Record<string, string> = {
  BAIXO:   VERDE,
  MEDIO:   AMARELO,
  ALTO:    LARANJA,
  CRITICO: VERMELHO,
};

const COR_CONSERVACAO: Record<string, string> = {
  OTIMO:   VERDE,
  BOM:     "#4ade80",
  REGULAR: AMARELO,
  RUIM:    LARANJA,
  PESSIMO: VERMELHO,
};

const LABEL_CONSERVACAO: Record<string, string> = {
  OTIMO: "Ótimo", BOM: "Bom", REGULAR: "Regular",
  RUIM: "Ruim",  PESSIMO: "Péssimo",
};

function pct(valor: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((valor / total) * 100)}%`;
}

function fmt(n: number | undefined | null): string {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR");
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, color, bg, link,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; bg: string;
  link?: string;
}) {
  const inner = (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </Card>
  );
  return link ? <Link to={link} className="block">{inner}</Link> : inner;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-gray-700 border-l-4 border-[#1351B4] pl-3">
      {children}
    </h2>
  );
}

function Semaforo({ label, valor, total, cor }: {
  label: string; valor: number; total: number; cor: string;
}) {
  const p = total > 0 ? (valor / total) * 100 : 0;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: cor }} />
        </div>
        <span className="text-xs font-semibold text-gray-800 w-8 text-right">{fmt(valor)}</span>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Dashboard() {
  const [dados,    setDados]    = useState<DashboardIndicadores | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState<string | null>(null);
  const [periodo,  setPeriodo]  = useState<1 | 3 | 6>(1);

  const carregar = async () => {
    setLoading(true); setErro(null);
    try {
      setDados(await dashboardApi.indicadores());
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar indicadores.");
    } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="h-6 w-6 animate-spin text-[#1351B4]" />
    </div>
  );

  if (erro) return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{erro}</div>
      <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>
        Tentar novamente
      </Button>
    </div>
  );

  const d = dados!;
  const total = d.totalImoveis;

  // Dados para gráficos
  const dadosStatus = [
    { name: "Pré-cadastro", value: d.imoveisPreCadastro,   fill: AMARELO },
    { name: "Validado",     value: d.imoveisValidados,     fill: AZUL },
    { name: "Gestão Plena", value: d.imoveisGestaoplena,   fill: VERDE },
  ].filter((e) => e.value > 0);

  const dadosGis = [
    { name: "Validado",     value: d.imoveisGisValidado,   fill: VERDE },
    { name: "Conflito",     value: d.imoveisGisConflito,   fill: LARANJA },
    { name: "Não validado", value: d.imoveisGisNaoValidado, fill: AMARELO },
    { name: "Sem GIS",      value: d.imoveisSemGis,         fill: CINZA },
  ].filter((e) => e.value > 0);

  const dadosRisco = [
    { name: "Baixo",   value: d.imoveisRiscoBaixo,   fill: VERDE },
    { name: "Médio",   value: d.imoveisRiscoMedio,   fill: AMARELO },
    { name: "Alto",    value: d.imoveisRiscoAlto,    fill: LARANJA },
    { name: "Crítico", value: d.imoveisRiscoCritico, fill: VERMELHO },
    { name: "Sem vistoria", value: d.imoveisSemVistoria, fill: CINZA },
  ].filter((e) => e.value > 0);

  const dadosIntervencoes = [
    { name: "Planejada",      value: d.intervencoesPlanejadas },
    { name: "Em Contratação", value: d.intervencoesEmContratacao },
    { name: "Ag. Parecer",    value: d.intervencoesAguardandoParecer },
    { name: "Em Execução",    value: d.intervencoesEmExecucao },
    { name: "Concluída",      value: d.intervencoesConcluidas },
    { name: "Cancelada",      value: d.intervencoesCanceladas },
  ].filter((e) => e.value > 0);

  const dadosConservacao = d.distribuicaoConservacao.map((c) => ({
    name: LABEL_CONSERVACAO[c.estadoConservacao] ?? c.estadoConservacao,
    value: c.quantidade,
    fill: COR_CONSERVACAO[c.estadoConservacao] ?? CINZA,
  }));

  return (
    <div className="space-y-6">

      {/* Botão atualizar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Indicadores calculados em tempo real</p>
        <Button variant="outline" size="sm" onClick={carregar} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* ── KPIs principais ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Imóveis Cadastrados" value={fmt(total)}
          sub="total no sistema" icon={Building2}
          color="text-[#1351B4]" bg="bg-blue-50" link="/dashboard/imoveis" />
        <KpiCard label="Ocupações" value={fmt(d.totalOcupacoes)}
          sub="registradas" icon={ClipboardList}
          color="text-purple-600" bg="bg-purple-50" link="/dashboard/ocupacoes" />
        <KpiCard label="Documentos" value={fmt(d.totalDocumentos)}
          sub="anexados" icon={FolderOpen}
          color="text-orange-600" bg="bg-orange-50" link="/dashboard/documentos" />
        <KpiCard label="Alertas não lidos" value={fmt(d.alertasNaoLidos)}
          sub={`de ${fmt(d.totalAlertas)} total`} icon={AlertTriangle}
          color={d.alertasNaoLidos > 0 ? "text-red-600" : "text-green-600"}
          bg={d.alertasNaoLidos > 0 ? "bg-red-50" : "bg-green-50"} />
      </div>

      {/* ── Status de cadastro + Tendência ────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Pizza — status */}
        <Card className="p-5">
          <SectionTitle>Status de Cadastro</SectionTitle>
          <div className="mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={dadosStatus} cx="50%" cy="50%" innerRadius={45}
                  outerRadius={70} paddingAngle={2} dataKey="value">
                  {dadosStatus.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [fmt(v), ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            <Semaforo label="Pré-cadastro" valor={d.imoveisPreCadastro} total={total} cor={AMARELO} />
            <Semaforo label="Validado"     valor={d.imoveisValidados}   total={total} cor={AZUL} />
            <Semaforo label="Gestão Plena" valor={d.imoveisGestaoplena} total={total} cor={VERDE} />
          </div>
        </Card>

        {/* Cadastros por período — com filtro */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Cadastros por Período</SectionTitle>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
              {([1, 3, 6] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    periodo === p
                      ? "bg-[#1351B4] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {p === 1 ? "Mês atual" : `${p} meses`}
                </button>
              ))}
            </div>
          </div>
          {(() => {
            // Fatia os dados conforme o período selecionado
            const fatia = d.cadastrosPorMes.slice(-periodo);
            if (fatia.length === 0) return (
              <div className="flex items-center justify-center h-36 text-sm text-gray-400">
                Nenhum dado disponível
              </div>
            );

            if (periodo === 1) {
              // Vista de mês atual: KPI grande + comparativo
              const atual = fatia[fatia.length - 1];
              const anterior = d.cadastrosPorMes.slice(-(periodo + 1), -1).pop();
              const qtd = atual?.quantidade ?? 0;
              const qtdAnt = anterior?.quantidade ?? 0;
              const delta = qtdAnt > 0 ? qtd - qtdAnt : null;
              const mesLabel = atual?.mesAno ?? "";
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-bold text-[#1351B4]">{fmt(qtd)}</p>
                    <div className="mb-1">
                      <p className="text-xs text-gray-500 capitalize">imóvel(is) em {mesLabel}</p>
                      {delta !== null && (
                        <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${delta >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {delta >= 0 ? "+" : ""}{delta} vs mês anterior
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Vista de 3 ou 6 meses: gráfico de barras
            const total = fatia.reduce((acc, m) => acc + m.quantidade, 0);
            return (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400">
                  Total no período: <span className="font-semibold text-gray-700">{fmt(total)}</span> cadastro(s)
                </p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={fatia} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <XAxis dataKey="mesAno" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [fmt(v), "Cadastros"]} />
                    <Bar dataKey="quantidade" fill={AZUL} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </Card>
      </div>

      {/* ── Indicadores do manual ─────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* GIS */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>GIS / Localização</SectionTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-3 flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold text-[#1351B4]">
              {Math.round(d.percentualGisValidado)}%
            </div>
            <div>
              <p className="text-xs text-gray-500">com GIS Validado</p>
              <p className="text-xs text-gray-400">{fmt(d.imoveisGisValidado)} de {fmt(total)} imóveis</p>
            </div>
          </div>
          <div className="space-y-1">
            <Semaforo label="✓ Validado"     valor={d.imoveisGisValidado}   total={total} cor={VERDE} />
            <Semaforo label="⚠ Conflito"     valor={d.imoveisGisConflito}   total={total} cor={LARANJA} />
            <Semaforo label="○ Não validado" valor={d.imoveisGisNaoValidado} total={total} cor={AMARELO} />
            <Semaforo label="— Sem GIS"      valor={d.imoveisSemGis}        total={total} cor={CINZA} />
          </div>
        </Card>

        {/* Dominial */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Situação Dominial</SectionTitle>
            <ShieldCheck className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-3 flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold text-[#1351B4]">
              {Math.round(d.percentualDominialDefinido)}%
            </div>
            <div>
              <p className="text-xs text-gray-500">com dominial definida</p>
              <p className="text-xs text-gray-400">{fmt(total - d.imoveisSemDominial)} de {fmt(total)} imóveis</p>
            </div>
          </div>
          <div className="space-y-1">
            <Semaforo label="Regular"     valor={d.imoveisRegular}    total={total} cor={VERDE} />
            <Semaforo label="Irregular"   valor={d.imoveisIrregular}  total={total} cor={VERMELHO} />
            <Semaforo label="Em apuração" valor={d.imoveisEmApuracao} total={total} cor={AMARELO} />
            <Semaforo label="Indefinida"  valor={d.imoveisSemDominial} total={total} cor={CINZA} />
          </div>
        </Card>

        {/* Ocupação */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Ocupação</SectionTitle>
            <ClipboardList className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-3 mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-lg font-bold text-[#1351B4]">{fmt(d.imoveisOcupados)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Ocupados</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-lg font-bold text-gray-600">{fmt(d.imoveisDesocupados)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Desocupados</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-lg font-bold text-yellow-600">{fmt(d.imoveisSemOcupacao)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Sem registro</p>
            </div>
          </div>
          <div className="space-y-1">
            <Semaforo label="Ocupados"    valor={d.imoveisOcupados}    total={total} cor={AZUL} />
            <Semaforo label="Desocupados" valor={d.imoveisDesocupados} total={total} cor={CINZA} />
            <Semaforo label="Sem dado"    valor={d.imoveisSemOcupacao} total={total} cor={AMARELO} />
          </div>
        </Card>
      </div>

      {/* ── Risco + Conservação + Intervenções ───────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Risco */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Criticidade / Risco</SectionTitle>
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </div>
          {dadosRisco.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma vistoria registrada</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={dadosRisco} cx="50%" cy="50%" innerRadius={35}
                    outerRadius={55} paddingAngle={2} dataKey="value">
                    {dadosRisco.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {dadosRisco.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.fill }} />
                      <span className="text-gray-600">{r.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{fmt(r.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {d.imoveisSemVistoria > 0 && (
            <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800">
              ⚠ {fmt(d.imoveisSemVistoria)} imóvel(is) sem vistoria registrada
            </div>
          )}
        </Card>

        {/* Conservação */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Estado de Conservação</SectionTitle>
          </div>
          {dadosConservacao.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem dados de conservação</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dadosConservacao} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={56} />
                <Tooltip formatter={(v: number) => [fmt(v), "Imóveis"]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {dadosConservacao.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Intervenções */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Intervenções</SectionTitle>
            <Wrench className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mb-3 text-center">
            <span className="text-3xl font-bold text-[#1351B4]">{fmt(d.totalIntervencoes)}</span>
            <p className="text-xs text-gray-400">total registradas</p>
          </div>
          <div className="space-y-1.5">
            {dadosIntervencoes.map((iv) => (
              <div key={iv.name} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{iv.name}</span>
                <Badge variant="secondary" className="text-xs">{fmt(iv.value)}</Badge>
              </div>
            ))}
          </div>
          {d.historicosAguardandoParecerFumph > 0 && (
            <div className="mt-3 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 text-xs text-purple-800">
              🏛 {fmt(d.historicosAguardandoParecerFumph)} aguardando parecer FUMPH
            </div>
          )}
        </Card>
      </div>

      {/* ── Patrimônio histórico + Ações rápidas ─────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Patrimônio histórico */}
        {d.imoveisHistoricos > 0 && (
          <Card className="p-5">
            <SectionTitle>Patrimônio Histórico (FUMPH)</SectionTitle>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-purple-50 px-4 py-3">
                <p className="text-xs text-purple-700">Imóveis históricos</p>
                <p className="text-xl font-bold text-purple-800">{fmt(d.imoveisHistoricos)}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-orange-50 px-4 py-3">
                <p className="text-xs text-orange-700">Com intervenção ativa</p>
                <p className="text-xl font-bold text-orange-800">{fmt(d.historicosComIntervencaoAtiva)}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
                <p className="text-xs text-red-700">Ag. Parecer FUMPH</p>
                <p className="text-xl font-bold text-red-800">{fmt(d.historicosAguardandoParecerFumph)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Ações rápidas */}
        <Card className={`p-5 ${d.imoveisHistoricos > 0 ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <SectionTitle>Ações Rápidas</SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Link to="/dashboard/imoveis/novo/etapa-1">
              <Button className="w-full justify-start bg-[#1351B4] hover:bg-[#0c3b8d] text-sm">
                <Building2 className="mr-2 h-4 w-4" />Novo Imóvel
              </Button>
            </Link>
            <Link to="/dashboard/ocupacoes">
              <Button variant="outline" className="w-full justify-start text-sm">
                <ClipboardList className="mr-2 h-4 w-4" />Ocupações
              </Button>
            </Link>
            <Link to="/dashboard/documentos">
              <Button variant="outline" className="w-full justify-start text-sm">
                <FolderOpen className="mr-2 h-4 w-4" />Documentos
              </Button>
            </Link>
            <Link to="/dashboard/relatorios">
              <Button variant="outline" className="w-full justify-start text-sm">
                <FileText className="mr-2 h-4 w-4" />Relatórios
              </Button>
            </Link>
            <Link to="/dashboard/mapa">
              <Button variant="outline" className="w-full justify-start text-sm">
                <Map className="mr-2 h-4 w-4" />Mapa GIS
              </Button>
            </Link>
            <Link to="/dashboard/auditoria">
              <Button variant="outline" className="w-full justify-start text-sm">
                <ShieldCheck className="mr-2 h-4 w-4" />Auditoria
              </Button>
            </Link>
          </div>
        </Card>
      </div>

    </div>
  );
}