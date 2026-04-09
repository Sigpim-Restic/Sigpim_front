import { api } from "./client";
import type { PageResponse } from "./imoveis";

export type StatusValidacao = "PENDENTE" | "VALIDADO" | "REJEITADO" | "VENCIDO";

export interface DocumentoResponse {
  id: number;
  idImovel: number;
  idOcupacao: number | null;
  tipoDocumento: string;
  descricao: string;
  referenciaNumero: string | null;
  dataDocumento: string | null;
  dataValidade: string | null;
  caminhoArquivo: string;
  hashArquivo: string;
  tipoMime: string;
  tamanhoBytes: number;
  statusValidacao: StatusValidacao;
  imagemPrincipal: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DocumentoUploadParams {
  idImovel: number;
  tipoDocumento: string;
  descricao: string;
  idOcupacao?: number;
  referenciaNumero?: string;
  dataDocumento?: string;
  dataValidade?: string;
  imagemPrincipal?: boolean;
}

export const documentosApi = {
  listar(page = 0, size = 20): Promise<PageResponse<DocumentoResponse>> {
    return api.get(`/documentos?page=${page}&size=${size}`);
  },
  listarPorImovel(idImovel: number, page = 0, size = 20): Promise<PageResponse<DocumentoResponse>> {
    return api.get(`/documentos/imovel/${idImovel}?page=${page}&size=${size}`);
  },
  upload(arquivo: File, params: DocumentoUploadParams): Promise<DocumentoResponse> {
    const fd = new FormData();
    fd.append("arquivo", arquivo);
    fd.append("idImovel", String(params.idImovel));
    fd.append("tipoDocumento", params.tipoDocumento);
    fd.append("descricao", params.descricao);
    if (params.idOcupacao)       fd.append("idOcupacao", String(params.idOcupacao));
    if (params.referenciaNumero) fd.append("referenciaNumero", params.referenciaNumero);
    if (params.dataDocumento)    fd.append("dataDocumento", params.dataDocumento);
    if (params.dataValidade)     fd.append("dataValidade", params.dataValidade);
    fd.append("imagemPrincipal", String(params.imagemPrincipal ?? false));
    return api.upload("/documentos/upload", fd);
  },
  download(id: number): Promise<Blob> {
    return api.download(`/documentos/${id}/download`);
  },
  deletar(id: number): Promise<void> {
    return api.delete(`/documentos/${id}`);
  },
};
