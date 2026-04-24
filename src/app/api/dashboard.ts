import { api } from "./client";

export interface ConservacaoCount {
  estadoConservacao: string;
  quantidade: number;
}

export interface CadastroMensalCount {
  mesAno: string;
  quantidade: number;
}

export interface CadastroDiarioCount {
  dia: string;
  quantidade: number;
}

export interface DashboardIndicadores {
  // Totais gerais
  totalImoveis: number;
  totalOcupacoes: number;
  totalVistorias: number;
  totalIntervencoes: number;
  totalDocumentos: number;
  totalAlertas: number;
  alertasNaoLidos: number;

  // Status cadastro
  imoveisPreCadastro: number;
  imoveisValidados: number;
  imoveisGestaoplena: number;

  // GIS
  imoveisComGis: number;
  imoveisGisValidado: number;
  imoveisGisConflito: number;
  imoveisGisNaoValidado: number;
  imoveisSemGis: number;
  percentualGisValidado: number;

  // Dominial
  imoveisRegular: number;
  imoveisIrregular: number;
  imoveisEmApuracao: number;
  imoveisSemDominial: number;
  percentualDominialDefinido: number;

  // Ocupação
  imoveisOcupados: number;
  imoveisDesocupados: number;
  imoveisSemOcupacao: number;
  imoveisOcupadosSemInstrumento: number;

  // Risco / conservação
  imoveisRiscoBaixo: number;
  imoveisRiscoMedio: number;
  imoveisRiscoAlto: number;
  imoveisRiscoCritico: number;
  imoveisSemVistoria: number;
  distribuicaoConservacao: ConservacaoCount[];

  // Patrimônio histórico
  imoveisHistoricos: number;
  historicosComIntervencaoAtiva: number;
  historicosAguardandoParecerFumph: number;

  // Intervenções
  intervencoesPlanejadas: number;
  intervencoesEmContratacao: number;
  intervencoesEmExecucao: number;
  intervencoesConcluidas: number;
  intervencoesCanceladas: number;
  intervencoesAguardandoParecer: number;

  // Tendência
  cadastrosPorMes: CadastroMensalCount[];
  cadastrosPorDiaMesAtual: CadastroDiarioCount[];
}

export const dashboardApi = {
  indicadores(): Promise<DashboardIndicadores> {
    return api.get("/dashboard/indicadores");
  },
};