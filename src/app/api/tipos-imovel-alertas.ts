import { api } from "./client";

// ── Tipos de Imóvel ──────────────────────────────────────────────────────────

export interface TipoImovelResponse {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface TipoImovelRequest {
  nome: string;
  codigo: string;
}

export const tiposImovelApi = {
  listarAtivos(): Promise<TipoImovelResponse[]> {
    return api.get("/tipos-imovel/ativos");
  },
  listarTodos(): Promise<TipoImovelResponse[]> {
    return api.get("/tipos-imovel");
  },
  criar(data: TipoImovelRequest): Promise<TipoImovelResponse> {
    return api.post("/tipos-imovel", data);
  },
  atualizar(id: number, data: TipoImovelRequest): Promise<TipoImovelResponse> {
    return api.put(`/tipos-imovel/${id}`, data);
  },
  ativar(id: number): Promise<TipoImovelResponse> {
    return api.patch(`/tipos-imovel/${id}/ativar`);
  },
  desativar(id: number): Promise<TipoImovelResponse> {
    return api.patch(`/tipos-imovel/${id}/desativar`);
  },
};

// ── Alertas ──────────────────────────────────────────────────────────────────

export interface AlertaResponse {
  id: number;
  idImovel: number;
  codigoSigpim: string | null;
  nomeImovel: string | null;
  idOrgao: number;
  titulo: string;
  descricao: string | null;
  lido: boolean;
  criadoEm: string;
}

export const alertasApi = {
  listar(): Promise<AlertaResponse[]> {
    return api.get("/alertas");
  },
  listarNaoLidos(): Promise<AlertaResponse[]> {
    return api.get("/alertas/nao-lidos");
  },
  contarNaoLidos(): Promise<{ total: number }> {
    return api.get("/alertas/contagem");
  },
  marcarComoLido(id: number): Promise<void> {
    return api.patch(`/alertas/${id}/lido`);
  },
  marcarTodosComoLidos(): Promise<void> {
    return api.patch("/alertas/marcar-todos-lidos");
  },
};
