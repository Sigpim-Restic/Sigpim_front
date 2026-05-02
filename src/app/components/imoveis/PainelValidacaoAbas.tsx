import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, Clock, Shield, ShieldOff, Loader2,
  ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  validacoesAbaApi,
  type StatusValidacaoResponse,
  type DominioValidado,
  DOMINIO_LABEL,
  DOMINIO_ORGAO,
} from "../../api/validacoesAba";
import { usePermissoes } from "../../hooks/usePermissoes";

interface Props {
  idImovel: number;
  /** Callback para notificar o pai que houve mudança (ex: recarregar imovel) */
  onMudanca?: () => void;
}

/**
 * PainelValidacaoAbas
 *
 * Exibido na aba "Validação" do DetalhesImovel.
 * Mostra o status de validação de cada domínio/aba e permite:
 *   - VALIDADOR_DOCUMENTAL do órgão responsável: validar domínios do seu órgão
 *   - ADMINISTRADOR_PATRIMONIAL: validar qualquer domínio + revogar validações
 *
 * Regras:
 *   - Uma vez validado, o domínio fica imutável (itens 7 e 9 do feedback)
 *   - Cada validador só vê o botão "Validar" para domínios do seu órgão (item 4)
 *   - ADMIN_SISTEMA lê tudo mas não valida (item do feedback sobre admin)
 */
