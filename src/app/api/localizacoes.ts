import { api } from "./client";

export interface LocalizacaoResponse {
  id: number;
  idImovel: number;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  distritoRegional: string | null;
  cep: string | null;
  latitude: number | null;
  longitude: number | null;
  geometriaWkt: string | null;
  tipoGeometria: string | null;
  sistemaCoordenadas: string | null;
  fonteGeometria: string | null;
  precisaoLocalizacao: string | null;
  seloGis: string | null;
  revisaoIncid: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LocalizacaoRequest {
  idImovel: number;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  distritoRegional?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  geometriaWkt?: string;
  sistemaCoordenadas?: string;
  fonteGeometria?: string;
  precisaoLocalizacao?: string;
}

export const localizacoesApi = {
  buscarPorImovel(idImovel: number): Promise<LocalizacaoResponse> {
    return api.get(`/localizacoes/imovel/${idImovel}`);
  },
  criar(data: LocalizacaoRequest): Promise<LocalizacaoResponse> {
    return api.post("/localizacoes", data);
  },
  atualizar(id: number, data: LocalizacaoRequest): Promise<LocalizacaoResponse> {
    return api.put(`/localizacoes/${id}`, data);
  },
};