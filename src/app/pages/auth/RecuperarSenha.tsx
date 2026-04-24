import React, { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Logo } from "../../components/Logo";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
      <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#1351B4] px-8 py-6 text-center">
              <div className="flex justify-center mb-4">
                <Logo size="medium" />
              </div>
              <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
              <p className="text-sm text-white/80 mt-1">
                Sistema Integrado de Gestão do Patrimônio Imobiliário
              </p>
            </div>

            <div className="px-8 py-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">E-mail enviado!</h2>
              <p className="text-gray-600 mb-3">
                Se o endereço{" "}
                <span className="font-medium text-gray-900">{email}</span>{" "}
                estiver cadastrado no sistema, você receberá as instruções em instantes.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Verifique sua caixa de entrada e a pasta de spam. O link expira em 60 minutos.
              </p>
              <Link to="/login">
                <Button className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium">
                  Voltar para o Login
                </Button>
              </Link>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
              <p className="text-xs text-center text-gray-600">
                Caso não receba o e-mail, entre em contato com o administrador do sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1351B4] px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="medium" />
            </div>
            <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
            <p className="text-sm text-white/80 mt-1">
              Sistema Integrado de Gestão do Patrimônio Imobiliário
            </p>
          </div>

          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Recuperar senha</h2>
              <p className="text-sm text-gray-600 mt-2">
                Informe seu e-mail institucional e enviaremos um link para redefinir sua senha
              </p>
            </div>

            {erro && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@slz.ma.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar Instruções"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="w-full h-11 text-base font-medium text-gray-700 hover:text-[#1351B4]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o login
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-center text-gray-600">
              Prefeitura Municipal de São Luís — SEMAD
              <br />
              Sistema de gestão patrimonial municipal. Seus dados estão protegidos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}