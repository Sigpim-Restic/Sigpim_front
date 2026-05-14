import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { imoveisApi } from "../api/imoveis";
import { ocupacoesApi } from "../api/ocupacoes";
import { localizacoesApi } from "../api/localizacoes";
import type { ImovelRequest, ImovelResponse } from "../api/imoveis";
import type { OcupacaoRequest } from "../api/ocupacoes";

// ── Tipos das etapas ──────────────────────────────────────────────────────────

export interface DadosEtapa1 {
  nomeReferencia: string;
  idOrigemCadastro: string;
  idOrgaoGestorPatrimonial: string;
  idUnidadeGestora: string;
  observacoesGerais: string;
}
export interface DadosEtapa2 {
  logradouro: string; numero: string; complemento: string;
  bairro: string; cep: string;
  // Item 10: "cidade" removida — não era usada no request e estava hardcoded como "São Luís"
  latitude: string; longitude: string; geometriaWkt: string;
}
export interface DadosEtapa3 {
  idTipoImovel: string;
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
  statusOcupacao: string; nivelOcupacao: string;
  nomeOcupanteExterno: string; nomeResponsavelLocal: string;
  contatoResponsavel: string; destinacaoFinalidade: string;
  dataInicio: string; dataFimPrevista: string; observacoes: string;
}
export interface DadosEtapa6 {
  // Instrumentos e Contratos
  possuiInstrumento: string;
  tipoInstrumento: string;
  numeroInstrumento: string;
  dataAssinatura: string;
  dataInicio: string;
  dataVencimento: string;
  observacoes: string;
}
export interface DadosEtapa7 {
  // Dominial e Regularização
  idSituacaoDominial: string;
  matriculaRegistro: string;
  cartorio: string;
  inscricaoImobiliaria: string;
  observacoesDominial: string;
}
export interface DadosEtapa8 {
  // Patrimônio Histórico — item 3: dois flags independentes
  tombadoHistorico: boolean;
  tombadoCultural: boolean;
  observacoes: string;
}

interface Ctx {
  imovel: ImovelResponse | null;
  carregando: boolean;
  erroCarregamento: string | null;
  etapa1: DadosEtapa1; etapa2: DadosEtapa2; etapa3: DadosEtapa3;
  etapa4: DadosEtapa4; etapa5: DadosEtapa5; etapa6: DadosEtapa6;
  etapa7: DadosEtapa7; etapa8: DadosEtapa8;
  salvando: boolean; erro: string | null;
  setEtapa1: (d: DadosEtapa1) => void;
  setEtapa2: (d: DadosEtapa2) => void;
  setEtapa3: (d: DadosEtapa3) => void;
  setEtapa4: (d: DadosEtapa4) => void;
  setEtapa5: (d: DadosEtapa5) => void;
  setEtapa6: (d: DadosEtapa6) => void;
  setEtapa7: (d: DadosEtapa7) => void;
  setEtapa8: (d: DadosEtapa8) => void;
  salvar: (onSuccess: () => void) => Promise<void>;
}

const Ctx = createContext<Ctx | null>(null);

const vazios = {
  e1: (): DadosEtapa1 => ({ nomeReferencia: "", idOrigemCadastro: "", idOrgaoGestorPatrimonial: "", idUnidadeGestora: "", observacoesGerais: "" }),
  e2: (): DadosEtapa2 => ({ logradouro: "", numero: "", complemento: "", bairro: "", cep: "", latitude: "", longitude: "", geometriaWkt: "" }),
  e3: (): DadosEtapa3 => ({ idTipoImovel: "", tipologia: "", destinacaoAtual: "", descricaoUso: "" }),
  e4: (): DadosEtapa4 => ({ areaTerrenoM2: "", areaConstruidaM2: "", numeroPavimentos: "", estadoConservacaoAtual: "", anoConstrucao: "", registroEnergia: "", registroAgua: "" }),
  e5: (): DadosEtapa5 => ({ statusOcupacao: "", nivelOcupacao: "", nomeOcupanteExterno: "", nomeResponsavelLocal: "", contatoResponsavel: "", destinacaoFinalidade: "", dataInicio: "", dataFimPrevista: "", observacoes: "" }),
  e6: (): DadosEtapa6 => ({ possuiInstrumento: "", tipoInstrumento: "", numeroInstrumento: "", dataAssinatura: "", dataInicio: "", dataVencimento: "", observacoes: "" }),
  e7: (): DadosEtapa7 => ({ idSituacaoDominial: "", matriculaRegistro: "", cartorio: "", inscricaoImobiliaria: "", observacoesDominial: "" }),
  e8: (): DadosEtapa8 => ({ tombadoHistorico: false, tombadoCultural: false, observacoes: "" }),
};

