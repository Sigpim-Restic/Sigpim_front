import { api } from "./client";

export interface InstrumentoUsoResponse {
  id: number;
  idImovel: number;
  tipoInstrumento: string;
  numeroInstrumento: string | null;
  dataAssinatura: string | null;
  dataInicio: string | null;
  dataVencimento: string | null;
  cedente: string | null;
  cessionario: string | null;
  idOrgaoCessionario: number | null;
  oneroso: boolean;
  valorMensal: number | null;
  statusInstrumento: string;
  idDocumento: number | null;
  observacoes: string | null;
  ativo: boolean;
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number | null;
  atualizadoPor: number | null;
}

export interface InstrumentoUsoRequest {
  tipoInstrumento: string;
  numeroInstrumento?: string;
  dataAssinatura?: string;
  dataInicio?: string;
  dataVencimento?: string;
  cedente?: string;
  cessionario?: string;
  idOrgaoCessionario?: number;
  oneroso?: boolean;
  valorMensal?: number;
  statusInstrumento?: string;
  idDocumento?: number;
  observacoes?: string;
}

export const TIPOS_INSTRUMENTO = [
  { value: "CESSAO_USO",       label: "Cessão de Uso" },
  { value: "COMODATO",         label: "Comodato" },
  { value: "PERMISSAO_USO",    label: "Permissão de Uso" },
  { value: "CONCESSAO_USO",    label: "Concessão de Uso" },
  { value: "AUTORIZACAO_USO",  label: "Autorização de Uso" },
  { value: "OUTRO",            label: "Outro" },
] as const;

export const STATUS_INSTRUMENTO = [
  { value: "VIGENTE",    label: "Vigente" },
  { value: "VENCIDO",    label: "Vencido" },
  { value: "RESCINDIDO", label: "Rescindido" },
  { value: "RENOVADO",   label: "Renovado" },
  { value: "SUSPENSO",   label: "Suspenso" },
] as const;

export const instrumentosUsoApi = {
  listar(idImovel: number): Promise<InstrumentoUsoResponse[]> {
    return api.get(`/imoveis/${idImovel}/instrumentos-uso`);
  },

  buscarPorId(idImovel: number, id: number): Promise<InstrumentoUsoResponse> {
    return api.get(`/imoveis/${idImovel}/instrumentos-uso/${id}`);
  },

  criar(idImovel: number, data: InstrumentoUsoRequest): Promise<InstrumentoUsoResponse> {
    return api.post(`/imoveis/${idImovel}/instrumentos-uso`, data);
  },

  atualizar(idImovel: number, id: number, data: InstrumentoUsoRequest): Promise<InstrumentoUsoResponse> {
    return api.put(`/imoveis/${idImovel}/instrumentos-uso/${id}`, data);
  },

  deletar(idImovel: number, id: number): Promise<void> {
    return api.delete(`/imoveis/${idImovel}/instrumentos-uso/${id}`);
  },
};
