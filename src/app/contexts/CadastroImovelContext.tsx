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
  tipoImovel: string;
  tipologia: string;
  destinacaoAtual: string;
  descricaoUso: string;
}
export interface DadosEtapa4 {
  areaTerrenoM2: string; areaConstruidaM2: string;
  numeroPavimentos: string; estadoConservacaoAtual: string; anoConstrucao: string;
  registroEnergia: string; registroAgua: string;
}
export interface DadosEtapa5 {
  statusOcupacao: string; idNivelOcupacao: string;
  nomeOcupanteExterno: string; nomeResponsavelLocal: string;
  contatoResponsavel: string; destinacaoFinalidade: string;
  dataInicio: string; dataFimPrevista: string; observacoes: string;
}
export interface DadosEtapa6 {
  possuiInstrumento: string;
  tipoInstrumento: string;
  numeroInstrumento: string;
  dataAssinatura: string;
  dataInicio: string;
  dataVencimento: string;
  observacoes: string;
}
export interface DadosEtapa7 {
  situacaoDominial: string;
  matriculaRegistro: string;
  cartorio: string;
  inscricaoImobiliaria: string;
  observacoes: string;
}
export interface DadosEtapa8 {
  imovelHistorico: string;
  observacoes: string;
}
export interface ArquivoAnexo {
  id: number; file: File; tipo: string; descricao: string; dataDocumento: string;
}

interface Ctx {
  etapa1: DadosEtapa1; etapa2: DadosEtapa2; etapa3: DadosEtapa3;
  etapa4: DadosEtapa4; etapa5: DadosEtapa5; etapa6: DadosEtapa6;
  etapa7: DadosEtapa7; etapa8: DadosEtapa8;
  arquivos: ArquivoAnexo[]; salvando: boolean; erro: string | null;
  setEtapa1: (d: DadosEtapa1) => void;
  setEtapa2: (d: DadosEtapa2) => void;
  setEtapa3: (d: DadosEtapa3) => void;
  setEtapa4: (d: DadosEtapa4) => void;
  setEtapa5: (d: DadosEtapa5) => void;
  setEtapa6: (d: DadosEtapa6) => void;
  setEtapa7: (d: DadosEtapa7) => void;
  setEtapa8: (d: DadosEtapa8) => void;
  setArquivos: (a: ArquivoAnexo[]) => void;
  finalizar: (onSuccess: () => void) => Promise<void>;
  resetar: () => void;
  salvarRascunhoManual: () => void;
  temRascunho: boolean;
}

const Ctx = createContext<Ctx | null>(null);

const e1: DadosEtapa1 = { nomeReferencia: "", idOrgaoGestorPatrimonial: "", idUnidadeGestora: "", observacoesGerais: "" };
const e2: DadosEtapa2 = { logradouro: "", numero: "", complemento: "", bairro: "", cidade: "São Luís", cep: "", latitude: "", longitude: "" };
const e3: DadosEtapa3 = { tipoImovel: "", tipologia: "", destinacaoAtual: "", descricaoUso: "" };
const e4: DadosEtapa4 = { areaTerrenoM2: "", areaConstruidaM2: "", numeroPavimentos: "", estadoConservacaoAtual: "", anoConstrucao: "", registroEnergia: "", registroAgua: "" };
const e5: DadosEtapa5 = { statusOcupacao: "", idNivelOcupacao: "", nomeOcupanteExterno: "", nomeResponsavelLocal: "", contatoResponsavel: "", destinacaoFinalidade: "", dataInicio: "", dataFimPrevista: "", observacoes: "" };
const e6: DadosEtapa6 = { possuiInstrumento: "", tipoInstrumento: "", numeroInstrumento: "", dataAssinatura: "", dataInicio: "", dataVencimento: "", observacoes: "" };
const e7: DadosEtapa7 = { situacaoDominial: "", matriculaRegistro: "", cartorio: "", inscricaoImobiliaria: "", observacoes: "" };
const e8: DadosEtapa8 = { imovelHistorico: "", observacoes: "" };


const LS_KEY = "sigpim_rascunho_imovel";