export function EditarImovelProvider({ idImovel, children }: { idImovel: number; children: React.ReactNode }) {
  const [imovel,           setImovel]           = useState<ImovelResponse | null>(null);
  const [carregando,       setCarregando]       = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  const [etapa1, setEtapa1] = useState<DadosEtapa1>(vazios.e1());
  const [etapa2, setEtapa2] = useState<DadosEtapa2>(vazios.e2());
  const [etapa3, setEtapa3] = useState<DadosEtapa3>(vazios.e3());
  const [etapa4, setEtapa4] = useState<DadosEtapa4>(vazios.e4());
  const [etapa5, setEtapa5] = useState<DadosEtapa5>(vazios.e5());
  const [etapa6, setEtapa6] = useState<DadosEtapa6>(vazios.e6());
  const [etapa7, setEtapa7] = useState<DadosEtapa7>(vazios.e7());
  const [etapa8, setEtapa8] = useState<DadosEtapa8>(vazios.e8());
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);

  useEffect(() => {
    setCarregando(true);
    setErroCarregamento(null);

    Promise.all([
      imoveisApi.buscarPorId(idImovel),
      localizacoesApi.buscarPorImovel(idImovel).catch(() => null),
      ocupacoesApi.listarPorImovel(idImovel, 0, 1).catch(() => null),
    ])
      .then(([im, loc, ocupPage]) => {
        setImovel(im);

        // Etapa 1 — Identificação
        setEtapa1({
          nomeReferencia:           im.nomeReferencia ?? "",
          idOrigemCadastro:         im.idOrigemCadastro != null ? String(im.idOrigemCadastro) : "",
          idOrgaoGestorPatrimonial: im.idOrgaoGestorPatrimonial ? String(im.idOrgaoGestorPatrimonial) : "",
          idUnidadeGestora:         im.idUnidadeGestora ? String(im.idUnidadeGestora) : "",
          observacoesGerais:        im.observacoesGerais ?? "",
        });

        // Etapa 2 — Localização
        if (loc) {
          setEtapa2({
            logradouro:  loc.logradouro  ?? "",
            numero:      loc.numero      ?? "",
            complemento: loc.complemento ?? "",
            bairro:      loc.bairro      ?? "",
            cep:         loc.cep         ?? "",
            latitude:    loc.latitude    != null ? String(loc.latitude)  : "",
            longitude:   loc.longitude   != null ? String(loc.longitude) : "",
            geometriaWkt: loc.geometriaWkt ?? "",
          });
        }

        // Etapa 3 — Classificação
        setEtapa3({
          idTipoImovel:    im.idTipoImovel != null ? String(im.idTipoImovel) : "",
          tipologia:       im.tipologia        ?? "",
          destinacaoAtual: "",
          descricaoUso:    im.descricao        ?? "",
        });

        // Etapa 4 — Dados físicos
        setEtapa4({
          areaTerrenoM2:          im.areaTerrenoM2       != null ? String(im.areaTerrenoM2)       : "",
          areaConstruidaM2:       im.areaConstruidaM2    != null ? String(im.areaConstruidaM2)    : "",
          numeroPavimentos:       im.numeroPavimentos    != null ? String(im.numeroPavimentos)    : "",
          estadoConservacaoAtual: im.estadoConservacaoAtual ?? "",
          anoConstrucao:          im.anoConstrucao       != null ? String(im.anoConstrucao)       : "",
          registroEnergia:        im.registroEnergia     ?? "",
          registroAgua:           im.registroAgua        ?? "",
        });

        // Etapa 5 — Ocupação
        const ocup = ocupPage?.content?.[0];
        if (ocup && ocup.vigente) {
          setEtapa5({
            statusOcupacao:       ocup.statusOcupacao      ?? "",
            nivelOcupacao:        ocup.nivelOcupacao       ?? "",
            nomeOcupanteExterno:  ocup.nomeOcupanteExterno ?? "",
            nomeResponsavelLocal: ocup.nomeResponsavelLocal ?? "",
            contatoResponsavel:   ocup.contatoResponsavel  ?? "",
            destinacaoFinalidade: ocup.destinacaoFinalidade ?? "",
            dataInicio:           ocup.dataInicio          ?? "",
            dataFimPrevista:      ocup.dataFimPrevista      ?? "",
            observacoes:          ocup.observacoes         ?? "",
          });
        }

        // Etapa 6 — Instrumentos: não pré-populada (carregada separadamente na tela)

        // Etapa 7 — Dominial
        setEtapa7({
          idSituacaoDominial:   im.idSituacaoDominial != null ? String(im.idSituacaoDominial) : "",
          matriculaRegistro:    im.matriculaRegistro  ?? "",
          cartorio:             im.cartorio           ?? "",
          inscricaoImobiliaria: im.inscricaoImobiliaria ?? "",
          observacoesDominial:  "",
        });

        // Etapa 8 — Patrimônio histórico (item 3: dois flags independentes)
        setEtapa8({
          tombadoHistorico: im.tombadoHistorico ?? false,
          tombadoCultural:  im.tombadoCultural  ?? false,
          observacoes:      "",
        });
      })
      .catch(() => setErroCarregamento("Não foi possível carregar os dados do imóvel."))
      .finally(() => setCarregando(false));
  }, [idImovel]);

  const salvar = useCallback(async (onSuccess: () => void) => {
    if (!imovel) return;
    setSalvando(true);
    setErro(null);

    try {
      const req: ImovelRequest = {
        nomeReferencia:           etapa1.nomeReferencia    || undefined,
        idOrigemCadastro:         etapa1.idOrigemCadastro  ? Number(etapa1.idOrigemCadastro) : undefined,
        idTipoImovel:             etapa3.idTipoImovel ? Number(etapa3.idTipoImovel) : undefined,
        tipologia:                etapa3.tipologia         || undefined,
        descricao:                etapa3.descricaoUso ? etapa3.descricaoUso.slice(0, 500) : undefined,
        observacoesGerais:        etapa1.observacoesGerais ? etapa1.observacoesGerais.slice(0, 500) : undefined,
        areaTerrenoM2:            etapa4.areaTerrenoM2    ? parseFloat(etapa4.areaTerrenoM2)    : undefined,
        areaConstruidaM2:         etapa4.areaConstruidaM2 ? parseFloat(etapa4.areaConstruidaM2) : undefined,
        numeroPavimentos:         etapa4.numeroPavimentos  ? parseInt(etapa4.numeroPavimentos)   : undefined,
        estadoConservacaoAtual:   etapa4.estadoConservacaoAtual || undefined,
        anoConstrucao:            etapa4.anoConstrucao   ? parseInt(etapa4.anoConstrucao)       : undefined,
        registroEnergia:          etapa4.registroEnergia || undefined,
        registroAgua:             etapa4.registroAgua    || undefined,
        idSituacaoDominial:       etapa7.idSituacaoDominial ? Number(etapa7.idSituacaoDominial) : undefined,
        inscricaoImobiliaria:     etapa7.inscricaoImobiliaria || undefined,
        matriculaRegistro:        etapa7.matriculaRegistro   || undefined,
        cartorio:                 etapa7.cartorio            || undefined,
        // Item 3: dois flags independentes
        tombadoHistorico:         etapa8.tombadoHistorico || undefined,
        tombadoCultural:          etapa8.tombadoCultural  || undefined,
        imovelHistorico:          (etapa8.tombadoHistorico || etapa8.tombadoCultural) || undefined,
        idOrgaoGestorPatrimonial: etapa1.idOrgaoGestorPatrimonial ? Number(etapa1.idOrgaoGestorPatrimonial) : imovel.idOrgaoGestorPatrimonial ?? undefined,
        idUnidadeGestora:         etapa1.idUnidadeGestora ? Number(etapa1.idUnidadeGestora) : imovel.idUnidadeGestora ?? undefined,
      };

      await imoveisApi.atualizar(imovel.id, req);

      // Localização
      if (etapa2.latitude || etapa2.longitude || etapa2.logradouro) {
        const locReq = {
          idImovel:     imovel.id,
          logradouro:   etapa2.logradouro  || undefined,
          numero:       etapa2.numero      || undefined,
          complemento:  etapa2.complemento || undefined,
          bairro:       etapa2.bairro      || undefined,
          cep:          etapa2.cep         || undefined,
          latitude:     etapa2.latitude    ? parseFloat(etapa2.latitude)  : undefined,
          longitude:    etapa2.longitude   ? parseFloat(etapa2.longitude) : undefined,
          geometriaWkt: etapa2.geometriaWkt || undefined,
        };
        try {
          const locExistente = await localizacoesApi.buscarPorImovel(imovel.id);
          await localizacoesApi.atualizar(locExistente.id, locReq);
        } catch {
          await localizacoesApi.criar(locReq);
        }
      }

      onSuccess();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }, [imovel, etapa1, etapa2, etapa3, etapa4, etapa7, etapa8]);

  return (
    <Ctx.Provider value={{
      imovel, carregando, erroCarregamento,
      etapa1, etapa2, etapa3, etapa4, etapa5, etapa6, etapa7, etapa8,
      salvando, erro,
      setEtapa1, setEtapa2, setEtapa3, setEtapa4, setEtapa5,
      setEtapa6, setEtapa7, setEtapa8,
      salvar,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useEditarImovel() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEditarImovel deve ser usado dentro de EditarImovelProvider");
  return ctx;
}