import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Building2, ClipboardList, FolderOpen, FileText, Map,
  CheckCircle2, Clock, RefreshCw, AlertCircle, AlertTriangle,
  Wrench, ShieldCheck, TrendingUp, MapPin,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
  return link ? <Link to={link} className="block">{inner}</Link> : inner;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-slate-700 border-l-[3px] border-[#1351B4] pl-3 leading-tight">
      {children}
    </h2>
  );
}

function Semaforo({ label, valor, total, cor }: {
  label: string; valor: number; total: number; cor: string;
}) {
  const p = total > 0 ? (valor / total) * 100 : 0;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: cor }} />
        </div>
        <span className="text-xs font-semibold text-slate-700 w-8 text-right">{fmt(valor)}</span>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Dashboard() {
  const [dados,   setDados]   = useState<DashboardIndicadores | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<1 | 3 | 6>(1);

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
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{erro}</div>
      <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>
        Tentar novamente
      </Button>
    </div>
  );

  const d = dados!;
  const total = d.totalImoveis;

  const dadosStatus = [
    { name: "Pré-cadastro", value: d.imoveisPreCadastro, fill: AMARELO },
    { name: "Validado",     value: d.imoveisValidados,   fill: AZUL },
    { name: "Gestão Plena", value: d.imoveisGestaoplena, fill: VERDE },
  ].filter((e) => e.value > 0);

  const dadosRisco = [
    { name: "Baixo",        value: d.imoveisRiscoBaixo,   fill: VERDE },
    { name: "Médio",        value: d.imoveisRiscoMedio,   fill: AMARELO },
    { name: "Alto",         value: d.imoveisRiscoAlto,    fill: LARANJA },
    { name: "Crítico",      value: d.imoveisRiscoCritico, fill: VERMELHO },
    { name: "Sem vistoria", value: d.imoveisSemVistoria,  fill: CINZA },
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

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Indicadores calculados em tempo real</p>
        <Button
          variant="outline"
          size="sm"
          onClick={carregar}
          disabled={loading}
          className="gap-1.5 border-slate-200 text-slate-600 hover:text-[#1351B4]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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
          color={d.alertasNaoLidos > 0 ? "text-red-600" : "text-emerald-600"}
          bg={d.alertasNaoLidos > 0 ? "bg-red-50" : "bg-emerald-50"} />
      </div>

      {/* ── Status + Tendência ────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Donut — status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
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
        </div>

        {/* Cadastros por período */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Cadastros por Período</SectionTitle>
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {([1, 3, 6] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    periodo === p
                      ? "bg-[#1351B4] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {p === 1 ? "Mês atual" : `${p} meses`}
                </button>
              ))}
            </div>
          </div>
          {(() => {
            const hoje = new Date();

            const fatia = Array.from({ length: periodo }, (_, i) => {
              const mesesAtrás = periodo - 1 - i;
              const dt = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtrás, 1);
              const mesAno = `${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
              const entrada = d.cadastrosPorMes.find((c) => c.mesAno === mesAno);
              return { mesAno, quantidade: entrada?.quantidade ?? 0 };
            });

            if (periodo === 1) {
              const dtAnt = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
              const mesAntKey = `${String(dtAnt.getMonth() + 1).padStart(2, "0")}/${dtAnt.getFullYear()}`;
              const anterior = d.cadastrosPorMes.find((c) => c.mesAno === mesAntKey);
              const cadastrosPorDiaMesAtual = d.cadastrosPorDiaMesAtual ?? [];
              const porDiaMap = new globalThis.Map(
                cadastrosPorDiaMesAtual.map((item) => [item.dia, item.quantidade])
              );
              const diasAteHoje = Array.from({ length: hoje.getDate() }, (_, idx) => {
                const dia = idx + 1;
                const key = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
                const label = `${String(dia).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}`;
                return { dia: key, label, quantidade: porDiaMap.get(key) ?? 0 };
              });
              const qtd = diasAteHoje.reduce((acc, item) => acc + item.quantidade, 0);
              const qtdAnt = anterior?.quantidade ?? 0;
              const delta = qtdAnt > 0 ? qtd - qtdAnt : null;
              const mesAtualLabel = `${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;

              return (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-bold tracking-tight text-[#1351B4]">{fmt(qtd)}</p>
                    <div className="mb-1">
                      <p className="text-xs text-slate-500">imóvel(is) em {mesAtualLabel}</p>
                      {delta !== null && (
                        <span className={`inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${delta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {delta >= 0 ? "+" : ""}{delta} vs mês anterior
                        </span>
                      )}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={diasAteHoje} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip
                        formatter={(v: number) => [fmt(v), "Cadastros"]}
                        labelFormatter={(label: string) => `Dia ${label}`}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      />
                      <Bar dataKey="quantidade" fill={AZUL} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            }

            const totalFatia = fatia.reduce((acc, m) => acc + m.quantidade, 0);
            return (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-xs text-slate-400">
                  Total no período: <span className="font-semibold text-slate-700">{fmt(totalFatia)}</span> cadastro(s)
                </p>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={fatia} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                    <XAxis dataKey="mesAno" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v: number) => [fmt(v), "Cadastros"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    />
                    <Bar dataKey="quantidade" fill={AZUL} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── GIS + Dominial + Ocupação ─────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* GIS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>GIS / Localização</SectionTitle>
            <MapPin className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold tracking-tight text-[#1351B4]">
              {Math.round(d.percentualGisValidado)}%
            </div>
            <div>
              <p className="text-xs text-slate-500">com GIS Validado</p>
              <p className="text-xs text-slate-400">{fmt(d.imoveisGisValidado)} de {fmt(total)} imóveis</p>
            </div>
          </div>
          <div className="space-y-1">
            <Semaforo label="✓ Validado"     valor={d.imoveisGisValidado}    total={total} cor={VERDE} />
            <Semaforo label="⚠ Conflito"     valor={d.imoveisGisConflito}    total={total} cor={LARANJA} />
            <Semaforo label="○ Não validado" valor={d.imoveisGisNaoValidado} total={total} cor={AMARELO} />
            <Semaforo label="— Sem GIS"      valor={d.imoveisSemGis}         total={total} cor={CINZA} />
          </div>
        </div>

        {/* Dominial */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Situação Dominial</SectionTitle>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold tracking-tight text-[#1351B4]">
              {Math.round(d.percentualDominialDefinido)}%
            </div>
            <div>
              <p className="text-xs text-slate-500">com dominial definida</p>
              <p className="text-xs text-slate-400">{fmt(total - d.imoveisSemDominial)} de {fmt(total)} imóveis</p>
            </div>
          </div>
          <div className="space-y-1">
            <Semaforo label="Regular"     valor={d.imoveisRegular}     total={total} cor={VERDE} />
            <Semaforo label="Irregular"   valor={d.imoveisIrregular}   total={total} cor={VERMELHO} />
            <Semaforo label="Em apuração" valor={d.imoveisEmApuracao}  total={total} cor={AMARELO} />
            <Semaforo label="Indefinida"  valor={d.imoveisSemDominial} total={total} cor={CINZA} />
          </div>
        </div>

        {/* Ocupação */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionTitle>Ocupação</SectionTitle>
            <ClipboardList className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-lg font-bold text-[#1351B4]">{fmt(d.imoveisOcupados)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Ocupados</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-lg font-bold text-slate-600">{fmt(d.imoveisDesocupados)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Desocupados</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-lg font-bold text-amber-600">{fmt(d.imoveisSemOcupacao)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Sem registro</p>
            </div>
          </div>
          <div className="space-y-1">
            <Semaforo label="Ocupados"    valor={d.imoveisOcupados}    total={total} cor={AZUL} />
            <Semaforo label="Desocupados" valor={d.imoveisDesocupados} total={total} cor={CINZA} />
            <Semaforo label="Sem dado"    valor={d.imoveisSemOcupacao} total={total} cor={AMARELO} />
          </div>
        </div>
      </div>

      {/* ── Risco + Conservação + Intervenções ───────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Risco */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Criticidade / Risco</SectionTitle>
            <AlertTriangle className="h-4 w-4 text-slate-400" />
          </div>
          {dadosRisco.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma vistoria registrada</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={dadosRisco} cx="50%" cy="50%" innerRadius={35}
                    outerRadius={55} paddingAngle={2} dataKey="value">
                    {dadosRisco.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [fmt(v), ""]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {dadosRisco.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.fill }} />
                      <span className="text-slate-600">{r.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{fmt(r.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {d.imoveisSemVistoria > 0 && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              ⚠ {fmt(d.imoveisSemVistoria)} imóvel(is) sem vistoria registrada
            </div>
          )}
        </div>

        {/* Conservação */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Estado de Conservação</SectionTitle>
          </div>
          {dadosConservacao.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sem dados de conservação</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dadosConservacao} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={56} />
                <Tooltip
                  formatter={(v: number) => [fmt(v), "Imóveis"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {dadosConservacao.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Intervenções */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Intervenções</SectionTitle>
            <Wrench className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mb-4 text-center">
            <span className="text-3xl font-bold tracking-tight text-[#1351B4]">{fmt(d.totalIntervencoes)}</span>
            <p className="text-xs text-slate-400 mt-0.5">total registradas</p>
          </div>
          <div className="space-y-1.5">
            {dadosIntervencoes.map((iv) => (
              <div key={iv.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{iv.name}</span>
                <Badge variant="secondary" className="text-xs">{fmt(iv.value)}</Badge>
              </div>
            ))}
          </div>
          {d.historicosAguardandoParecerFumph > 0 && (
            <div className="mt-3 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 text-xs text-purple-800">
              🏛 {fmt(d.historicosAguardandoParecerFumph)} aguardando parecer FUMPH
            </div>
          )}
        </div>
      </div>

      {/* ── Patrimônio histórico + Ações rápidas ─────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Patrimônio histórico */}
        {d.imoveisHistoricos > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <SectionTitle>Patrimônio Histórico (FUMPH)</SectionTitle>
            <div className="mt-4 space-y-2.5">
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
          </div>
        )}

        {/* Ações rápidas */}
        <div className={`rounded-xl border border-slate-200 bg-white p-5 ${d.imoveisHistoricos > 0 ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <SectionTitle>Ações Rápidas</SectionTitle>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Link to="/dashboard/imoveis/novo/etapa-1">
              <Button className="w-full justify-start bg-[#1351B4] hover:bg-[#0c3b8d] text-sm gap-2">
                <Building2 className="h-4 w-4" />Novo Imóvel
              </Button>
            </Link>
            <Link to="/dashboard/ocupacoes">
              <Button variant="outline" className="w-full justify-start text-sm gap-2 border-slate-200 text-slate-700 hover:text-[#1351B4] hover:border-[#1351B4]/30">
                <ClipboardList className="h-4 w-4" />Ocupações
              </Button>
            </Link>
            <Link to="/dashboard/documentos">
              <Button variant="outline" className="w-full justify-start text-sm gap-2 border-slate-200 text-slate-700 hover:text-[#1351B4] hover:border-[#1351B4]/30">
                <FolderOpen className="h-4 w-4" />Documentos
              </Button>
            </Link>
            <Link to="/dashboard/relatorios">
              <Button variant="outline" className="w-full justify-start text-sm gap-2 border-slate-200 text-slate-700 hover:text-[#1351B4] hover:border-[#1351B4]/30">
                <FileText className="h-4 w-4" />Relatórios
              </Button>
            </Link>
            <Link to="/dashboard/mapa">
              <Button variant="outline" className="w-full justify-start text-sm gap-2 border-slate-200 text-slate-700 hover:text-[#1351B4] hover:border-[#1351B4]/30">
                <Map className="h-4 w-4" />Mapa GIS
              </Button>
            </Link>
            <Link to="/dashboard/auditoria">
              <Button variant="outline" className="w-full justify-start text-sm gap-2 border-slate-200 text-slate-700 hover:text-[#1351B4] hover:border-[#1351B4]/30">
                <ShieldCheck className="h-4 w-4" />Auditoria
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}