function salvarRascunho(state: object) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}
function carregarRascunho() {
  try { const v = localStorage.getItem(LS_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}
function limparRascunho() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}
export function CadastroImovelProvider({ children }: { children: React.ReactNode }) {
  const rascunho = carregarRascunho();
  const [etapa1, setEtapa1] = useState<DadosEtapa1>(rascunho?.etapa1 ?? e1);
  const [etapa2, setEtapa2] = useState<DadosEtapa2>(rascunho?.etapa2 ?? e2);
  const [etapa3, setEtapa3] = useState<DadosEtapa3>(rascunho?.etapa3 ?? e3);
  const [etapa4, setEtapa4] = useState<DadosEtapa4>(rascunho?.etapa4 ?? e4);
  const [etapa5, setEtapa5] = useState<DadosEtapa5>(rascunho?.etapa5 ?? e5);
  const [etapa6, setEtapa6] = useState<DadosEtapa6>(rascunho?.etapa6 ?? e6);
  const [etapa7, setEtapa7] = useState<DadosEtapa7>(rascunho?.etapa7 ?? e7);
  const [etapa8, setEtapa8] = useState<DadosEtapa8>(rascunho?.etapa8 ?? e8);
  const [arquivos, setArquivos] = useState<ArquivoAnexo[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);

  const resetar = useCallback(() => {
    setEtapa1(e1); setEtapa2(e2); setEtapa3(e3); setEtapa4(e4);
    setEtapa5(e5); setEtapa6(e6); setEtapa7(e7); setEtapa8(e8);
    setArquivos([]); setErro(null);
    limparRascunho();
  }, []);

  const salvarRascunhoManual = useCallback(() => {
    salvarRascunho({ etapa1, etapa2, etapa3, etapa4, etapa5, etapa6, etapa7, etapa8 });
  }, [etapa1, etapa2, etapa3, etapa4, etapa5, etapa6, etapa7, etapa8]);

  const finalizar = useCallback(async (onSuccess: () => void) => {
    setSalvando(true);
    setErro(null);
    try {
      const idTipoImovel = etapa3.tipoImovel && /^\d+$/.test(etapa3.tipoImovel)
        ? Number(etapa3.tipoImovel)
        : undefined;

      const req: ImovelRequest = {
        nomeReferencia:           etapa1.nomeReferencia         || undefined,
        idTipoImovel,
        descricao:                etapa3.descricaoUso ? etapa3.descricaoUso.slice(0, 500) : undefined,
        tipologia:                etapa3.tipologia              || undefined,
        observacoesGerais:        etapa1.observacoesGerais ? etapa1.observacoesGerais.slice(0, 500) : undefined,
        areaTerrenoM2:            etapa4.areaTerrenoM2          ? parseFloat(etapa4.areaTerrenoM2)      : undefined,
        areaConstruidaM2:         etapa4.areaConstruidaM2 !== "" ? parseFloat(etapa4.areaConstruidaM2) : undefined,
        numeroPavimentos:         etapa4.numeroPavimentos       ? parseInt(etapa4.numeroPavimentos)     : undefined,
        estadoConservacaoAtual:   etapa4.estadoConservacaoAtual || undefined,
        anoConstrucao:            etapa4.anoConstrucao          ? parseInt(etapa4.anoConstrucao)        : undefined,
        registroEnergia:          etapa4.registroEnergia        || undefined,
        registroAgua:             etapa4.registroAgua           || undefined,
        idOrgaoGestorPatrimonial: etapa1.idOrgaoGestorPatrimonial ? Number(etapa1.idOrgaoGestorPatrimonial) : undefined,
        idUnidadeGestora:         etapa1.idUnidadeGestora       ? Number(etapa1.idUnidadeGestora)       : undefined,
        // Dominial (etapa7)
        inscricaoImobiliaria:     etapa7.inscricaoImobiliaria   || undefined,
        matriculaRegistro:        etapa7.matriculaRegistro      || undefined,
        cartorio:                 etapa7.cartorio               || undefined,
        // Patrimônio histórico (etapa8)
        imovelHistorico: etapa8.imovelHistorico === "SIM_TOMBADO" ||
                         etapa8.imovelHistorico === "SIM_EM_PROCESSO" ||
                         etapa8.imovelHistorico === "SIM_INVENTARIADO"
                         ? true
                         : etapa8.imovelHistorico === "NAO" ? false : undefined,
      };

      const imovel = await imoveisApi.criar(req);

      // Localização
      const temLocalizacao = etapa2.latitude || etapa2.longitude || etapa2.logradouro || etapa2.bairro;
      if (temLocalizacao) {
        await localizacoesApi.criar({
          idImovel:    imovel.id,
          logradouro:  etapa2.logradouro  || undefined,
          numero:      etapa2.numero      || undefined,
          complemento: etapa2.complemento || undefined,
          bairro:      etapa2.bairro      || undefined,
          cep:         etapa2.cep         || undefined,
          latitude:    etapa2.latitude    ? parseFloat(etapa2.latitude)  : undefined,
          longitude:   etapa2.longitude   ? parseFloat(etapa2.longitude) : undefined,
        });
      }

      // Ocupação
      if (etapa5.statusOcupacao && etapa5.statusOcupacao !== "DESOCUPADO" && etapa5.statusOcupacao !== "DESCONHECIDO") {
        const ocReq: OcupacaoRequest = {
          idImovel:             imovel.id,
          statusOcupacao:       etapa5.statusOcupacao as any,
          idNivelOcupacao:      etapa5.idNivelOcupacao ? Number(etapa5.idNivelOcupacao) : undefined,
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

      // Documentos/anexos
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

      resetar(); // also clears localStorage
      onSuccess();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar imóvel.");
    } finally {
      setSalvando(false);
    }
  }, [etapa1, etapa2, etapa3, etapa4, etapa5, etapa6, etapa7, etapa8, arquivos, resetar]);

  return (
    <Ctx.Provider value={{
      etapa1, etapa2, etapa3, etapa4, etapa5, etapa6, etapa7, etapa8,
      arquivos, salvando, erro,
      setEtapa1, setEtapa2, setEtapa3, setEtapa4, setEtapa5,
      setEtapa6, setEtapa7, setEtapa8, setArquivos,
      finalizar, resetar, salvarRascunhoManual,
      temRascunho: carregarRascunho() !== null,
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