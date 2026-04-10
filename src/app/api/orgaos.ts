import { api } from "./client";

export interface OrgaoResponse {
  id: number;
  nome: string;
  sigla: string;
  codigo: string;
  ativo: boolean;
  extinto: boolean;
}

export const orgaosApi = {
  listarAtivos(): Promise<OrgaoResponse[]> {
    return api.get<OrgaoResponse[]>("/orgaos/ativos");
  },
};
