import { api } from "./client";

export interface NivelOcupacaoResponse {
  id: number;
  nome: string;
  codigo: string;
  descricao: string | null;
  ativo: boolean;
}

export interface NivelOcupacaoRequest {
  nome: string;
  codigo: string;
  descricao?: string;
}

export const niveisOcupacaoApi = {
  listarAtivos(): Promise<NivelOcupacaoResponse[]> {
    return api.get("/niveis-ocupacao/ativos");
  },
  listarTodos(): Promise<NivelOcupacaoResponse[]> {
    return api.get("/niveis-ocupacao");
  },
  criar(data: NivelOcupacaoRequest): Promise<NivelOcupacaoResponse> {
    return api.post("/niveis-ocupacao", data);
  },
  atualizar(id: number, data: NivelOcupacaoRequest): Promise<NivelOcupacaoResponse> {
    return api.put(`/niveis-ocupacao/${id}`, data);
  },
  ativar(id: number): Promise<NivelOcupacaoResponse> {
    return api.patch(`/niveis-ocupacao/${id}/ativar`);
  },
  desativar(id: number): Promise<NivelOcupacaoResponse> {
    return api.patch(`/niveis-ocupacao/${id}/desativar`);
  },
};
