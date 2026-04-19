import { api } from "./client";
import type { PageResponse } from "./imoveis";

export type CriticidadeRisco = "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
export type SituacaoChecklist = "CONFORME" | "NAO_CONFORME" | "NAO_APLICAVEL" | "NAO_INSPECIONADO";

export interface ItemChecklistResponse {
  id: number;
  idVistoria: number;
  categoria: string;
  item: string;
  situacao: SituacaoChecklist;
  observacao: string | null;
  criadoEm: string;
}

export interface VistoriaResponse {
  id: number;
  idImovel: number;
  dataVistoria: string;
  idResponsavel: number | null;
  equipeDescricao: string | null;
  numeroProcesso: string | null;
  estadoConservacao: string | null;
  criticidadeRisco: CriticidadeRisco;
  parecer: string | null;
  recomendacoes: string | null;
  laudoAnexoId: number | null;
  vistoriaInicial: boolean;
  itensChecklist: ItemChecklistResponse[];
  ativo: boolean;
  deletado: boolean;
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ItemChecklistRequest {
  categoria: string;
  item: string;
  situacao: SituacaoChecklist;
  observacao?: string;
}

export interface VistoriaRequest {
  dataVistoria: string;
  idResponsavel?: number;
  equipeDescricao?: string;
  numeroProcesso?: string;
  estadoConservacao: string;
  criticidadeRisco: CriticidadeRisco;
  parecer?: string;
  recomendacoes?: string;
  laudoAnexoId?: number;
  vistoriaInicial: boolean;
  itensChecklist?: ItemChecklistRequest[];
}

export const vistoriasApi = {
  listar(idImovel: number, page = 0, size = 20): Promise<PageResponse<VistoriaResponse>> {
    return api.get(`/imoveis/${idImovel}/vistorias?page=${page}&size=${size}&sort=dataVistoria,desc`);
  },
  buscarPorId(idImovel: number, id: number): Promise<VistoriaResponse> {
    return api.get(`/imoveis/${idImovel}/vistorias/${id}`);
  },
  criar(idImovel: number, data: VistoriaRequest): Promise<VistoriaResponse> {
    return api.post(`/imoveis/${idImovel}/vistorias`, data);
  },
  atualizar(idImovel: number, id: number, data: VistoriaRequest): Promise<VistoriaResponse> {
    return api.put(`/imoveis/${idImovel}/vistorias/${id}`, data);
  },
  deletar(idImovel: number, id: number): Promise<void> {
    return api.delete(`/imoveis/${idImovel}/vistorias/${id}`);
  },
};
