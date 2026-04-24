import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { imoveisApi } from "../api/imoveis";
import { ocupacoesApi } from "../api/ocupacoes";
import { localizacoesApi } from "../api/localizacoes";
import type { ImovelRequest, ImovelResponse } from "../api/imoveis";
import type { OcupacaoRequest } from "../api/ocupacoes";

// Reutiliza os mesmos tipos de dados de cada etapa do wizard de criação
export interface DadosEtapa1 {
  nomeReferencia: string;
  idOrgaoGestorPatrimonial: string;
  idUnidadeGestora: string;
  observacoesGerais: string;
}
export interface DadosEtapa2 {
  logradouro: string; numero: string; complemento: string;
  bairro: string; cidade: string; cep: string;
  latitude: string; longitude: string; geometriaWkt: string;
}
export interface DadosEtapa3 {
  tipoImovel: string; tipologia: string;
  idSituacaoDominial: string; destinacaoAtual: string; descricaoUso: string;
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
export interface DadosEtapa6 {
  idSituacaoDominial: string;
  matriculaRegistro: string;
  cartorio: string;
  inscricaoImobiliaria: string;
  observacoesDominial: string;
}

interface Ctx {
  imovel: ImovelResponse | null;
  carregando: boolean;
  erroCarregamento: string | null;
  etapa1: DadosEtapa1; etapa2: DadosEtapa2; etapa3: DadosEtapa3;
  etapa4: DadosEtapa4; etapa5: DadosEtapa5; etapa6: DadosEtapa6;
  salvando: boolean; erro: string | null;
  setEtapa1: (d: DadosEtapa1) => void;
  setEtapa2: (d: DadosEtapa2) => void;
  setEtapa3: (d: DadosEtapa3) => void;
  setEtapa4: (d: DadosEtapa4) => void;
  setEtapa5: (d: DadosEtapa5) => void;
  setEtapa6: (d: DadosEtapa6) => void;
  salvar: (onSuccess: () => void) => Promise<void>;
}

const Ctx = createContext<Ctx | null>(null);

const vazios = {
  e1: (): DadosEtapa1 => ({ nomeReferencia: "", idOrgaoGestorPatrimonial: "", idUnidadeGestora: "", observacoesGerais: "" }),
  e2: (): DadosEtapa2 => ({ logradouro: "", numero: "", complemento: "", bairro: "", cidade: "São Luís", cep: "", latitude: "", longitude: "", geometriaWkt: "" }),
  e3: (): DadosEtapa3 => ({ tipoImovel: "", idTipoImovel: "", tipologia: "", destinacaoAtual: "", descricaoUso: "" }),
  e4: (): DadosEtapa4 => ({ areaTerrenoM2: "", areaConstruidaM2: "", numeroPavimentos: "", estadoConservacaoAtual: "", anoConstrucao: "" }),
  e5: (): DadosEtapa5 => ({ statusOcupacao: "", nivelOcupacao: "", nomeOcupanteExterno: "", nomeResponsavelLocal: "", contatoResponsavel: "", destinacaoFinalidade: "", dataInicio: "", dataFimPrevista: "", observacoes: "" }),
  e6: (): DadosEtapa6 => ({ idSituacaoDominial: "", matriculaRegistro: "", cartorio: "", inscricaoImobiliaria: "", observacoesDominial: "" }),
};

export function EditarImovelProvider({
  idImovel,
  children,
}: {
  idImovel: number;
  children: React.ReactNode;
}) {
  const [imovel,           setImovel]           = useState<ImovelResponse | null>(null);
  const [carregando,       setCarregando]       = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  const [etapa1, setEtapa1] = useState<DadosEtapa1>(vazios.e1());
  const [etapa2, setEtapa2] = useState<DadosEtapa2>(vazios.e2());
  const [etapa3, setEtapa3] = useState<DadosEtapa3>(vazios.e3());
  const [etapa4, setEtapa4] = useState<DadosEtapa4>(vazios.e4());
  const [etapa5, setEtapa5] = useState<DadosEtapa5>(vazios.e5());
  const [etapa6, setEtapa6] = useState<DadosEtapa6>(vazios.e6());
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);

