import { api } from "./client";

export interface ProjetoEspecialResponse {
  id: number;
  codigoProjeto: string | null;
  titulo: string;
  programa: string | null;
  descricao: string | null;
  statusProjeto: string;
  metas: string | null;
  cronogramaResumido: string | null;
  parceiros: string | null;
  dataInicioPrevista: string | null;
  dataFimPrevista: string | null;
  dataInicioReal: string | null;
  dataFimReal: string | null;
  idUsuarioResponsavel: number | null;
  idItemCarteira: number | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface ProjetoEspecialRequest {
  codigoProjeto?: string;
  titulo: string;
  programa?: string;
  descricao?: string;
  statusProjeto?: string;
  metas?: string;
  cronogramaResumido?: string;
  parceiros?: string;
  dataInicioPrevista?: string;
  dataFimPrevista?: string;
  dataInicioReal?: string;
  dataFimReal?: string;
  idUsuarioResponsavel?: number;
  idItemCarteira?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export const STATUS_PROJETO = [
  { value: "ESTUDO",        label: "Estudo" },
  { value: "PLANEJAMENTO",  label: "Planejamento" },
  { value: "CAPTACAO",      label: "Captação de Recursos" },
  { value: "EXECUCAO",      label: "Em Execução" },
  { value: "MONITORAMENTO", label: "Monitoramento" },
  { value: "CONCLUIDO",     label: "Concluído" },
  { value: "CANCELADO",     label: "Cancelado" },
];

export const projetosEspeciaisApi = {
  listar(page = 0, size = 20): Promise<PageResponse<ProjetoEspecialResponse>> {
    return api.get(`/projetos-especiais?page=${page}&size=${size}`);
  },
  listarPorImovel(idImovel: number): Promise<ProjetoEspecialResponse[]> {
    return api.get(`/imoveis/${idImovel}/projetos-especiais`);
  },
  buscarPorId(id: number): Promise<ProjetoEspecialResponse> {
    return api.get(`/projetos-especiais/${id}`);
  },
  criar(data: ProjetoEspecialRequest): Promise<ProjetoEspecialResponse> {
    return api.post("/projetos-especiais", data);
  },
  atualizar(id: number, data: ProjetoEspecialRequest): Promise<ProjetoEspecialResponse> {
    return api.put(`/projetos-especiais/${id}`, data);
  },
  deletar(id: number): Promise<void> {
    return api.delete(`/projetos-especiais/${id}`);
  },
};