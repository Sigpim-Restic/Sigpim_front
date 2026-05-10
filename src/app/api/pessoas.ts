import { api } from "./client";

export type TipoPessoa = "PF" | "PJ" | "ORGAO_PUBLICO";

export interface PessoaResponse {
  id: number;
  tipoPessoa: TipoPessoa;
  nome: string;
  cpfCnpj: string | null;
  rg: string | null;
  inscricaoMunicipal: string | null;
  numeroCredor: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number | null;
  atualizadoPor: number | null;
}

export interface PessoaRequest {
  tipoPessoa: TipoPessoa;
  nome: string;
  cpfCnpj?: string;
  rg?: string;
  inscricaoMunicipal?: string;
  numeroCredor?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
}

export const TIPO_PESSOA_LABELS: Record<TipoPessoa, string> = {
  PF:           "Pessoa Física",
  PJ:           "Pessoa Jurídica",
  ORGAO_PUBLICO: "Órgão Público",
};

export const pessoasApi = {
  buscar(params?: { busca?: string; tipo?: string; page?: number; size?: number }):
    Promise<{ content: PessoaResponse[]; totalElements: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params?.busca) q.set("busca", params.busca);
    if (params?.tipo)  q.set("tipo", params.tipo);
    if (params?.page != null) q.set("page", String(params.page));
    q.set("size", String(params?.size ?? 20));
    q.set("sort", "nome");
    return api.get(`/pessoas?${q}`);
  },

  buscarPorId(id: number): Promise<PessoaResponse> {
    return api.get(`/pessoas/${id}`);
  },

  criar(data: PessoaRequest): Promise<PessoaResponse> {
    return api.post("/pessoas", data);
  },

  atualizar(id: number, data: PessoaRequest): Promise<PessoaResponse> {
    return api.put(`/pessoas/${id}`, data);
  },

  deletar(id: number): Promise<void> {
    return api.delete(`/pessoas/${id}`);
  },
};