import { api } from "./client";

export interface ParecerPaisagemUrbanaResponse {
  id: number;
  idImovel: number;
  diretrizePaisagem: string | null;
  restricoesFachada: string | null;
  parecerImpur: string | null;
  idDocumentoParecer: number | null;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: number;
  atualizadoPor: number;
}

export interface ParecerPaisagemUrbanaRequest {
  diretrizePaisagem?: string;
  restricoesFachada?: string;
  parecerImpur?: string;
  idDocumentoParecer?: number;
}

export const paisagemUrbanaApi = {
  buscar(idImovel: number): Promise<ParecerPaisagemUrbanaResponse | null> {
    return api.get<ParecerPaisagemUrbanaResponse>(`/imoveis/${idImovel}/paisagem-urbana`)
      .catch(() => null);
  },
  salvar(idImovel: number, data: ParecerPaisagemUrbanaRequest): Promise<ParecerPaisagemUrbanaResponse> {
    return api.put(`/imoveis/${idImovel}/paisagem-urbana`, data);
  },
};