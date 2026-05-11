/**
 * SessionExpiredModal
 *
 * Listens for the "sigpim:sessao-expirada" custom event dispatched by client.ts
 * when the backend returns 401. Shows a modal with a "Fazer login" button that
 * redirects to /login, preserving the current URL as a "returnTo" query param
 * so the user lands back on the same page after re-authenticating.
 *
 * Mounted once in App.tsx — no props needed.
 */
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "./components/ui/alert-dialog";
import { LogIn } from "lucide-react";

export function SessionExpiredModal() {
  const [aberto,   setAberto]   = useState(false);
  const [returnTo, setReturnTo] = useState("/dashboard");

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ returnTo: string }>).detail;
      setReturnTo(detail?.returnTo ?? "/dashboard");
      setAberto(true);
    }
    window.addEventListener("sigpim:sessao-expirada", handler);
    return () => window.removeEventListener("sigpim:sessao-expirada", handler);
  }, []);

  function handleLogin() {
    setAberto(false);
    const url = returnTo && returnTo !== "/login"
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : "/login";
    window.location.href = url;
  }

  return (
    <AlertDialog open={aberto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-amber-500" />
            Sessão expirada
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sua sessão foi encerrada por inatividade. Faça login novamente para continuar —
            você será redirecionado de volta para a página que estava acessando.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleLogin}
            className="bg-[#1351B4] hover:bg-[#0c3b8d] text-white"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Fazer login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}