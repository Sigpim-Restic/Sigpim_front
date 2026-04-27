import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Shield, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { mfaApi } from "../../api/mfa";
import { useAuth } from "../../contexts/AuthContext";

export function VerificarMfa() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { salvarSessao } = useAuth();

  // mfaToken passado via navigation state pelo Login
  const mfaToken = (location.state as { mfaToken?: string })?.mfaToken ?? "";

  const [codigo,    setCodigo]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [erro,      setErro]      = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mfaToken) navigate("/login", { replace: true });
    inputRef.current?.focus();
  }, [mfaToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codigo.length !== 6) return;

    setLoading(true); setErro(null);
    try {
      const res = await mfaApi.verificar(mfaToken, codigo);
      salvarSessao(res);
      navigate("/dashboard", { replace: true });
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Código inválido. Tente novamente.");
      setCodigo("");
      inputRef.current?.focus();
    } finally { setLoading(false); }
  };

  // Aceita apenas dígitos e avança automaticamente ao completar 6 dígitos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCodigo(valor);
    if (erro) setErro(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1351B4]">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verificação em dois fatores</h1>
          <p className="text-sm text-gray-500 mt-2">
            Abra o app autenticador e insira o código de 6 dígitos.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {erro && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {erro}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Código de verificação
              </label>
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={codigo}
                onChange={handleChange}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest h-14"
              />
              <p className="text-xs text-gray-400 text-center">
                O código muda a cada 30 segundos.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11"
              disabled={loading || codigo.length !== 6}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verificando...</>
                : "Verificar e entrar"
              }
            </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mx-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao login
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Este código expira em 5 minutos. Se expirar, faça login novamente.
        </p>
      </div>
    </div>
  );
}