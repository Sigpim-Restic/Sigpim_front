import { useAuth } from "../contexts/AuthContext";

// Hook que espelha as regras do SecurityExpressions.java no front.
// Usado para mostrar/esconder botões e menus sem depender de erros 403.
// O backend continua sendo a fonte de verdade — isto é apenas UX.
//
// REGRA FUNDAMENTAL (atualizado conforme feedback):
//   ADMINISTRADOR_SISTEMA = dono da plataforma (TI/SIN).
//     - Pode: catálogos, usuários, órgãos, unidades, tipos extensíveis,
//             configurações, auditoria, leitura irrestrita, relatórios.
//     - NÃO PODE: criar/editar imóveis, validar, promover status patrimonial,
//                 delete patrimonial, upload de documentos, vistorias etc.
//                 Essas são ações de gestão patrimonial, não de TI.
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
    // ADMIN_SISTEMA não cria/edita/deleta imóveis
    canCreateImovel: tem("ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canUpdateImovel: tem("ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canDeleteImovel: tem("ADMINISTRADOR_PATRIMONIAL"),

    // ── Imóveis — Ciclo de status ────────────────────────────────────────────
    // P → V: ADMIN_SISTEMA EXCLUÍDO — validar é ato patrimonial, não de TI
    canValidarImovel:       tem("ADMINISTRADOR_PATRIMONIAL", "VALIDADOR_DOCUMENTAL"),
    canRecusarValidacao:    tem("ADMINISTRADOR_PATRIMONIAL", "VALIDADOR_DOCUMENTAL"),
    // V → G: apenas ADMIN_PATRIMONIAL fecha o ciclo completo
    canPromoverGestaoPlena: tem("ADMINISTRADOR_PATRIMONIAL"),

    // ── Documentos ───────────────────────────────────────────────────────────
    // ADMIN_SISTEMA não faz upload de documentos patrimoniais
    canUploadDocumento: tem("ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL", "VALIDADOR_DOCUMENTAL"),
    canDeleteDocumento: tem("ADMINISTRADOR_PATRIMONIAL"),

    // ── Ocupações ────────────────────────────────────────────────────────────
    canWriteOcupacao:  tem("ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canDeleteOcupacao: tem("ADMINISTRADOR_PATRIMONIAL"),

    // ── Vistorias (SEMOSP) ───────────────────────────────────────────────────
    canWriteVistoria:  tem("ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR"),
    canDeleteVistoria: tem("ADMINISTRADOR_PATRIMONIAL"),

    // ── Intervenções (SEMOSP / SEPLAN) ───────────────────────────────────────
    canWriteIntervencao:  tem("ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR", "PLANEJAMENTO"),
    canDeleteIntervencao: tem("ADMINISTRADOR_PATRIMONIAL"),

    // ── Parecer FUMPH ────────────────────────────────────────────────────────
    canWriteParecerFumph: tem("ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR"),

    // ── Dados Fiscais (SEMFAZ → VALIDADOR_DOCUMENTAL) ────────────────────────
    canWriteDadoFiscal: tem("ADMINISTRADOR_PATRIMONIAL", "VALIDADOR_DOCUMENTAL"),

    // ── Avaliações Patrimoniais (SEMAD / SEPLAN) ─────────────────────────────
    canWriteAvaliacaoPatrimonial: tem("ADMINISTRADOR_PATRIMONIAL", "PLANEJAMENTO"),

    // ── Instrumentos de Uso (SEMAD) ──────────────────────────────────────────
    canWriteInstrumentoUso: tem("ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),

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
    canVerRascunho: tem("ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),

    // ── Validação por domínio/aba ────────────────────────────────────────────
    // Retorna true se o usuário é VALIDADOR_DOCUMENTAL do órgão responsável
    // pelo domínio informado, ou ADMIN_PATRIMONIAL (valida qualquer domínio).
    // ADMIN_SISTEMA nunca valida.
    canValidarDominio: (dominio: string): boolean => {
      if (tem("ADMINISTRADOR_PATRIMONIAL")) return true;
      if (!tem("VALIDADOR_DOCUMENTAL"))    return false;
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