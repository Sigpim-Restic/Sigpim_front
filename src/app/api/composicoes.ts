import { api } from "./client";

export interface ImovelDestinoForm {
  herdarDoPai: boolean;
  nomeReferencia?:       string;
  descricao?:            string;
  idTipoImovel?:         number;
  idSituacaoDominial?:   number;
  idOrigemCadastro?:     number;
  inscricaoImobiliaria?: string;
  matriculaRegistro?:    string;
  cartorio?:             string;
  registroEnergia?:      string;
  registroAgua?:         string;
  areaTerrenoM2?:        number;
  areaConstruidaM2?:     number;
  numeroPavimentos?:     number;
  anoConstrucao?:        number;
  categoriaMacro?:       string;
  tipologia?:            string;
  idOrgaoGestorPatrimonial?: number;
  idOrgaoGestorOperacional?: number;
  idUnidadeGestora?:     number;
}

export interface ComposicaoRequest {
  tipoOperacao: "DESMEMBRAMENTO" | "REMEMBRAMENTO" | "RETIFICACAO";
  idsImoveisOrigem: number[];
  imoveisDestino: ImovelDestinoForm[];
  numeroProcesso: string;
  observacoes?: string;
}

export interface HistoricoComposicaoResponse {
  id: number;
  tipoOperacao: string;
  idImovelOrigem: number;
  idImovelDestino: number;
  numeroProcesso: string;
  dataEvento: string;
  observacoes: string | null;
  criadoEm: string;
  criadoPor: number;
}

export interface ComposicaoResultadoResponse {
  tipoOperacao: string;
  numeroProcesso: string;
  imoveisOrigemEncerrados: unknown[];
  imoveisDestinosCriados: unknown[];
  vinculos: HistoricoComposicaoResponse[];
}

export const composicoesApi = {
  registrar(request: ComposicaoRequest): Promise<ComposicaoResultadoResponse> {
    return api.post<ComposicaoResultadoResponse>("/composicoes-imoveis", request);
  },

  listarPorOrigem(idImovel: number): Promise<{ content: HistoricoComposicaoResponse[] }> {
    return api.get(`/composicoes-imoveis/origem/${idImovel}`);
  },

  listarPorDestino(idImovel: number): Promise<{ content: HistoricoComposicaoResponse[] }> {
    return api.get(`/composicoes-imoveis/destino/${idImovel}`);
  },
};