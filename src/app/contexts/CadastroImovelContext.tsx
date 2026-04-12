import React, { createContext, useContext, useState, useCallback } from "react";
import { imoveisApi, ocupacoesApi, documentosApi, localizacoesApi } from "../api";
import type { ImovelRequest } from "../api/imoveis";
import type { OcupacaoRequest } from "../api/ocupacoes";
import type { DocumentoUploadParams } from "../api/documentos";
import type { LocalizacaoRequest } from "../api/localizacoes";

export interface DadosEtapa1 {
  nomeReferencia: string;
  idOrgaoGestorPatrimonial: string;
  idUnidadeGestora: string;
  observacoesGerais: string;
}
export interface DadosEtapa2 {
  logradouro: string; numero: string; complemento: string;
  bairro: string; cidade: string; cep: string;
  latitude: string; longitude: string;
}
export interface DadosEtapa3 {
  tipoImovel: string; tipologia: string;
  destinacaoAtual: string; situacaoDominial: string; descricaoUso: string;
}
export interface DadosEtapa4 {
  areaTerrenoM2: string; areaConstruidaM2: string;
  numeroPavimentos: string; estadoConservacaoAtual: string; anoConstrucao: string;
}
export interface DadosEtapa5 {
  statusOcupacao: string; nivelOcupacao: string;
  nomeOcupanteExterno: string; nomeResponsavelLocal: string;
  contatoResponsavel: string; destinacaoFinalidade: string;
  dataInicio: string; dataFimPrevista: string; observacoes: string;
}
export interface ArquivoAnexo {
  id: number; file: File; tipo: string; descricao: string; dataDocumento: string;
}

interface Ctx {
  etapa1: DadosEtapa1; etapa2: DadosEtapa2; etapa3: DadosEtapa3;
  etapa4: DadosEtapa4; etapa5: DadosEtapa5;
  arquivos: ArquivoAnexo[]; salvando: boolean; erro: string | null;
  setEtapa1: (d: DadosEtapa1) => void;
  setEtapa2: (d: DadosEtapa2) => void;
  setEtapa3: (d: DadosEtapa3) => void;
  setEtapa4: (d: DadosEtapa4) => void;
  setEtapa5: (d: DadosEtapa5) => void;
  setArquivos: (a: ArquivoAnexo[]) => void;
  finalizar: (onSuccess: () => void) => Promise<void>;
  resetar: () => void;
}

const Ctx = createContext<Ctx | null>(null);

const e1: DadosEtapa1 = { nomeReferencia: "", idOrgaoGestorPatrimonial: "", idUnidadeGestora: "", observacoesGerais: "" };
const e2: DadosEtapa2 = { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "São Luís", cep: "", latitude: "", longitude: "" };
const e3: DadosEtapa3 = { tipoImovel: "", tipologia: "", destinacaoAtual: "", situacaoDominial: "", descricaoUso: "" };
const e4: DadosEtapa4 = { areaTerrenoM2: "", areaConstruidaM2: "", numeroPavimentos: "", estadoConservacaoAtual: "", anoConstrucao: "" };
const e5: DadosEtapa5 = { statusOcupacao: "", nivelOcupacao: "", nomeOcupanteExterno: "", nomeResponsavelLocal: "", contatoResponsavel: "", destinacaoFinalidade: "", dataInicio: "", dataFimPrevista: "", observacoes: "" };

// Status de ocupação que devem gerar um registro de ocupação no backend.
// DESOCUPADO e DESCONHECIDO são informativos e não requerem registro.
// BUG FIX: NAO_REGULARIZADO was missing from this list — it IS a valid
// StatusOcupacao enum value in the backend and must be persisted.
const STATUS_QUE_CRIAM_OCUPACAO = new Set([
  "OCUPADO",
  "NAO_REGULARIZADO",
]);

