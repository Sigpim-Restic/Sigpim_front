import { api } from "./client";
import type { PageResponse } from "./imoveis";

export type StatusIntervencao = "PLANEJADA" | "AGUARDANDO_PARECER" | "EM_CONTRATACAO" | "EM_EXECUCAO" | "SUSPENSA" | "CONCLUIDA" | "CANCELADA";
export type TipoIntervencao   = "MANUTENCAO_PREVENTIVA" | "MANUTENCAO_CORRETIVA" | "REFORMA" | "OBRA_NOVA" | "EMERGENCIAL" | "DEMOLICAO";
export type NivelIntervencao  = "N0" | "N1" | "N2" | "N3";
export type StatusParecerFumph = "PENDENTE" | "EM_ANALISE" | "APROVADO" | "APROVADO_COM_CONDICIONANTES" | "REPROVADO";

export interface MarcoIntervencaoResponse {
  id: number;
  idIntervencao: number;
  titulo: string;
  descricao: string | null;
  dataMarco: string;
  idDocumentoAnexo: number | null;
  criadoEm: string;
  criadoPor: number | null;
}

export interface ParecerFumphResponse {
  id: number;
  idIntervencao: number;
  statusParecer: StatusParecerFumph;
  dataSolicitacao: string | null;
  dataParecer: string | null;
  numeroParecer: string | null;
  responsavelFumph: string | null;
  condicionantes: string | null;
  diretrizes: string | null;
  observacoes: string | null;
  aceiteFinal: boolean;
  dataAceiteFinal: string | null;
  criadoEm: string;
}

export interface IntervencaoResponse {
  id: number;
  idImovel: number;
  idVistoriaOrigem: number | null;
  titulo: string;
  tipoIntervencao: TipoIntervencao;
  nivelIntervencao: NivelIntervencao;
  escopo: string | null;
  justificativa: string | null;
  numeroProcesso: string | null;
  custoEstimado: number | null;
  custoReal: number | null;
  dataPrevistaInicio: string | null;
  dataPrevistaFim: string | null;
  dataInicioReal: string | null;
  dataConclusaoReal: string | null;
  statusIntervencao: StatusIntervencao;
  idResponsavel: number | null;
  idOrgaoExecutor: number | null;
  requerParecerFumph: boolean;
  ativo: boolean;
  deletado: boolean;
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface IntervencaoRequest {
  idVistoriaOrigem?: number;
  titulo: string;
  tipoIntervencao: TipoIntervencao;
  nivelIntervencao: NivelIntervencao;
  escopo?: string;
  justificativa?: string;
  numeroProcesso?: string;
  custoEstimado?: number;
  dataPrevistaInicio?: string;
  dataPrevistaFim?: string;
  idResponsavel?: number;
  idOrgaoExecutor?: number;
}

export interface MarcoIntervencaoRequest {
  titulo: string;
  descricao?: string;
  dataMarco: string;
  idDocumentoAnexo?: number;
}

export interface ParecerFumphRequest {
  statusParecer: StatusParecerFumph;
  dataParecer?: string;
  numeroParecer?: string;
  responsavelFumph?: string;
  condicionantes?: string;
  diretrizes?: string;
  observacoes?: string;
  aceiteFinal?: boolean;
}

export const intervencoesApi = {
  listar(idImovel: number, page = 0, size = 20): Promise<PageResponse<IntervencaoResponse>> {
    return api.get(`/imoveis/${idImovel}/intervencoes?page=${page}&size=${size}`);
  },
  buscarPorId(idImovel: number, id: number): Promise<IntervencaoResponse> {
    return api.get(`/imoveis/${idImovel}/intervencoes/${id}`);
  },
  criar(idImovel: number, data: IntervencaoRequest): Promise<IntervencaoResponse> {
    return api.post(`/imoveis/${idImovel}/intervencoes`, data);
  },
  atualizar(idImovel: number, id: number, data: IntervencaoRequest): Promise<IntervencaoResponse> {
    return api.put(`/imoveis/${idImovel}/intervencoes/${id}`, data);
  },
  avancarStatus(idImovel: number, id: number, novoStatus: StatusIntervencao): Promise<IntervencaoResponse> {
    return api.patch(`/imoveis/${idImovel}/intervencoes/${id}/status?novoStatus=${novoStatus}`);
  },
  deletar(idImovel: number, id: number): Promise<void> {
    return api.delete(`/imoveis/${idImovel}/intervencoes/${id}`);
  },
  // Marcos
  listarMarcos(idImovel: number, idIntervencao: number): Promise<MarcoIntervencaoResponse[]> {
    return api.get(`/imoveis/${idImovel}/intervencoes/${idIntervencao}/marcos`);
  },
  adicionarMarco(idImovel: number, idIntervencao: number, data: MarcoIntervencaoRequest): Promise<MarcoIntervencaoResponse> {
    return api.post(`/imoveis/${idImovel}/intervencoes/${idIntervencao}/marcos`, data);
  },
  // Parecer FUMPH
  buscarParecerFumph(idImovel: number, idIntervencao: number): Promise<ParecerFumphResponse> {
    return api.get(`/imoveis/${idImovel}/intervencoes/${idIntervencao}/parecer-fumph`);
  },
  atualizarParecerFumph(idImovel: number, idIntervencao: number, data: ParecerFumphRequest): Promise<ParecerFumphResponse> {
    return api.put(`/imoveis/${idImovel}/intervencoes/${idIntervencao}/parecer-fumph`, data);
  },
};