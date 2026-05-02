import { api } from "./client";

export interface ClassificacaoUsoResponse {
  id: number;
  idImovel: number;
  categoriaFuncional: string | null;
  usoAtual: string | null;
  usoAtualDescricao: string | null;
  usoPlanejado: string | null;
  usoPlanejadoDescricao: string | null;
  publicoAtendido: string | null;
  horarioFuncionamento: string | null;
  capacidadeInstalada: string | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface ClassificacaoUsoRequest {
  categoriaFuncional?: string;
  usoAtual?: string;
  usoAtualDescricao?: string;
  usoPlanejado?: string;
  usoPlanejadoDescricao?: string;
  publicoAtendido?: string;
  horarioFuncionamento?: string;
  capacidadeInstalada?: string;
}

export const CATEGORIAS_FUNCIONAIS = [
  { value: "EDUCACAO",           label: "Educação" },
  { value: "SAUDE",              label: "Saúde" },
  { value: "ASSISTENCIA_SOCIAL", label: "Assistência Social" },
  { value: "CULTURA",            label: "Cultura" },
  { value: "ADMINISTRACAO",      label: "Administração" },
  { value: "SEGURANCA",          label: "Segurança Pública" },
  { value: "ESPORTE",            label: "Esporte e Lazer" },
  { value: "OUTRO",              label: "Outro" },
];

export const classificacaoUsoApi = {
  buscar(idImovel: number): Promise<ClassificacaoUsoResponse | null> {
    return api.get<ClassificacaoUsoResponse>(`/imoveis/${idImovel}/classificacao-uso`)
      .catch(() => null);
  },
  salvar(idImovel: number, data: ClassificacaoUsoRequest): Promise<ClassificacaoUsoResponse> {
    return api.put(`/imoveis/${idImovel}/classificacao-uso`, data);
  },
};