import { api } from "./client";

export interface ItemCarteiraSeplanResponse {
  id: number;
  codigoItem: string | null;
  titulo: string;
  descricao: string | null;
  statusCarteira: string;
  prioridade: string;
  rankingPrioridade: number | null;
  dependencias: string | null;
  observacoes: string | null;
  anoPrevisto: number | null;
  anoPrevistoFim: number | null;
  idUsuarioResponsavel: number | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface ItemCarteiraSeplanRequest {
  codigoItem?: string;
  titulo: string;
  descricao?: string;
  statusCarteira?: string;
  prioridade?: string;
  rankingPrioridade?: number;
  dependencias?: string;
  observacoes?: string;
  anoPrevisto?: number;
  anoPrevistoFim?: number;
  idUsuarioResponsavel?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export const STATUS_CARTEIRA = [
  { value: "IDEIA",          label: "Ideia" },
  { value: "ESTUDO",         label: "Estudo" },
  { value: "PRIORIZADO",     label: "Priorizado" },
  { value: "ETP",            label: "ETP" },
  { value: "TR",             label: "TR" },
  { value: "PROJETO_BASICO", label: "Projeto Básico" },
  { value: "LICITACAO",      label: "Licitação" },
  { value: "CONTRATADO",     label: "Contratado" },
  { value: "EM_EXECUCAO",    label: "Em Execução" },
  { value: "CONCLUIDO",      label: "Concluído" },
  { value: "CANCELADO",      label: "Cancelado" },
];

export const PRIORIDADES_CARTEIRA = [
  { value: "BAIXA",   label: "Baixa" },
  { value: "MEDIA",   label: "Média" },
  { value: "ALTA",    label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
];

export const carteiraSeplanApi = {
  listar(page = 0, size = 20): Promise<PageResponse<ItemCarteiraSeplanResponse>> {
    return api.get(`/carteira-seplan?page=${page}&size=${size}`);
  },
  listarPorImovel(idImovel: number): Promise<ItemCarteiraSeplanResponse[]> {
    return api.get(`/imoveis/${idImovel}/carteira-seplan`);
  },
  buscarPorId(id: number): Promise<ItemCarteiraSeplanResponse> {
    return api.get(`/carteira-seplan/${id}`);
  },
  criar(data: ItemCarteiraSeplanRequest): Promise<ItemCarteiraSeplanResponse> {
    return api.post("/carteira-seplan", data);
  },
  atualizar(id: number, data: ItemCarteiraSeplanRequest): Promise<ItemCarteiraSeplanResponse> {
    return api.put(`/carteira-seplan/${id}`, data);
  },
  deletar(id: number): Promise<void> {
    return api.delete(`/carteira-seplan/${id}`);
  },
};