import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { imoveisApi } from "../api/imoveis";
import { ocupacoesApi } from "../api/ocupacoes";
import { localizacoesApi } from "../api/localizacoes";
import type { ImovelRequest, ImovelResponse } from "../api/imoveis";
import type { OcupacaoRequest } from "../api/ocupacoes";
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

interface Ctx {
  imovel: ImovelResponse | null;
  carregando: boolean;
  erroCarregamento: string | null;
  etapa1: DadosEtapa1; etapa2: DadosEtapa2; etapa3: DadosEtapa3;
  etapa4: DadosEtapa4; etapa5: DadosEtapa5;
  salvando: boolean; erro: string | null;
  setEtapa1: (d: DadosEtapa1) => void;
  setEtapa2: (d: DadosEtapa2) => void;
  setEtapa3: (d: DadosEtapa3) => void;
  setEtapa4: (d: DadosEtapa4) => void;
  setEtapa5: (d: DadosEtapa5) => void;
  salvar: (onSuccess: () => void) => Promise<void>;
}

const Ctx = createContext<Ctx | null>(null);

const vazios = {
  e1: (): DadosEtapa1 => ({ nomeReferencia: "", idOrgaoGestorPatrimonial: "", idUnidadeGestora: "", observacoesGerais: "" }),
  e2: (): DadosEtapa2 => ({ logradouro: "", numero: "", complemento: "", bairro: "", cidade: "São Luís", cep: "", latitude: "", longitude: "" }),
  e3: (): DadosEtapa3 => ({ tipoImovel: "", tipologia: "", destinacaoAtual: "", situacaoDominial: "", descricaoUso: "" }),
  e4: (): DadosEtapa4 => ({ areaTerrenoM2: "", areaConstruidaM2: "", numeroPavimentos: "", estadoConservacaoAtual: "", anoConstrucao: "" }),
  e5: (): DadosEtapa5 => ({ statusOcupacao: "", nivelOcupacao: "", nomeOcupanteExterno: "", nomeResponsavelLocal: "", contatoResponsavel: "", destinacaoFinalidade: "", dataInicio: "", dataFimPrevista: "", observacoes: "" }),
};

