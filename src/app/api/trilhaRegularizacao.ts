import { api } from "./client";

export interface MarcoRegularizacaoResponse {
  id: number;
  idTrilha: number;
  etapa: string;
  titulo: string;
  descricao: string | null;
  responsavel: string | null;
  idOrgaoResponsavel: number | null;
  prazo: string | null;
  dataConclusao: string | null;
  statusMarco: string;
  idDocumentoEvidencia: number | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface TrilhaRegularizacaoResponse {
  id: number;
  idImovel: number;
  statusTrilha: string;
  observacoes: string | null;
  marcos: MarcoRegularizacaoResponse[];
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface TrilhaRegularizacaoRequest {
  statusTrilha?: string;
  observacoes?: string;
}

export interface MarcoRegularizacaoRequest {
  etapa: string;
  titulo: string;
  descricao?: string;
  responsavel?: string;
  idOrgaoResponsavel?: number;
  prazo?: string;
  dataConclusao?: string;
  statusMarco?: string;
  idDocumentoEvidencia?: number;
}

export const ETAPAS_TRILHA = [
  { value: "PESQUISA_CARTORIAL", label: "Pesquisa Cartorial" },
  { value: "ANALISE_JURIDICA",   label: "Análise Jurídica" },
  { value: "ENCAMINHAMENTO",     label: "Encaminhamento" },
  { value: "ACOMPANHAMENTO",     label: "Acompanhamento" },
  { value: "CONCLUIDO",          label: "Concluído" },
];

export const STATUS_TRILHA = [
  { value: "NAO_INICIADA", label: "Não iniciada" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDA",    label: "Concluída" },
  { value: "SUSPENSA",     label: "Suspensa" },
];

export const STATUS_MARCO = [
  { value: "PENDENTE",     label: "Pendente" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO",    label: "Concluído" },
  { value: "CANCELADO",    label: "Cancelado" },
];

export const trilhaRegularizacaoApi = {
  buscar(idImovel: number): Promise<TrilhaRegularizacaoResponse | null> {
    return api.get<TrilhaRegularizacaoResponse>(`/imoveis/${idImovel}/trilha-regularizacao`)
      .catch(() => null);
  },
  salvar(idImovel: number, data: TrilhaRegularizacaoRequest): Promise<TrilhaRegularizacaoResponse> {
    return api.put(`/imoveis/${idImovel}/trilha-regularizacao`, data);
  },
  adicionarMarco(idImovel: number, data: MarcoRegularizacaoRequest): Promise<MarcoRegularizacaoResponse> {
    return api.post(`/imoveis/${idImovel}/trilha-regularizacao/marcos`, data);
  },
  atualizarMarco(idImovel: number, idMarco: number, data: MarcoRegularizacaoRequest): Promise<MarcoRegularizacaoResponse> {
    return api.put(`/imoveis/${idImovel}/trilha-regularizacao/marcos/${idMarco}`, data);
  },
};