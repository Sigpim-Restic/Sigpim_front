import { api } from "./client";

export interface SituacaoDominialResponse {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface SituacaoDominialRequest {
  nome: string;
  codigo: string;
}

export const situacoesDominiaisApi = {
  listarAtivas(): Promise<SituacaoDominialResponse[]> {
    return api.get("/situacoes-dominiais/ativas");
  },
  listarTodas(): Promise<SituacaoDominialResponse[]> {
    return api.get("/situacoes-dominiais");
  },
  criar(data: SituacaoDominialRequest): Promise<SituacaoDominialResponse> {
    return api.post("/situacoes-dominiais", data);
  },
  atualizar(id: number, data: SituacaoDominialRequest): Promise<SituacaoDominialResponse> {
    return api.put(`/situacoes-dominiais/${id}`, data);
  },
  ativar(id: number): Promise<SituacaoDominialResponse> {
    return api.patch(`/situacoes-dominiais/${id}/ativar`);
  },
  desativar(id: number): Promise<SituacaoDominialResponse> {
    return api.patch(`/situacoes-dominiais/${id}/desativar`);
  },
};
