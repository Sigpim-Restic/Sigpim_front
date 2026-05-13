import { api } from "./client";

export interface VotoDto {
  idVotante: number;
  nomeVotante: string;
  aprovado: boolean;
  votadoEm: string;
}

export interface DesativacaoAdminResponse {
  idSolicitacao: number;
  idAlvo: number;
  nomeAlvo: string;
  solicitadoPor: number;
  nomeSolicitante: string;
  status: "PENDENTE" | "APROVADA" | "REJEITADA" | "CANCELADA";
  criadaEm: string;
  votos: VotoDto[];
  totalAdminsNecessarios: number;
  totalAprovacoes: number;
  totalPendentes: number;
}

export const desativacaoAdminApi = {
  listarPendentes(): Promise<DesativacaoAdminResponse[]> {
    return api.get("/admin/desativacao/pendentes");
  },

  buscarParaAlvo(idAlvo: number): Promise<{ solicitacao?: DesativacaoAdminResponse }> {
    return api.get(`/admin/desativacao/alvo/${idAlvo}`);
  },

  solicitar(idAlvo: number): Promise<DesativacaoAdminResponse> {
    return api.post(`/admin/desativacao/solicitar/${idAlvo}`, {});
  },

  votar(idSolicitacao: number, aprovar: boolean): Promise<DesativacaoAdminResponse> {
    return api.post(`/admin/desativacao/${idSolicitacao}/votar?aprovar=${aprovar}`, {});
  },
};
