import { useAuth } from "../contexts/AuthContext";

// Hook que espelha as regras do SecurityExpressions.java no front.
// Usado para mostrar/esconder botões e menus sem depender de erros 403.
// O backend continua sendo a fonte de verdade — isto é apenas UX.
//
// REGRA FUNDAMENTAL (atualizado conforme feedback):
//   ADMINISTRADOR_SISTEMA = dono da plataforma (TI/SIN).
//     - Pode: catálogos, usuários, órgãos, unidades, tipos extensíveis,
//             configurações, auditoria, leitura irrestrita, relatórios.
//     - NÃO PODE: criar/editar imóveis, promover status patrimonial,
//                 delete patrimonial, upload de documentos, vistorias etc.
//                 Essas são ações de gestão patrimonial, não de TI.
//     - PODE: validar domínios (poder administrativo superior).
//
//   ADMINISTRADOR_PATRIMONIAL = dono do dado patrimonial (SEMAD/COBP).
//     - Pode: tudo no ciclo patrimonial (criar, editar, validar, promover).
//     - NÃO PODE: gerenciar usuários, perfis, catálogos de sistema.

type Perfil =
  | "ADMINISTRADOR_SISTEMA"
  | "ADMINISTRADOR_PATRIMONIAL"
  | "CADASTRADOR_SETORIAL"
  | "VALIDADOR_DOCUMENTAL"
  | "VISTORIADOR"
  | "PLANEJAMENTO"
  | "AUDITOR";