export function CadastroImovelProvider({ children }: { children: React.ReactNode }) {
  const [etapa1, setEtapa1] = useState<DadosEtapa1>(e1);
  const [etapa2, setEtapa2] = useState<DadosEtapa2>(e2);
  const [etapa3, setEtapa3] = useState<DadosEtapa3>(e3);
  const [etapa4, setEtapa4] = useState<DadosEtapa4>(e4);
  const [etapa5, setEtapa5] = useState<DadosEtapa5>(e5);
  const [arquivos, setArquivos] = useState<ArquivoAnexo[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resetar = useCallback(() => {
    setEtapa1(e1); setEtapa2(e2); setEtapa3(e3);
    setEtapa4(e4); setEtapa5(e5); setArquivos([]); setErro(null);
  }, []);

  const finalizar = useCallback(async (onSuccess: () => void) => {
    setSalvando(true);
    setErro(null);
    try {
      // ── Step 1: resolve IDs ──────────────────────────────────────────────
      const idOrgao = etapa1.idOrgaoGestorPatrimonial
        ? Number(etapa1.idOrgaoGestorPatrimonial)
        : undefined;

      const idUnidade = etapa1.idUnidadeGestora
        ? Number(etapa1.idUnidadeGestora)
        : undefined;

      if (!idUnidade) {
        throw new Error("Unidade gestora não selecionada. Volte à Etapa 1 e selecione uma unidade.");
      }

      // ── Step 2: create imovel ────────────────────────────────────────────
      const req: ImovelRequest = {
        nomeReferencia:           etapa1.nomeReferencia || undefined,
        tipoImovel:               (etapa3.tipoImovel as any) || "INCERTO",
        tipologia:                etapa3.tipologia || undefined,
        situacaoDominial:         (etapa3.situacaoDominial as any) || undefined,
        observacoesGerais:        etapa1.observacoesGerais || undefined,
        areaTerrenoM2:            etapa4.areaTerrenoM2 ? parseFloat(etapa4.areaTerrenoM2) : undefined,
        areaConstruidaM2:         etapa4.areaConstruidaM2 ? parseFloat(etapa4.areaConstruidaM2) : undefined,
        numeroPavimentos:         etapa4.numeroPavimentos ? parseInt(etapa4.numeroPavimentos) : undefined,
        estadoConservacaoAtual:   etapa4.estadoConservacaoAtual || undefined,
        anoConstrucao:            etapa4.anoConstrucao ? parseInt(etapa4.anoConstrucao) : undefined,
        idOrgaoGestorPatrimonial: idOrgao,
        idUnidadeGestora:         idUnidade,
      };

      const imovel = await imoveisApi.criar(req);

      // ── Step 3: create localizacao ───────────────────────────────────────
      // BUG FIX: the previous context sent localizacao only when logradouro,
      // lat or lng were filled. Fields like bairro, numero and cep were silently
      // discarded. Now we check any address field and always persist what was
      // filled in step 2.
      const temEndereco    = etapa2.logradouro.trim() || etapa2.bairro.trim() || etapa2.cep.trim() || etapa2.numero.trim();
      const temCoordenadas = etapa2.latitude.trim() && etapa2.longitude.trim();

      if (temEndereco || temCoordenadas) {
        const locReq: LocalizacaoRequest = {
          idImovel:    imovel.id,
          logradouro:  etapa2.logradouro.trim()  || undefined,
          numero:      etapa2.numero.trim()      || undefined,
          complemento: etapa2.complemento.trim() || undefined,
          bairro:      etapa2.bairro.trim()      || undefined,
          cep:         etapa2.cep.replace(/\D/g, "") || undefined,
          latitude:    temCoordenadas ? parseFloat(etapa2.latitude)  : undefined,
          longitude:   temCoordenadas ? parseFloat(etapa2.longitude) : undefined,
        };
        await localizacoesApi.criar(locReq);
      }

      // ── Step 4: create ocupacao ──────────────────────────────────────────
      // BUG FIX: "NAO_REGULARIZADO" was excluded from the condition because
      // the old code only allowed "OCUPADO". But NAO_REGULARIZADO is a valid
      // StatusOcupacao enum value in the backend and must be persisted too.
      if (etapa5.statusOcupacao && STATUS_QUE_CRIAM_OCUPACAO.has(etapa5.statusOcupacao)) {
        const ocReq: OcupacaoRequest = {
          idImovel:             imovel.id,
          statusOcupacao:       etapa5.statusOcupacao as any,
          nivelOcupacao:        (etapa5.nivelOcupacao as any) || undefined,
          nomeOcupanteExterno:  etapa5.nomeOcupanteExterno || undefined,
          nomeResponsavelLocal: etapa5.nomeResponsavelLocal || undefined,
          contatoResponsavel:   etapa5.contatoResponsavel || undefined,
          destinacaoFinalidade: etapa5.destinacaoFinalidade || undefined,
          dataInicio:           etapa5.dataInicio || undefined,
          dataFimPrevista:      etapa5.dataFimPrevista || undefined,
          observacoes:          etapa5.observacoes || undefined,
          vigente:              true,
        };
        await ocupacoesApi.criar(ocReq);
      }

      // ── Step 5: upload documents (non-fatal) ─────────────────────────────
      for (const arq of arquivos.filter((a) => a.file.size <= 10 * 1024 * 1024)) {
        const params: DocumentoUploadParams = {
          idImovel:        imovel.id,
          tipoDocumento:   arq.tipo || "OUTRO",
          descricao:       arq.descricao || arq.file.name,
          dataDocumento:   arq.dataDocumento || undefined,
          imagemPrincipal: arq.tipo === "FOTO",
        };
        try {
          await documentosApi.upload(arq.file, params);
        } catch (uploadErr) {
          // Document upload is non-fatal: the property was already created.
          // Storage issues (e.g. serverless environment) should not block
          // the wizard from completing.
          console.error(`[CadastroImovel] Failed to upload "${arq.file.name}":`, uploadErr);
        }
      }

      resetar();
      onSuccess();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar imóvel.");
    } finally {
      setSalvando(false);
    }
  }, [etapa1, etapa2, etapa3, etapa4, etapa5, arquivos, resetar]);

  return (
    <Ctx.Provider value={{
      etapa1, etapa2, etapa3, etapa4, etapa5, arquivos, salvando, erro,
      setEtapa1, setEtapa2, setEtapa3, setEtapa4, setEtapa5, setArquivos,
      finalizar, resetar,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCadastroImovel() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCadastroImovel deve ser usado dentro de CadastroImovelProvider");
  return ctx;
}