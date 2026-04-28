import { api } from "./client";

export interface OrigemCadastroResponse {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface OrigemCadastroRequest {
  nome: string;
  codigo: string;
}

export const origensCadastroApi = {
  listarAtivas(): Promise<OrigemCadastroResponse[]> {
    return api.get("/origens-cadastro/ativos");
  },
  listarTodas(): Promise<OrigemCadastroResponse[]> {
    return api.get("/origens-cadastro");
  },
  criar(data: OrigemCadastroRequest): Promise<OrigemCadastroResponse> {
    return api.post("/origens-cadastro", data);
  },
  atualizar(id: number, data: OrigemCadastroRequest): Promise<OrigemCadastroResponse> {
    return api.put(`/origens-cadastro/${id}`, data);
  },
  ativar(id: number): Promise<OrigemCadastroResponse> {
    return api.patch(`/origens-cadastro/${id}/ativar`);
  },
  desativar(id: number): Promise<OrigemCadastroResponse> {
    return api.patch(`/origens-cadastro/${id}/desativar`);
  },
};