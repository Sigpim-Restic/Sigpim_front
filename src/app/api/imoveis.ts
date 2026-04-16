import { api } from "./client";

export type StatusCadastro = "PRE_CADASTRO" | "VALIDADO";

export interface ImovelResponse {
  id: number;
  idSigpim: string;
  codigoSigpim: string;
  nomeReferencia: string | null;
  descricao: string | null;
  // Dynamic property type — replaces the fixed TipoImovel enum
  idTipoImovel: number | null;
  nomeTipoImovel: string | null;
  statusCadastro: StatusCadastro;
  idSituacaoDominial: number | null;
  nomeSituacaoDominial: string | null;
  origemCadastro: string | null;
  inscricaoImobiliaria: string | null;
  matriculaRegistro: string | null;
  cartorio: string | null;
  areaTerrenoM2: number | null;
  areaConstruidaM2: number | null;
  numeroPavimentos: number | null;
  anoConstrucao: number | null;
  categoriaMacro: string | null;
  tipologia: string | null;
  estadoConservacaoAtual: string | null;
  idOrgaoGestorPatrimonial: number | null;
  idOrgaoGestorOperacional: number | null;
  idUnidadeGestora: number | null;
  observacoesGerais: string | null;
  ativo: boolean;
  deletado: boolean;
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number | null;
  atualizadoPor: number | null;
  motivoEncerramento: string | null;
  encerradoEm: string | null;
  encerradoPor: number | null;
  // GIS coordinates resolved from localizacoes
  latitude: number | null;
  longitude: number | null;
}

export interface ImovelRequest {
  nomeReferencia?: string;
  descricao?: string;
  // All fields optional — no field is mandatory for pre-registration
  idTipoImovel?: number;
  idSituacaoDominial?: number;
  origemCadastro?: string;
  inscricaoImobiliaria?: string;
  matriculaRegistro?: string;
  cartorio?: string;
  areaTerrenoM2?: number;
  areaConstruidaM2?: number;
  numeroPavimentos?: number;
  anoConstrucao?: number;
  categoriaMacro?: string;
  tipologia?: string;
  estadoConservacaoAtual?: string;
  idOrgaoGestorPatrimonial?: number;
  idOrgaoGestorOperacional?: number;
  idUnidadeGestora?: number;
  observacoesGerais?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ValidacaoResponse {
  validado: boolean;
  pendencias: string[];
}

export const imoveisApi = {
  listar(page = 0, size = 20): Promise<PageResponse<ImovelResponse>> {
    return api.get(`/imoveis?page=${page}&size=${size}&sort=codigoSigpim`);
  },
  buscarPorId(id: number): Promise<ImovelResponse> {
    return api.get(`/imoveis/${id}`);
  },
  criar(data: ImovelRequest): Promise<ImovelResponse> {
    return api.post("/imoveis", data);
  },
  atualizar(id: number, data: ImovelRequest): Promise<ImovelResponse> {
    return api.put(`/imoveis/${id}`, data);
  },
  validar(id: number): Promise<ValidacaoResponse> {
    return api.patch(`/imoveis/${id}/validar`);
  },
  deletar(id: number): Promise<void> {
    return api.delete(`/imoveis/${id}`);
  },
};
