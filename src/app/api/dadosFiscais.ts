import { api } from "./client";

export interface DadoFiscalResponse {
  id: number;
  idImovel: number;
  exercicio: number;
  inscricaoImobiliaria: string | null;
  cadastroMunicipalRef: string | null;
  valorVenalTerreno: number | null;
  valorVenalConstrucao: number | null;
  valorVenalTotal: number | null;
  divergenciaFiscal: boolean;
  observacoes: string | null;
  idResponsavel: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DadoFiscalRequest {
  exercicio: number;
  inscricaoImobiliaria?: string;
  cadastroMunicipalRef?: string;
  valorVenalTerreno?: number;
  valorVenalConstrucao?: number;
  divergenciaFiscal?: boolean;
  observacoes?: string;
  idResponsavel?: number;
}

export const dadosFiscaisApi = {
  listar(idImovel: number): Promise<DadoFiscalResponse[]> {
    return api.get(`/imoveis/${idImovel}/dados-fiscais`);
  },
  buscarPorId(idImovel: number, id: number): Promise<DadoFiscalResponse> {
    return api.get(`/imoveis/${idImovel}/dados-fiscais/${id}`);
  },
  criar(idImovel: number, data: DadoFiscalRequest): Promise<DadoFiscalResponse> {
    return api.post(`/imoveis/${idImovel}/dados-fiscais`, data);
  },
  atualizar(idImovel: number, id: number, data: DadoFiscalRequest): Promise<DadoFiscalResponse> {
    return api.put(`/imoveis/${idImovel}/dados-fiscais/${id}`, data);
  },
  deletar(idImovel: number, id: number): Promise<void> {
    return api.delete(`/imoveis/${idImovel}/dados-fiscais/${id}`);
  },
};
