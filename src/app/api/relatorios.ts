import { api } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface RelatorioGeradoResponse {
  idRelatorioGerado: number;
  idTipoRelatorio: number;
  nomeTipoRelatorio: string | null;
  idImovel: number | null;
  codigoSigpim: string | null;
  nomeArquivo: string;
  geradoEm: string;
  token: string | null;
  urlVerificacao: string | null;
}

export interface VerificacaoResponse {
  idRelatorioGerado: number;
  nomeTipoRelatorio: string | null;
  codigoSigpim: string | null;
  nomeArquivo: string;
  nomeGeradoPor: string | null;
  geradoEm: string;
  token: string;
}

export const relatoriosApi = {
  /**
   * Gera a Ficha Cadastral do Imóvel em PDF com QR Code.
   * Retorna Blob do PDF para download/visualização no browser.
   */
  async gerarFichaPdf(idImovel: number): Promise<{ blob: Blob; nomeArquivo: string }> {
    const token = localStorage.getItem("sigpim_token");
    const res = await fetch(`${BASE_URL}/imoveis/${idImovel}/ficha-pdf`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      let msg = `Erro ao gerar PDF (${res.status})`;
      try { msg = JSON.parse(text)?.message ?? msg; } catch { /* ignore */ }
      throw new Error(msg);
    }

    const blob = await res.blob();
    // Extrai nome do arquivo do header Content-Disposition se disponível
    const cd = res.headers.get("Content-Disposition") ?? "";
    const match = cd.match(/filename="?([^";\s]+)"?/);
    const nomeArquivo = match?.[1] ?? `ficha-imovel-${idImovel}.pdf`;

    return { blob, nomeArquivo };
  },

  /**
   * Verifica autenticidade de documento via token do QR Code.
   * Endpoint público — não requer autenticação.
   */
  async verificarDocumento(token: string): Promise<VerificacaoResponse> {
    return api.get<VerificacaoResponse>(`/relatorios/verificar/${token}`);
  },
};