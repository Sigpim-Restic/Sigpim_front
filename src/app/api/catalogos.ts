import { api } from "./client";

export interface CatalogoItem {
  id: number;
  tipo: string;
  codigo: string;
  valor: string;
  descricao: string | null;
  ativo?: boolean;
}

export interface CatalogoItemRequest {
  tipo: string;
  codigo: string;
  valor: string;
  descricao?: string;
}

export const catalogosApi = {
  // Itens ativos de um tipo — dropdowns
  listarPorTipo(tipo: string): Promise<CatalogoItem[]> {
    return api.get(`/catalogos/${tipo}`);
  },
  // Todos os itens de um tipo (ativos + inativos) — gestão admin
  listarTodosPorTipo(tipo: string): Promise<CatalogoItem[]> {
    return api.get(`/catalogos/${tipo}/todos`);
  },
  // Tipos distintos — painel de catálogos
  listarTipos(): Promise<string[]> {
    return api.get(`/catalogos`);
  },
  criar(data: CatalogoItemRequest): Promise<CatalogoItem> {
    return api.post(`/catalogos`, data);
  },
  atualizar(id: number, data: CatalogoItemRequest): Promise<CatalogoItem> {
    return api.put(`/catalogos/${id}`, data);
  },
  ativar(id: number): Promise<CatalogoItem> {
    return api.patch(`/catalogos/${id}/ativar`);
  },
  desativar(id: number): Promise<CatalogoItem> {
    return api.patch(`/catalogos/${id}/desativar`);
  },
};