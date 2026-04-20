import { api } from "./client";

export interface AvaliacaoPatrimonialResponse {
  id: number;
  idImovel: number;
  dataAvaliacao: string;       // ISO date: "yyyy-MM-dd"
  metodologia: string;
  valorAvaliado: number;
  valorAnterior: number | null;
  moeda: string;
  responsavelNome: string | null;
  responsavelCrea: string | null;
  responsavelOrgao: string | null;
  idDocumentoLaudo: number | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number | null;
  atualizadoPor: number | null;
}

export interface AvaliacaoPatrimonialRequest {
  dataAvaliacao: string;
  metodologia: string;
  valorAvaliado: number;
  moeda?: string;
  responsavelNome?: string;
  responsavelCrea?: string;
  responsavelOrgao?: string;
  idDocumentoLaudo?: number;
  observacoes?: string;
}

export const METODOLOGIAS = [
  { value: "COMPARATIVO_MERCADO", label: "Comparativo de Mercado" },
  { value: "RENDA",               label: "Capitalização de Renda" },
  { value: "CUSTO_REPOSICAO",     label: "Custo de Reposição" },
  { value: "PLANTA_VALORES",      label: "Planta Genérica de Valores" },
  { value: "OUTRO",               label: "Outro" },
] as const;

export const avaliacoesPatrimoniaisApi = {
  listar(idImovel: number): Promise<AvaliacaoPatrimonialResponse[]> {
    return api.get(`/imoveis/${idImovel}/avaliacoes-patrimoniais`);
  },

  buscarPorId(idImovel: number, id: number): Promise<AvaliacaoPatrimonialResponse> {
    return api.get(`/imoveis/${idImovel}/avaliacoes-patrimoniais/${id}`);
  },

  criar(idImovel: number, data: AvaliacaoPatrimonialRequest): Promise<AvaliacaoPatrimonialResponse> {
    return api.post(`/imoveis/${idImovel}/avaliacoes-patrimoniais`, data);
  },

  atualizar(idImovel: number, id: number, data: AvaliacaoPatrimonialRequest): Promise<AvaliacaoPatrimonialResponse> {
    return api.put(`/imoveis/${idImovel}/avaliacoes-patrimoniais/${id}`, data);
  },

  deletar(idImovel: number, id: number): Promise<void> {
    return api.delete(`/imoveis/${idImovel}/avaliacoes-patrimoniais/${id}`);
  },
};