export function PainelValidacaoAbas({ idImovel, onMudanca }: Props) {
  const perm = usePermissoes();

  const [status,    setStatus]    = useState<StatusValidacaoResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState<string | null>(null);
  const [expandido, setExpandido] = useState(true);

  // Modal de validação
  const [modalValidar, setModalValidar] = useState<{
    aberto: boolean; dominio: string; observacao: string; salvando: boolean; erro: string | null;
  }>({ aberto: false, dominio: "", observacao: "", salvando: false, erro: null });

  // Modal de revogação
  const [modalRevogar, setModalRevogar] = useState<{
    aberto: boolean; dominio: string; salvando: boolean;
  }>({ aberto: false, dominio: "", salvando: false });

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const data = await validacoesAbaApi.buscarStatus(idImovel);
      setStatus(data);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar validações.");
    } finally {
      setLoading(false);
    }
  }, [idImovel]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirValidar = (dominio: string) =>
    setModalValidar({ aberto: true, dominio, observacao: "", salvando: false, erro: null });

  const confirmarValidar = async () => {
    setModalValidar((m) => ({ ...m, salvando: true, erro: null }));
    try {
      await validacoesAbaApi.validar(idImovel, {
        dominio:    modalValidar.dominio,
        observacao: modalValidar.observacao || undefined,
      });
      setModalValidar((m) => ({ ...m, aberto: false }));
      await carregar();
      onMudanca?.();
    } catch (e: unknown) {
      setModalValidar((m) => ({
        ...m,
        salvando: false,
        erro: e instanceof Error ? e.message : "Erro ao validar.",
      }));
    }
  };

  const confirmarRevogar = async () => {
    setModalRevogar((m) => ({ ...m, salvando: true }));
    try {
      await validacoesAbaApi.revogar(idImovel, modalRevogar.dominio);
      setModalRevogar((m) => ({ ...m, aberto: false }));
      await carregar();
      onMudanca?.();
    } catch { /* silencia */ } finally {
      setModalRevogar((m) => ({ ...m, salvando: false }));
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Carregando validações...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</div>
    );
  }

  if (!status) return null;

  const totalDominios = status.dominiosValidados.length + status.dominiosPendentes.length;
  const percentual    = Math.round((status.dominiosValidados.length / totalDominios) * 100);

  return (
    <div className="space-y-4">

      {/* Modal de validação */}
      <Dialog open={modalValidar.aberto} onOpenChange={(v) => !v && setModalValidar((m) => ({ ...m, aberto: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#1351B4]" />
              Validar domínio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 space-y-1">
              <p className="font-semibold">{DOMINIO_LABEL[modalValidar.dominio] ?? modalValidar.dominio}</p>
              <p className="text-xs text-blue-600">
                Responsável: {DOMINIO_ORGAO[modalValidar.dominio] ?? "—"}
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-xs text-orange-800">
              ⚠ Esta ação é irreversível. Após validar, os campos deste domínio ficam
              <strong> imutáveis</strong>. Somente o Administrador Patrimonial pode revogar.
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Observação (opcional)
              </label>
              <Textarea
                value={modalValidar.observacao}
                onChange={(e) => setModalValidar((m) => ({ ...m, observacao: e.target.value }))}
                placeholder="Registre qualquer observação relevante sobre esta validação..."
                rows={3}
              />
            </div>
            {modalValidar.erro && (
              <p className="text-sm text-red-600">{modalValidar.erro}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalValidar((m) => ({ ...m, aberto: false }))}
              disabled={modalValidar.salvando}>
              Cancelar
            </Button>
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={confirmarValidar}
              disabled={modalValidar.salvando}
            >
              {modalValidar.salvando
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validando...</>
                : <><CheckCircle2 className="mr-2 h-4 w-4" />Confirmar Validação</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de revogação */}
      <Dialog open={modalRevogar.aberto} onOpenChange={(v) => !v && setModalRevogar((m) => ({ ...m, aberto: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <ShieldOff className="h-5 w-5" />
              Revogar validação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              Deseja revogar a validação do domínio{" "}
              <strong>{DOMINIO_LABEL[modalRevogar.dominio] ?? modalRevogar.dominio}</strong>?
            </p>
            <p className="text-xs text-orange-700 rounded-lg bg-orange-50 border border-orange-200 p-3">
              Os campos deste domínio voltarão a ser editáveis. A revogação é registrada em auditoria.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalRevogar((m) => ({ ...m, aberto: false }))}
              disabled={modalRevogar.salvando}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarRevogar} disabled={modalRevogar.salvando}>
              {modalRevogar.salvando
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Revogando...</>
                : "Revogar Validação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho com progresso */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpandido((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[#1351B4]" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Validação por Domínio
            </p>
            <p className="text-xs text-gray-500">
              {status.dominiosValidados.length} de {totalDominios} domínios validados ({percentual}%)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Barra de progresso */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${percentual}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">{percentual}%</span>
          </div>
          {expandido
            ? <ChevronUp className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {expandido && (
        <div className="space-y-2">

          {/* Info para leitura */}
          {perm.isAdminSistema && (
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Administradores do Sistema têm acesso de leitura mas não podem validar domínios.
              Validação é responsabilidade do Administrador Patrimonial e dos Validadores Documentais.
            </div>
          )}

          {/* Domínios validados */}
          {status.dominiosValidados.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                Validados ({status.dominiosValidados.length})
              </p>
              {status.dominiosValidados.map((v) => (
                <DominioCard
                  key={v.dominio}
                  dominio={v.dominio}
                  validado={true}
                  info={v}
                  podeRevogar={perm.isAdminPatrimonial}
                  onRevogar={() => setModalRevogar({ aberto: true, dominio: v.dominio, salvando: false })}
                />
              ))}
            </div>
          )}

          {/* Domínios pendentes */}
          {status.dominiosPendentes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mt-3">
                Pendentes ({status.dominiosPendentes.length})
              </p>
              {status.dominiosPendentes.map((dominio) => {
                const podeValidar = perm.canValidarDominio(dominio);
                return (
                  <DominioCard
                    key={dominio}
                    dominio={dominio}
                    validado={false}
                    podeValidar={podeValidar}
                    onValidar={() => abrirValidar(dominio)}
                  />
                );
              })}
            </div>
          )}

          {status.dominiosValidados.length === totalDominios && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="font-medium">Todos os domínios foram validados.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Cartão individual de domínio ──────────────────────────────────────────────

function DominioCard({
  dominio,
  validado,
  info,
  podeValidar,
  podeRevogar,
  onValidar,
  onRevogar,
}: {
  dominio: string;
  validado: boolean;
  info?: DominioValidado;
  podeValidar?: boolean;
  podeRevogar?: boolean;
  onValidar?: () => void;
  onRevogar?: () => void;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className={`rounded-lg border px-4 py-3 ${
      validado
        ? "border-green-200 bg-green-50"
        : "border-gray-200 bg-white"
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {validado
            ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            : <Clock className="h-4 w-4 text-gray-400 shrink-0" />
          }
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${validado ? "text-green-900" : "text-gray-800"}`}>
              {DOMINIO_LABEL[dominio] ?? dominio}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {DOMINIO_ORGAO[dominio] ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {validado && info && (
            <button
              onClick={() => setExpandido((v) => !v)}
              className="text-xs text-green-700 hover:underline"
            >
              {expandido ? "ocultar" : "detalhes"}
            </button>
          )}
          {validado && podeRevogar && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
              onClick={onRevogar}
            >
              <ShieldOff className="mr-1 h-3 w-3" />Revogar
            </Button>
          )}
          {!validado && podeValidar && (
            <Button
              size="sm"
              className="bg-[#1351B4] hover:bg-[#0c3b8d] h-7 text-xs px-3"
              onClick={onValidar}
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />Validar
            </Button>
          )}
          {!validado && !podeValidar && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
              Aguardando validador
            </Badge>
          )}
        </div>
      </div>

      {/* Detalhes da validação */}
      {validado && info && expandido && (
        <div className="mt-3 pt-3 border-t border-green-200 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-800">
          <div><span className="text-green-600">Validado por:</span> {info.nomeValidador}</div>
          <div><span className="text-green-600">Órgão:</span> {info.nomeOrgao}</div>
          <div><span className="text-green-600">Em:</span>{" "}
            {new Date(info.validadoEm).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </div>
          {info.observacao && (
            <div className="col-span-2"><span className="text-green-600">Obs:</span> {info.observacao}</div>
          )}
        </div>
      )}
    </div>
  );
}