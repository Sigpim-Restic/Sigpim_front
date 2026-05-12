/**
 * Shared visual helpers for the Imovel detail page and its sub-components.
 */
import React from "react";

export const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  VALIDADO:     { label: "Validado",      cls: "bg-green-100 text-green-800" },
  PRE_CADASTRO: { label: "Pré-cadastro",  cls: "bg-yellow-100 text-yellow-800" },
  GESTAO_PLENA: { label: "Gestão Plena",  cls: "bg-blue-100 text-blue-800" },
};

export const CRITICIDADE_CFG: Record<string, { cls: string; label: string }> = {
  BAIXO:   { cls: "bg-green-100 text-green-800",   label: "Baixo" },
  MEDIO:   { cls: "bg-yellow-100 text-yellow-800", label: "Médio" },
  ALTO:    { cls: "bg-orange-100 text-orange-800", label: "Alto" },
  CRITICO: { cls: "bg-red-100 text-red-800",       label: "Crítico" },
};

import { Clock, AlertTriangle, Wrench, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export const STATUS_INTERV_CFG: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
  PLANEJADA:          { cls: "bg-gray-100 text-gray-700",    label: "Planejada",         icon: <Clock className="h-3 w-3" /> },
  AGUARDANDO_PARECER: { cls: "bg-yellow-100 text-yellow-800",label: "Ag. Parecer FUMPH", icon: <AlertTriangle className="h-3 w-3" /> },
  EM_CONTRATACAO:     { cls: "bg-purple-100 text-purple-800",label: "Em Contratação",    icon: <Clock className="h-3 w-3" /> },
  EM_EXECUCAO:        { cls: "bg-blue-100 text-blue-800",    label: "Em Execução",       icon: <Wrench className="h-3 w-3" /> },
  SUSPENSA:           { cls: "bg-orange-100 text-orange-800",label: "Suspensa",          icon: <AlertCircle className="h-3 w-3" /> },
  CONCLUIDA:          { cls: "bg-green-100 text-green-800",  label: "Concluída",         icon: <CheckCircle2 className="h-3 w-3" /> },
  CANCELADA:          { cls: "bg-red-100 text-red-800",      label: "Cancelada",         icon: <XCircle className="h-3 w-3" /> },
};

export function fmt(s?: string | null): string {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function fmtData(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function fmtMoeda(v: number | null | undefined): string {
  if (v == null) return "—";
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

/**
 * Campo de dado cadastral.
 *
 * Item #1 (acessibilidade idosos):
 *   - label: text-xs → text-sm  (hierarquia preservada mas legível)
 *   - valor: text-sm font-medium → text-base font-semibold  (dado primário destacado)
 *
 * text-xs é preservado intencionalmente em badges, contadores de tab,
 * metadados secundários e rodapés — esses são informação de suporte, não conteúdo primário.
 */
export function Campo({ label, valor }: { label: string; valor?: string | number | null }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-0.5">{label}</p>
      <p className="text-base font-semibold text-gray-800">{valor ?? "—"}</p>
    </div>
  );
}

export function Secao({ icone, titulo, children }: {
  icone: React.ReactNode; titulo: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
        <span className="text-[#1351B4]">{icone}</span>
        <h2 className="text-sm font-semibold text-gray-700">{titulo}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}