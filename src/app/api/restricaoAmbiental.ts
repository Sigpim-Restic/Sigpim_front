import { api } from "./client";

export interface RestricaoAmbientalResponse {
  id: number;
  idImovel: number;
  restricaoExiste: boolean;
  tipoRestricao: string | null;
  licenciamentoNecessario: boolean;
  parecerSemmam: string | null;
  processoAmbiental: string | null;
  idDocumentoParecer: number | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface RestricaoAmbientalRequest {
  restricaoExiste?: boolean;
  tipoRestricao?: string;
  licenciamentoNecessario?: boolean;
  parecerSemmam?: string;
  processoAmbiental?: string;
  idDocumentoParecer?: number;
}

export const TIPO_RESTRICAO_OPTIONS = [
  { value: "APP",                 label: "Área de Preservação Permanente (APP)" },
  { value: "UNIDADE_CONSERVACAO", label: "Unidade de Conservação" },
  { value: "AREA_RISCO",          label: "Área de Risco" },
  { value: "OUTRA",               label: "Outra restrição" },
];

export const restricaoAmbientalApi = {
  buscar(idImovel: number): Promise<RestricaoAmbientalResponse | null> {
    return api.get<RestricaoAmbientalResponse>(`/imoveis/${idImovel}/restricao-ambiental`)
      .catch(() => null);
  },
  salvar(idImovel: number, data: RestricaoAmbientalRequest): Promise<RestricaoAmbientalResponse> {
    return api.put(`/imoveis/${idImovel}/restricao-ambiental`, data);
  },
};