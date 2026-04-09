import { api } from "./client";
import type { PageResponse } from "./imoveis";

export type StatusOcupacao = "OCUPADO" | "DESOCUPADO" | "DESCONHECIDO" | "NAO_REGULARIZADO";
export type NivelOcupacao = "TOTAL" | "PARCIAL" | "COMPARTILHADO";

export interface OcupacaoResponse {
  id: number;
  idImovel: number;
  statusOcupacao: StatusOcupacao;
  nivelOcupacao: NivelOcupacao | null;
  idOrgaoOcupante: number | null;
  nomeOcupanteExterno: string | null;
  nomeResponsavelLocal: string | null;
  contatoResponsavel: string | null;
  destinacaoFinalidade: string | null;
  dataInicio: string | null;
  dataFimPrevista: string | null;
  observacoes: string | null;
  vigente: boolean;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface OcupacaoRequest {
  idImovel: number;
  statusOcupacao: StatusOcupacao;
  nivelOcupacao?: NivelOcupacao;
  idOrgaoOcupante?: number;
  nomeOcupanteExterno?: string;
  nomeResponsavelLocal?: string;
  contatoResponsavel?: string;
  destinacaoFinalidade?: string;
  dataInicio?: string;
  dataFimPrevista?: string;
  observacoes?: string;
  vigente?: boolean;
}

export const ocupacoesApi = {
  listar(page = 0, size = 20): Promise<PageResponse<OcupacaoResponse>> {
    return api.get(`/ocupacoes?page=${page}&size=${size}`);
  },
  listarPorImovel(idImovel: number, page = 0, size = 20): Promise<PageResponse<OcupacaoResponse>> {
    return api.get(`/ocupacoes/imovel/${idImovel}?page=${page}&size=${size}`);
  },
  criar(data: OcupacaoRequest): Promise<OcupacaoResponse> {
    return api.post("/ocupacoes", data);
  },
  encerrar(id: number): Promise<OcupacaoResponse> {
    return api.patch(`/ocupacoes/${id}/encerrar`);
  },
  deletar(id: number): Promise<void> {
    return api.delete(`/ocupacoes/${id}`);
  },
};
