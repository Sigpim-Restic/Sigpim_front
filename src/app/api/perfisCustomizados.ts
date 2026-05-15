import { api } from "./client";
import type { PerfilUsuario } from "./usuarios";

export interface PerfilCustomizadoResponse {
  id: number;
  nome: string;
  descricao: string | null;
  chave: string;
  perfilBase: PerfilUsuario;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PerfilCustomizadoRequest {
  nome: string;
  descricao?: string;
  chave?: string;
  perfilBase: PerfilUsuario;
}

export const perfisCustomizadosApi = {
  listarTodos(): Promise<PerfilCustomizadoResponse[]> {
    return api.get<PerfilCustomizadoResponse[]>("/perfis-customizados");
  },

  listarAtivos(): Promise<PerfilCustomizadoResponse[]> {
    return api.get<PerfilCustomizadoResponse[]>("/perfis-customizados/ativos");
  },

  buscarPorId(id: number): Promise<PerfilCustomizadoResponse> {
    return api.get<PerfilCustomizadoResponse>(`/perfis-customizados/${id}`);
  },

  criar(data: PerfilCustomizadoRequest): Promise<PerfilCustomizadoResponse> {
    return api.post<PerfilCustomizadoResponse>("/perfis-customizados", data);
  },

  atualizar(id: number, data: PerfilCustomizadoRequest): Promise<PerfilCustomizadoResponse> {
    return api.put<PerfilCustomizadoResponse>(`/perfis-customizados/${id}`, data);
  },

  ativar(id: number): Promise<PerfilCustomizadoResponse> {
    return api.patch<PerfilCustomizadoResponse>(`/perfis-customizados/${id}/ativar`);
  },

  desativar(id: number): Promise<PerfilCustomizadoResponse> {
    return api.patch<PerfilCustomizadoResponse>(`/perfis-customizados/${id}/desativar`);
  },

  excluir(id: number): Promise<void> {
    return api.delete(`/perfis-customizados/${id}`);
  },
};