import { api } from "./client";

export interface UnidadeOrganizacionalResponse {
  id: number;
  idOrgao: number;
  nome: string;
  sigla: string;
  codigo: string;
  ativo: boolean;
}

export const unidadesApi = {
  listarAtivasPorOrgao(idOrgao: number): Promise<UnidadeOrganizacionalResponse[]> {
    return api.get<UnidadeOrganizacionalResponse[]>(
      `/unidades-organizacionais/orgao/${idOrgao}/ativas`
    );
  },
};
