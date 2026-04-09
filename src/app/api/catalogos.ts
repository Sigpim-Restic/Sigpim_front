import { api } from "./client";

export interface CatalogoItem {
  id: number;
  tipo: string;
  codigo: string;
  valor: string;
  descricao: string | null;
}

export const catalogosApi = {
  listarPorTipo(tipo: string): Promise<CatalogoItem[]> {
    return api.get(`/catalogos/${tipo}`);
  },
};
