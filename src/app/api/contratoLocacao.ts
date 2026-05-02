import { api } from "./client";

export interface ContratoLocacaoResponse {
  id: number;
  idImovel: number;
  numeroContrato: string | null;
  locador: string;
  dataAssinatura: string | null;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  valorMensal: number;
  reajuste: string | null;
  fiscalContrato: string | null;
  idOrgaoBeneficiario: number | null;
  alertaDias: number[];
  statusContrato: string;
  idDocumentoContrato: number | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface ContratoLocacaoRequest {
  numeroContrato?: string;
  locador: string;
  dataAssinatura?: string;
  vigenciaInicio: string;
  vigenciaFim?: string;
  valorMensal: number;
  reajuste?: string;
  fiscalContrato?: string;
  idOrgaoBeneficiario?: number;
  alertaDias?: number[];
  statusContrato?: string;
  idDocumentoContrato?: number;
  observacoes?: string;
}

export const STATUS_CONTRATO = [
  { value: "VIGENTE",    label: "Vigente" },
  { value: "VENCIDO",    label: "Vencido" },
  { value: "RESCINDIDO", label: "Rescindido" },
  { value: "RENOVADO",   label: "Renovado" },
  { value: "SUSPENSO",   label: "Suspenso" },
];

export const contratosLocacaoApi = {
  listar(idImovel: number): Promise<ContratoLocacaoResponse[]> {
    return api.get(`/imoveis/${idImovel}/contratos-locacao`);
  },
  buscarPorId(idImovel: number, id: number): Promise<ContratoLocacaoResponse> {
    return api.get(`/imoveis/${idImovel}/contratos-locacao/${id}`);
  },
  criar(idImovel: number, data: ContratoLocacaoRequest): Promise<ContratoLocacaoResponse> {
    return api.post(`/imoveis/${idImovel}/contratos-locacao`, data);
  },
  atualizar(idImovel: number, id: number, data: ContratoLocacaoRequest): Promise<ContratoLocacaoResponse> {
    return api.put(`/imoveis/${idImovel}/contratos-locacao/${id}`, data);
  },
  deletar(idImovel: number, id: number): Promise<void> {
    return api.delete(`/imoveis/${idImovel}/contratos-locacao/${id}`);
  },
};