export function usePermissoes() {
  const { usuario } = useAuth();
  const perfil = (usuario?.perfil ?? "") as Perfil;
  const idOrgao = usuario?.idOrgao ?? null;

  const tem = (...perfis: Perfil[]) => perfis.includes(perfil);

  return {
    // ── Imóveis — CRUD ───────────────────────────────────────────────────────
    // ADMIN_SISTEMA faz tudo. ADMIN_PATRIMONIAL e CADASTRADOR também criam/editam.
    canCreateImovel: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canUpdateImovel: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canDeleteImovel: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // ── Imóveis — Ciclo de status ────────────────────────────────────────────
    // P → V: ADMIN_SISTEMA e VALIDADOR_DOCUMENTAL validam/recusam
    canValidarImovel:       tem("ADMINISTRADOR_SISTEMA", "VALIDADOR_DOCUMENTAL"),
    canRecusarValidacao:    tem("ADMINISTRADOR_SISTEMA", "VALIDADOR_DOCUMENTAL"),
    // V → G: ADMIN_SISTEMA e ADMIN_PATRIMONIAL promovem para gestão plena
    canPromoverGestaoPlena: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // ── Documentos ───────────────────────────────────────────────────────────
    // ADMIN_SISTEMA não faz upload de documentos patrimoniais
    canUploadDocumento: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL", "VALIDADOR_DOCUMENTAL"),
    canDeleteDocumento: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // ── Ocupações ────────────────────────────────────────────────────────────
    canWriteOcupacao:  tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canDeleteOcupacao: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // ── Vistorias (SEMOSP) ───────────────────────────────────────────────────
    canWriteVistoria:  tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR"),
    canDeleteVistoria: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // ── Intervenções (SEMOSP / SEPLAN) ───────────────────────────────────────
    canWriteIntervencao:  tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR", "PLANEJAMENTO"),
    canDeleteIntervencao: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // ── Parecer FUMPH ────────────────────────────────────────────────────────
    canWriteParecerFumph: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR"),

    // ── Dados Fiscais (SEMFAZ → VALIDADOR_DOCUMENTAL) ────────────────────────
    canWriteDadoFiscal: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VALIDADOR_DOCUMENTAL"),

    // ── Avaliações Patrimoniais (SEMAD / SEPLAN) ─────────────────────────────
    canWriteAvaliacaoPatrimonial: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "PLANEJAMENTO"),

    // ── Instrumentos de Uso (SEMAD) ──────────────────────────────────────────
    canWriteInstrumentoUso: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),

    // ── Plataforma — exclusivo ADMIN_SISTEMA ─────────────────────────────────
    canManageUsuario:              tem("ADMINISTRADOR_SISTEMA"),
    canManageCatalogo:             tem("ADMINISTRADOR_SISTEMA"),
    canManageTipoImovel:           tem("ADMINISTRADOR_SISTEMA"),
    canManageSituacaoDominial:     tem("ADMINISTRADOR_SISTEMA"),
    canManageOrigemCadastro:       tem("ADMINISTRADOR_SISTEMA"),
    canManageNivelOcupacao:        tem("ADMINISTRADOR_SISTEMA"),
    canManageOrgao:                tem("ADMINISTRADOR_SISTEMA"),
    canManageUnidadeOrganizacional: tem("ADMINISTRADOR_SISTEMA"),

    // ── Auditoria ────────────────────────────────────────────────────────────
    canReadAuditoria: tem("ADMINISTRADOR_SISTEMA", "AUDITOR"),

    // ── Relatórios ───────────────────────────────────────────────────────────
    // ADMIN_SISTEMA pode gerar relatórios (leitura), mas não validar
    canCreateRelatorio: tem(
      "ADMINISTRADOR_SISTEMA",
      "ADMINISTRADOR_PATRIMONIAL",
      "CADASTRADOR_SETORIAL",
      "PLANEJAMENTO",
      "AUDITOR"
    ),

    // ── Rascunho — apenas quem cria imóveis vê o banner ─────────────────────
    canVerRascunho: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),

    // ── Validação por domínio/aba ────────────────────────────────────────────
    // Retorna true se:
    //   ADMINISTRADOR_SISTEMA → valida qualquer domínio (poder administrativo superior)
    //   VALIDADOR_DOCUMENTAL do órgão responsável pelo domínio → valida pelo mapa RACI
    //   ADMINISTRADOR_PATRIMONIAL NÃO valida domínios
    canValidarDominio: (dominio: string): boolean => {
      // Apenas ADMIN_SISTEMA valida qualquer domínio sem restrição de órgão
      if (tem("ADMINISTRADOR_SISTEMA")) return true;
      if (!tem("VALIDADOR_DOCUMENTAL")) return false;
      if (!idOrgao) return false;

      // Mapeamento domínio → sigla do órgão (espelha SecurityExpressions.java)
      const mapa: Record<string, string[]> = {
        CORE:          ["SEMAD"],
        DOMINIAL:      ["SEMAD"],
        OCUPACAO:      ["SEMAD"],
        INSTRUMENTO:   ["SEMAD"],
        AVALIACAO:     ["SEMAD"],
        ANEXOS:        ["SEMAD"],
        GIS:           ["SEMURH"],
        LOCALIZACAO:   ["SEMURH"],
        FISCAL:        ["SEMFAZ"],
        VISTORIA:      ["SEMOSP"],
        INTERVENCAO:   ["SEMOSP"],
        HISTORICO:     ["FUMPH"],
        FUMPH:         ["FUMPH"],
        AMBIENTAL:     ["SEMMAM"],
        PAISAGEM:      ["IMPUR"],
        PLANEJAMENTO:  ["SEPLAN", "SEMISPE"],
        CLASSIFICACAO: ["SEMAD", "SEMURH"],
        DADOS_FISICOS: ["SEMURH", "SEMOSP"],
      };

      const siglas = mapa[dominio.toUpperCase()] ?? [];
      // Compara com a sigla do órgão do usuário (disponível no AuthContext)
      const siglaOrgao = usuario?.siglaOrgao ?? "";
      return siglas.some((s) => s === siglaOrgao.toUpperCase());
    },

    // ── Helpers de perfil ────────────────────────────────────────────────────
    isAdminSistema:     tem("ADMINISTRADOR_SISTEMA"),
    isAdminPatrimonial: tem("ADMINISTRADOR_PATRIMONIAL"),
    isAdmin: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),
    perfil,
    idOrgao,
  };
}