  // Carrega o imóvel e pré-preenche todos os formulários
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
            cidade:      "São Luís",
            cep:         loc.cep         ?? "",
            latitude:    loc.latitude    != null ? String(loc.latitude)  : "",
            longitude:   loc.longitude   != null ? String(loc.longitude) : "",
            geometriaWkt: loc.geometriaWkt ?? "",
          });
        }

        // Etapa 3 — Classificação (sem situação dominial — vai para etapa6)
        setEtapa3({
          tipoImovel:       im.tipoImovel       ?? "",
          tipologia:        im.tipologia        ?? "",
          destinacaoAtual:  "",
          idTipoImovel:     im.idTipoImovel != null ? String(im.idTipoImovel) : "",
          descricaoUso:     im.descricao        ?? "",
        });

        // Etapa 4 — Dados físicos
        setEtapa4({
          areaTerrenoM2:        im.areaTerrenoM2       != null ? String(im.areaTerrenoM2)       : "",
          areaConstruidaM2:     im.areaConstruidaM2    != null ? String(im.areaConstruidaM2)    : "",
          numeroPavimentos:     im.numeroPavimentos    != null ? String(im.numeroPavimentos)    : "",
          estadoConservacaoAtual: im.estadoConservacaoAtual ?? "",
          anoConstrucao:        im.anoConstrucao       != null ? String(im.anoConstrucao)       : "",
        });

        // Etapa 6 — Dominial
        setEtapa6({
          idSituacaoDominial:  im.idSituacaoDominial != null ? String(im.idSituacaoDominial) : "",
          matriculaRegistro:   im.matriculaRegistro  ?? "",
          cartorio:            im.cartorio           ?? "",
          inscricaoImobiliaria: im.inscricaoImobiliaria ?? "",
          observacoesDominial: "",
        });
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
      })
      .catch(() => setErroCarregamento("Não foi possível carregar os dados do imóvel."))
      .finally(() => setCarregando(false));
  }, [idImovel]);

  const salvar = useCallback(async (onSuccess: () => void) => {
    if (!imovel) return;
    setSalvando(true);
    setErro(null);

    try {
      const idUnidade = etapa1.idUnidadeGestora ? Number(etapa1.idUnidadeGestora) : imovel.idUnidadeGestora;
      const idOrgao   = etapa1.idOrgaoGestorPatrimonial ? Number(etapa1.idOrgaoGestorPatrimonial) : imovel.idOrgaoGestorPatrimonial ?? undefined;

      const req: ImovelRequest = {
        nomeReferencia:           etapa1.nomeReferencia  || undefined,
        idTipoImovel:             etapa3.idTipoImovel ? Number(etapa3.idTipoImovel) : undefined,
        tipologia:                etapa3.tipologia       || undefined,
        idSituacaoDominial:       etapa6.idSituacaoDominial ? Number(etapa6.idSituacaoDominial) : undefined,
        inscricaoImobiliaria:     etapa6.inscricaoImobiliaria || undefined,
        matriculaRegistro:        etapa6.matriculaRegistro   || undefined,
        cartorio:                 etapa6.cartorio            || undefined,
        descricao:                etapa3.descricaoUso    || undefined,
        observacoesGerais:        etapa1.observacoesGerais || undefined,
        areaTerrenoM2:            etapa4.areaTerrenoM2    ? parseFloat(etapa4.areaTerrenoM2)    : undefined,
        areaConstruidaM2:         etapa4.areaConstruidaM2 ? parseFloat(etapa4.areaConstruidaM2) : undefined,
        numeroPavimentos:         etapa4.numeroPavimentos  ? parseInt(etapa4.numeroPavimentos)   : undefined,
        estadoConservacaoAtual:   etapa4.estadoConservacaoAtual || undefined,
        anoConstrucao:            etapa4.anoConstrucao   ? parseInt(etapa4.anoConstrucao)       : undefined,
        idOrgaoGestorPatrimonial: idOrgao,
        idUnidadeGestora:         idUnidade,
      };

      await imoveisApi.atualizar(imovel.id, req);

      // Atualiza localização se coordenadas foram preenchidas
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
        // Tenta buscar localização existente para decidir entre POST e PUT
        try {
          const locExistente = await localizacoesApi.buscarPorImovel(imovel.id);
          await localizacoesApi.atualizar(locExistente.id, locReq);
        } catch {
          // Não existe — cria
          await localizacoesApi.criar(locReq);
        }
      }

      onSuccess();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }, [imovel, etapa1, etapa2, etapa3, etapa4, etapa6]);

  return (
    <Ctx.Provider value={{
      imovel, carregando, erroCarregamento,
      etapa1, etapa2, etapa3, etapa4, etapa5, etapa6,
      salvando, erro,
      setEtapa1, setEtapa2, setEtapa3, setEtapa4, setEtapa5, setEtapa6,
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