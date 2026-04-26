import { useAuth } from "../contexts/AuthContext";

// Hook que espelha as regras do SecurityExpressions.java no front.
// Usado para mostrar/esconder botões e menus sem depender de erros 403.
// O backend continua sendo a fonte de verdade — isto é apenas UX.

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

  const tem = (...perfis: Perfil[]) => perfis.includes(perfil);

  return {
    // Imóveis — CRUD
    canCreateImovel: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canUpdateImovel: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canDeleteImovel: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // Imóveis — Ciclo de status
    // P → V: admins + VALIDADOR_DOCUMENTAL (quem certifica, não quem alimenta)
    canValidarImovel:      tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VALIDADOR_DOCUMENTAL"),
    // V → G: apenas admins patrimoniais (ciclo completo exige dominial, fiscal, vistorias)
    canPromoverGestaoPlena: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // Documentos
    canUploadDocumento: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL", "VALIDADOR_DOCUMENTAL"),
    canDeleteDocumento: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // Ocupações
    canWriteOcupacao:  tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),
    canDeleteOcupacao: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // Vistorias (Fase 2)
    canWriteVistoria:  tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR"),
    canDeleteVistoria: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // Intervenções (Fase 2)
    canWriteIntervencao:  tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR", "PLANEJAMENTO"),
    canDeleteIntervencao: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // Parecer FUMPH (Fase 2)
    canWriteParecerFumph: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VISTORIADOR"),

    // Usuários
    canManageUsuario: tem("ADMINISTRADOR_SISTEMA"),

    // Auditoria
    canReadAuditoria: tem("ADMINISTRADOR_SISTEMA", "AUDITOR"),

    // Catálogos
    canManageCatalogo: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),

    // Dados Fiscais — Fase 3 (Owner: SEMFAZ → VALIDADOR_DOCUMENTAL + admins)
    canWriteDadoFiscal: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "VALIDADOR_DOCUMENTAL"),

    // Avaliações Patrimoniais — Fase 3 (Owner: PLANEJAMENTO + admins)
    canWriteAvaliacaoPatrimonial: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "PLANEJAMENTO"),

    // Instrumentos de Uso — Fase 3
    canWriteInstrumentoUso: tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL"),

    // Helpers de perfil
    isAdmin:   tem("ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"),
    isSistema: tem("ADMINISTRADOR_SISTEMA"),
    perfil,
  };
}