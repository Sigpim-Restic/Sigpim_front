import { api } from "./client";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface DominioValidado {
  dominio: string;
  nomeValidador: string;
  nomeOrgao: string;
  validadoEm: string;
  observacao: string | null;
}

export interface StatusValidacaoResponse {
  idImovel: number;
  dominiosValidados: DominioValidado[];
  dominiosPendentes: string[];
  /** Recusas ativas: domínio → motivo mais recente */
  recusasAtivas: Record<string, string>;
}

export interface ValidacaoAbaResponse {
  id: number;
  idImovel: number;
  dominio: string;
  validadoPor: number;
  nomeValidador: string;
  idOrgao: number;
  nomeOrgao: string;
  validadoEm: string;
  observacao: string | null;
}

export interface ValidarAbaRequest {
  dominio: string;
  observacao?: string;
}

export interface RecusarDominioRequest {
  dominio: string;
  motivo: string;
}

export interface RecusaDominioResponse {
  id: number;
  dominio: string;
  motivo: string;
  nomeValidador: string;
  nomeOrgao: string;
  recusadoEm: string;
  resolvida: boolean;
}

// Mapeamento domínio → label legível
export const DOMINIO_LABEL: Record<string, string> = {
  CORE:          "Identificação e Governança",
  GIS:           "Localização e GIS",
  CLASSIFICACAO: "Classificação e Uso",
  DADOS_FISICOS: "Dados Físicos",
  OCUPACAO:      "Ocupação e Destinação",
  INSTRUMENTO:   "Instrumentos e Contratos",
  DOMINIAL:      "Dominial e Regularização",
  FISCAL:        "Fiscal / Tributário",
  AVALIACAO:     "Avaliação Patrimonial",
  VISTORIA:      "Vistorias",
  INTERVENCAO:   "Intervenções",
  AMBIENTAL:     "Meio Ambiente",
  PAISAGEM:      "Paisagem Urbana",
  HISTORICO:     "Patrimônio Histórico",
  ANEXOS:        "Anexos e Evidências",
  PLANEJAMENTO:  "Planejamento e Projetos",
};

// Mapeamento domínio → órgão responsável (Matriz RACI Manual v1.1)
export const DOMINIO_ORGAO: Record<string, string> = {
  CORE:          "SEMAD",
  DOMINIAL:      "SEMAD",
  OCUPACAO:      "SEMAD",
  INSTRUMENTO:   "SEMAD",
  AVALIACAO:     "SEMAD",
  ANEXOS:        "SEMAD",
  GIS:           "SEMURH",
  CLASSIFICACAO: "SEMAD / SEMURH",
  DADOS_FISICOS: "SEMURH / SEMOSP",
  FISCAL:        "SEMFAZ",
  VISTORIA:      "SEMOSP",
  INTERVENCAO:   "SEMOSP",
  HISTORICO:     "FUMPH",
  AMBIENTAL:     "SEMMAM",
  PAISAGEM:      "IMPUR",
  PLANEJAMENTO:  "SEPLAN / SEMISPE",
};

// ── API ───────────────────────────────────────────────────────────────────────

export const validacoesAbaApi = {
  buscarStatus(idImovel: number): Promise<StatusValidacaoResponse> {
    return api.get<StatusValidacaoResponse>(`/imoveis/${idImovel}/validacoes-aba`);
  },

  validar(idImovel: number, request: ValidarAbaRequest): Promise<ValidacaoAbaResponse> {
    return api.post<ValidacaoAbaResponse>(`/imoveis/${idImovel}/validacoes-aba`, request);
  },

  recusar(idImovel: number, request: RecusarDominioRequest): Promise<RecusaDominioResponse> {
    return api.post<RecusaDominioResponse>(`/imoveis/${idImovel}/validacoes-aba/recusar`, request);
  },

  revogar(idImovel: number, dominio: string): Promise<void> {
    return api.delete(`/imoveis/${idImovel}/validacoes-aba/${dominio}`);
  },
};