// Holds the id of the existing localizacao row so we can PUT instead of POST
// on save. Stored outside state because it doesn't drive rendering.
let _localizacaoId: number | null = null;

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
  const [salvando, setSalvando] = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);

  useEffect(() => {
    // Reset the stored localizacao id whenever the target property changes
    _localizacaoId = null;
    setCarregando(true);
    setErroCarregamento(null);

    Promise.all([
      imoveisApi.buscarPorId(idImovel),
      localizacoesApi.buscarPorImovel(idImovel).catch(() => null),
      ocupacoesApi.listarPorImovel(idImovel, 0, 1).catch(() => null),
    ])
      .then(([im, loc, ocupPage]) => {
        setImovel(im);

        // ── Etapa 1 — Identificação ──────────────────────────────────────
        setEtapa1({
          nomeReferencia:           im.nomeReferencia ?? "",
          idOrgaoGestorPatrimonial: im.idOrgaoGestorPatrimonial ? String(im.idOrgaoGestorPatrimonial) : "",
          idUnidadeGestora:         im.idUnidadeGestora ? String(im.idUnidadeGestora) : "",
          observacoesGerais:        im.observacoesGerais ?? "",
        });

        // ── Etapa 2 — Localização ────────────────────────────────────────
        // BUG FIX 1: the previous code used String(loc.latitude) which returns
        // the literal string "null" when the value is null, filling the input
        // with the word "null" instead of leaving it empty.
        if (loc) {
          _localizacaoId = loc.id; // remember for PUT vs POST decision on save
          setEtapa2({
            logradouro:  loc.logradouro  ?? "",
            numero:      loc.numero      ?? "",
            complemento: loc.complemento ?? "",
            bairro:      loc.bairro      ?? "",
            cidade:      "São Luís",
            cep:         loc.cep         ?? "",
            latitude:    loc.latitude    != null ? String(loc.latitude)  : "",
            longitude:   loc.longitude   != null ? String(loc.longitude) : "",
          });
        }

        // ── Etapa 3 — Classificação ──────────────────────────────────────
        setEtapa3({
          tipoImovel:       im.tipoImovel       ?? "",
          tipologia:        im.tipologia        ?? "",
          destinacaoAtual:  "",
          situacaoDominial: im.situacaoDominial  ?? "",
          // BUG FIX 2: the old code mapped descricaoUso from im.descricao but
          // ImovelRequest sends it as `descricao`. This was already correct in
          // salvar() but the pre-fill was broken: the textarea showed empty
          // even when the backend had a value, and on save it sent undefined.
          descricaoUso:     im.descricao        ?? "",
        });

        // ── Etapa 4 — Dados Físicos ──────────────────────────────────────
        setEtapa4({
          areaTerrenoM2:          im.areaTerrenoM2       != null ? String(im.areaTerrenoM2)       : "",
          areaConstruidaM2:       im.areaConstruidaM2    != null ? String(im.areaConstruidaM2)    : "",
          numeroPavimentos:       im.numeroPavimentos    != null ? String(im.numeroPavimentos)    : "",
          estadoConservacaoAtual: im.estadoConservacaoAtual ?? "",
          anoConstrucao:          im.anoConstrucao       != null ? String(im.anoConstrucao)       : "",
        });

        // ── Etapa 5 — Ocupação vigente ───────────────────────────────────
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
      // ── Step 1: update imovel ────────────────────────────────────────────
      const idUnidade = etapa1.idUnidadeGestora
        ? Number(etapa1.idUnidadeGestora)
        : imovel.idUnidadeGestora;
      const idOrgao = etapa1.idOrgaoGestorPatrimonial
        ? Number(etapa1.idOrgaoGestorPatrimonial)
        : imovel.idOrgaoGestorPatrimonial ?? undefined;

      const req: ImovelRequest = {
        nomeReferencia:           etapa1.nomeReferencia       || undefined,
        tipoImovel:               (etapa3.tipoImovel as any)  || "INCERTO",
        tipologia:                etapa3.tipologia            || undefined,
        situacaoDominial:         (etapa3.situacaoDominial as any) || undefined,
        // BUG FIX 3: descricaoUso was being sent as `descricao` here but the
        // ImovelRequest interface uses `descricao` — this was correct already;
        // the real bug was in the pre-fill (see BUG FIX 2 above). Both sides
        // now use the same field name consistently.
        descricao:                etapa3.descricaoUso         || undefined,
        observacoesGerais:        etapa1.observacoesGerais    || undefined,
        areaTerrenoM2:            etapa4.areaTerrenoM2        ? parseFloat(etapa4.areaTerrenoM2)    : undefined,
        areaConstruidaM2:         etapa4.areaConstruidaM2     ? parseFloat(etapa4.areaConstruidaM2) : undefined,
        numeroPavimentos:         etapa4.numeroPavimentos     ? parseInt(etapa4.numeroPavimentos)   : undefined,
        estadoConservacaoAtual:   etapa4.estadoConservacaoAtual || undefined,
        anoConstrucao:            etapa4.anoConstrucao        ? parseInt(etapa4.anoConstrucao)      : undefined,
        idOrgaoGestorPatrimonial: idOrgao,
        idUnidadeGestora:         idUnidade,
      };

      await imoveisApi.atualizar(imovel.id, req);

      // ── Step 2: upsert localização ───────────────────────────────────────
      // BUG FIX 4: the previous code called buscarPorImovel() again inside
      // salvar() to decide between POST and PUT. This caused two problems:
      //   a) An extra unnecessary network round-trip on every save.
      //   b) If the first fetch succeeded but the second one threw (race
      //      condition or transient error), the catch block silently called
      //      criar(), which would fail with "Já existe localização" because
      //      the row actually exists — swallowing the real error.
      //
      // Fix: we cache _localizacaoId when the form loads. If it's set → PUT,
      // otherwise → POST. No extra fetch needed.
      const temEndereco   = etapa2.logradouro.trim() || etapa2.bairro.trim() || etapa2.cep.trim();
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

        if (_localizacaoId != null) {
          await localizacoesApi.atualizar(_localizacaoId, locReq);
        } else {
          const created = await localizacoesApi.criar(locReq);
          _localizacaoId = created.id; // cache so subsequent saves use PUT
        }
      }

      onSuccess();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }, [imovel, etapa1, etapa2, etapa3, etapa4]);

  return (
    <Ctx.Provider value={{
      imovel, carregando, erroCarregamento,
      etapa1, etapa2, etapa3, etapa4, etapa5,
      salvando, erro,
      setEtapa1, setEtapa2, setEtapa3, setEtapa4, setEtapa5,
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