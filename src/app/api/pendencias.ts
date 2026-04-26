import { api } from "./client";

export type PrioridadePendencia = "BAIXA" | "NORMAL" | "ALTA" | "CRITICA";
export type StatusPendencia     = "ABERTA" | "RESOLVIDA";

export interface PendenciaResponse {
  id: number;
  titulo: string;
  descricao: string | null;
  idImovel: number | null;
  codigoSigpim: string | null;
  nomeImovel: string | null;
  idUsuarioDestino: number | null;
  nomeUsuarioDestino: string | null;
  idOrgaoDestino: number | null;
  nomeOrgaoDestino: string | null;
  prazo: string | null;
  vencida: boolean;
  prioridade: PrioridadePendencia;
  status: StatusPendencia;
  criadoPor: number | null;
  nomeCriador: string | null;
  // Ciência formal — registrada na primeira visualização pelo destinatário
  cientePor: number | null;
  nomeCiente: string | null;
  cienteEm: string | null;
  // Resolução
  resolvidoPor: number | null;
  nomeResolvedor: string | null;
  resolvidoEm: string | null;
  observacaoResolucao: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PendenciaRequest {
  titulo: string;
  descricao?: string;
  idImovel?: number;
  idUsuarioDestino?: number;
  idOrgaoDestino?: number;
  prazo?: string;               // ISO date "YYYY-MM-DD"
  prioridade?: PrioridadePendencia;
}

export interface ResolucaoRequest {
  observacao?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const pendenciasApi = {
  /** Pendências visíveis para o usuário logado (para todos os perfis). */
  listarMinhas(status?: StatusPendencia, page = 0, size = 20): Promise<PageResponse<PendenciaResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.append("status", status);
    return api.get(`/pendencias/minhas?${params}`);
  },

  /** Todas as pendências — apenas admins. */
  listarTodas(status?: StatusPendencia, page = 0, size = 20): Promise<PageResponse<PendenciaResponse>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.append("status", status);
    return api.get(`/pendencias?${params}`);
  },

  /** Cria pendência manual — apenas admins. */
  criar(data: PendenciaRequest): Promise<PendenciaResponse> {
    return api.post("/pendencias", data);
  },

  /**
   * Registra ciência formal do destinatário.
   * Chamado automaticamente na primeira visualização — idempotente.
   */
  registrarCiencia(id: number): Promise<PendenciaResponse> {
    return api.patch(`/pendencias/${id}/ciente`);
  },

  /** Marca como resolvida — destinatário ou admin. */
  resolver(id: number, data?: ResolucaoRequest): Promise<PendenciaResponse> {
    return api.patch(`/pendencias/${id}/resolver`, data ?? {});
  },

  /** Exclui — apenas admins. */
  excluir(id: number): Promise<void> {
    return api.delete(`/pendencias/${id}`);
  },
};

// Labels e cores para uso nos componentes
export const PRIORIDADE_CFG: Record<PrioridadePendencia, { label: string; cls: string }> = {
  BAIXA:   { label: "Baixa",    cls: "bg-gray-100 text-gray-600"    },
  NORMAL:  { label: "Normal",   cls: "bg-blue-100 text-blue-700"    },
  ALTA:    { label: "Alta",     cls: "bg-orange-100 text-orange-700" },
  CRITICA: { label: "Crítica",  cls: "bg-red-100 text-red-700"      },
};