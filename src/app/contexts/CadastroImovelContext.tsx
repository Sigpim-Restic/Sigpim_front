import React, { createContext, useCallback, useContext, useState } from "react";
import { imoveisApi, type ImovelRequest } from "../api/imoveis";
import { localizacoesApi } from "../api/localizacoes";
import { ocupacoesApi, type OcupacaoRequest } from "../api/ocupacoes";
import { documentosApi, type DocumentoUploadParams } from "../api/documentos";

// ── Tipos das etapas ─────────────────────────────────────────────────────────

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
  // idTipoImovel replaces the old tipoImovel string enum
  idTipoImovel: string;
  tipologia: string; destinacaoAtual: string;
  situacaoDominial: string; descricaoUso: string;
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
const e3: DadosEtapa3 = { idTipoImovel: "", tipologia: "", destinacaoAtual: "", situacaoDominial: "", descricaoUso: "" };
const e4: DadosEtapa4 = { areaTerrenoM2: "", areaConstruidaM2: "", numeroPavimentos: "", estadoConservacaoAtual: "", anoConstrucao: "" };
const e5: DadosEtapa5 = { statusOcupacao: "", nivelOcupacao: "", nomeOcupanteExterno: "", nomeResponsavelLocal: "", contatoResponsavel: "", destinacaoFinalidade: "", dataInicio: "", dataFimPrevista: "", observacoes: "" };

export function CadastroImovelProvider({ children }: { children: React.ReactNode }) {
  const [etapa1, setEtapa1] = useState<DadosEtapa1>(e1);
  const [etapa2, setEtapa2] = useState<DadosEtapa2>(e2);
  const [etapa3, setEtapa3] = useState<DadosEtapa3>(e3);
  const [etapa4, setEtapa4] = useState<DadosEtapa4>(e4);
  const [etapa5, setEtapa5] = useState<DadosEtapa5>(e5);
  const [arquivos, setArquivos] = useState<ArquivoAnexo[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);

  const resetar = useCallback(() => {
    setEtapa1(e1); setEtapa2(e2); setEtapa3(e3);
    setEtapa4(e4); setEtapa5(e5); setArquivos([]); setErro(null);
  }, []);

  const finalizar = useCallback(async (onSuccess: () => void) => {
    setSalvando(true);
    setErro(null);
    try {
      // Pre-registration: no field is mandatory.
      // idUnidadeGestora and idTipoImovel may be absent — that is allowed.
      const req: ImovelRequest = {
        nomeReferencia:           etapa1.nomeReferencia    || undefined,
        idTipoImovel:             etapa3.idTipoImovel      ? Number(etapa3.idTipoImovel)      : undefined,
        tipologia:                etapa3.tipologia         || undefined,
        situacaoDominial:         (etapa3.situacaoDominial as any) || undefined,
        observacoesGerais:        etapa1.observacoesGerais || undefined,
        areaTerrenoM2:            etapa4.areaTerrenoM2     ? parseFloat(etapa4.areaTerrenoM2)  : undefined,
        areaConstruidaM2:         etapa4.areaConstruidaM2  ? parseFloat(etapa4.areaConstruidaM2) : undefined,
        numeroPavimentos:         etapa4.numeroPavimentos  ? parseInt(etapa4.numeroPavimentos) : undefined,
        estadoConservacaoAtual:   etapa4.estadoConservacaoAtual || undefined,
        anoConstrucao:            etapa4.anoConstrucao     ? parseInt(etapa4.anoConstrucao) : undefined,
        idOrgaoGestorPatrimonial: etapa1.idOrgaoGestorPatrimonial ? Number(etapa1.idOrgaoGestorPatrimonial) : undefined,
        idUnidadeGestora:         etapa1.idUnidadeGestora  ? Number(etapa1.idUnidadeGestora)  : undefined,
      };

      const imovel = await imoveisApi.criar(req);

      // Save localization if coordinates or address were provided
      const temLocalizacao =
        etapa2.latitude || etapa2.longitude || etapa2.logradouro || etapa2.bairro;

      if (temLocalizacao) {
        await localizacoesApi.criar({
          idImovel:    imovel.id,
          logradouro:  etapa2.logradouro  || undefined,
          numero:      etapa2.numero      || undefined,
          complemento: etapa2.complemento || undefined,
          bairro:      etapa2.bairro      || undefined,
          cidade:      etapa2.cidade      || undefined,
          cep:         etapa2.cep         || undefined,
          latitude:    etapa2.latitude    ? parseFloat(etapa2.latitude)  : undefined,
          longitude:   etapa2.longitude   ? parseFloat(etapa2.longitude) : undefined,
        });
      }

      // Save occupation if status is defined and implies an occupant
      if (
        etapa5.statusOcupacao &&
        etapa5.statusOcupacao !== "DESOCUPADO" &&
        etapa5.statusOcupacao !== "DESCONHECIDO"
      ) {
        const ocReq: OcupacaoRequest = {
          idImovel:             imovel.id,
          statusOcupacao:       etapa5.statusOcupacao as any,
          nivelOcupacao:        (etapa5.nivelOcupacao as any) || undefined,
          nomeOcupanteExterno:  etapa5.nomeOcupanteExterno  || undefined,
          nomeResponsavelLocal: etapa5.nomeResponsavelLocal || undefined,
          contatoResponsavel:   etapa5.contatoResponsavel   || undefined,
          destinacaoFinalidade: etapa5.destinacaoFinalidade || undefined,
          dataInicio:           etapa5.dataInicio           || undefined,
          dataFimPrevista:      etapa5.dataFimPrevista      || undefined,
          observacoes:          etapa5.observacoes          || undefined,
          vigente:              true,
        };
        await ocupacoesApi.criar(ocReq);
      }

      // Upload files (max 10 MB each)
      for (const arq of arquivos.filter((a) => a.file.size <= 10 * 1024 * 1024)) {
        const params: DocumentoUploadParams = {
          idImovel:        imovel.id,
          tipoDocumento:   arq.tipo    || "OUTRO",
          descricao:       arq.descricao || arq.file.name,
          dataDocumento:   arq.dataDocumento || undefined,
          imagemPrincipal: arq.tipo === "FOTO",
        };
        await documentosApi.upload(arq.file, params);
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

export function useCadastroImovel(): Ctx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCadastroImovel must be used inside CadastroImovelProvider");
  return ctx;
}