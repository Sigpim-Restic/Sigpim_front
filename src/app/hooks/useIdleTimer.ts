/**
 * useIdleTimer
 *
 * Detecta inatividade do usuário rastreando eventos de interação reais
 * (mouse, teclado, toque, scroll). Quando o usuário fica inativo por
 * `timeoutMs` milissegundos:
 *   1. Exibe um aviso durante `warningMs` milissegundos.
 *   2. Se o usuário não interagir, chama `onExpire`.
 *
 * `onWarn` é chamado quando o aviso começa (use para mostrar um modal
 * com contagem regressiva). `onReset` é chamado se o usuário interagir
 * durante o aviso (use para fechar o modal).
 *
 * Uso:
 *   useIdleTimer({
 *     timeoutMs: 25 * 60 * 1000,
 *     warningMs:  5 * 60 * 1000,
 *     onWarn:    () => setShowWarning(true),
 *     onReset:   () => setShowWarning(false),
 *     onExpire:  handleLogout,
 *   });
 */
import { useEffect, useRef, useCallback } from "react";

interface UseIdleTimerOptions {
  timeoutMs: number;    // ms de inatividade antes do aviso
  warningMs: number;    // ms de aviso antes do logout
  onWarn: () => void;
  onReset: () => void;
  onExpire: () => void;
  enabled?: boolean;    // false quando timeoutMs === 0 (desativado pelo admin)
}

const ACTIVITY_EVENTS = [
  "mousemove", "mousedown", "keydown",
  "touchstart", "scroll", "wheel", "click",
] as const;

export function useIdleTimer({
  timeoutMs,
  warningMs,
  onWarn,
  onReset,
  onExpire,
  enabled = true,
}: UseIdleTimerOptions) {
  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWarning   = useRef(false);

  const clearTimers = useCallback(() => {
    if (idleTimer.current)   clearTimeout(idleTimer.current);
    if (expireTimer.current) clearTimeout(expireTimer.current);
    idleTimer.current   = null;
    expireTimer.current = null;
  }, []);

  const startIdleTimer = useCallback(() => {
    clearTimers();
    idleTimer.current = setTimeout(() => {
      isWarning.current = true;
      onWarn();
      expireTimer.current = setTimeout(() => {
        isWarning.current = false;
        onExpire();
      }, warningMs);
    }, timeoutMs);
  }, [clearTimers, timeoutMs, warningMs, onWarn, onExpire]);

  const handleActivity = useCallback(() => {
    if (isWarning.current) {
      // Usuário voltou durante o aviso — cancela o logout
      isWarning.current = false;
      onReset();
    }
    startIdleTimer();
  }, [startIdleTimer, onReset]);

  useEffect(() => {
    if (!enabled || timeoutMs <= 0) return;

    startIdleTimer();

    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((e) =>
        window.removeEventListener(e, handleActivity)
      );
    };
  }, [enabled, timeoutMs, startIdleTimer, handleActivity, clearTimers]);
}