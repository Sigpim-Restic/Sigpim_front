import { api } from "./client";

export type TipoAditivo =
  | "PRORROGACAO"
  | "REAJUSTE"
  | "ALTERACAO_VALOR"
  | "RESCISAO"
  | "OUTROS";

export interface AditivoContratoResponse {
  id: number;
  idContrato: number;
  numeroAditivo: string;
  tipoAditivo: TipoAditivo;
  dataAssinatura: string;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  valorMensal: number;
  objeto: string | null;
  observacoes: string | null;
  idDocumento: number | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number | null;
  atualizadoPor: number | null;
}

export interface AditivoContratoRequest {
  numeroAditivo: string;
  tipoAditivo: TipoAditivo;
  dataAssinatura: string;
  vigenciaInicio: string;
  vigenciaFim?: string;
  valorMensal: number;
  objeto?: string;
  observacoes?: string;
  idDocumento?: number;
}

export const TIPO_ADITIVO_LABELS: Record<TipoAditivo, string> = {
  PRORROGACAO:    "Prorrogação",
  REAJUSTE:       "Reajuste",
  ALTERACAO_VALOR: "Alteração de Valor",
  RESCISAO:       "Rescisão",
  OUTROS:         "Outros",
};

export const aditivosContratoApi = {
  listar(idContrato: number): Promise<AditivoContratoResponse[]> {
    return api.get(`/contratos-locacao/${idContrato}/aditivos`);
  },

  buscarPorId(idContrato: number, id: number): Promise<AditivoContratoResponse> {
    return api.get(`/contratos-locacao/${idContrato}/aditivos/${id}`);
  },

  criar(idContrato: number, data: AditivoContratoRequest): Promise<AditivoContratoResponse> {
    return api.post(`/contratos-locacao/${idContrato}/aditivos`, data);
  },

  atualizar(idContrato: number, id: number, data: AditivoContratoRequest): Promise<AditivoContratoResponse> {
    return api.put(`/contratos-locacao/${idContrato}/aditivos/${id}`, data);
  },

  deletar(idContrato: number, id: number): Promise<void> {
    return api.delete(`/contratos-locacao/${idContrato}/aditivos/${id}`);
  },
};