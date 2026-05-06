import React, { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { api } from "../../api/client";

export function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    if (!email) {
      setErro("Informe seu e-mail institucional.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/recuperar-senha", { email });
      setEnviado(true);
    } catch {
      // Mesmo em erro mostra sucesso — não revelar se e-mail existe
      setEnviado(true);
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm text-center">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src="/assets/logo-sigpim.png" alt="SIGPIM" className="h-12 w-12 object-contain" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Recuperação de senha
              </span>
            </div>

            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">E-mail enviado!</h2>
            
            <p className="text-slate-600 mb-3">
              Se o endereço{" "}
              <span className="font-medium text-slate-900">{email}</span>{" "}
              estiver cadastrado no sistema, você receberá as instruções em instantes.
            </p>
            
            <p className="text-sm text-slate-500 mb-8">
              Verifique sua caixa de entrada e a pasta de spam. O link expira em 60 minutos.
            </p>

            <Link to="/login">
              <Button className="w-full inline-flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3b8d] py-3 text-sm font-semibold text-white">
                Voltar para o Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} SEMAD/SIN
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          
          {/* Header */}
          <div className="border-b border-slate-200 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                <img src="/assets/logo-sigpim.png" alt="SIGPIM" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#1351B4]">SIGPIM</h1>
                <p className="text-xs text-slate-500">SEMAD/SIN</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ajuda
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recuperar senha</h2>
              <p className="mt-1 text-sm text-slate-500">
                Informe seu e-mail institucional e enviaremos um link para redefinir sua senha
              </p>
            </div>

            {erro && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  E-mail Institucional
                </Label>
                <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                  <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="seu.email@slz.ma.gov.br"
                    required
                    disabled={loading}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Use o mesmo e-mail cadastrado no sistema
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3b8d] py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Instruções
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link to="/login">
                <Button variant="ghost" className="w-full text-slate-600 hover:text-[#1351B4]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o login
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-8 py-4">
            <p className="text-center text-xs text-slate-500">
              SEMAD/SIN
              <br />
              Sistema de gestão patrimonial municipal. Seus dados estão protegidos.
            </p>
          </div>
        </div>
        
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SEMAD/SIN
        </p>
      </div>
    </div>
  );
}