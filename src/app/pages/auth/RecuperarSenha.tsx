import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock de envio - em produção, isso seria uma chamada à API
    console.log("Recuperar senha para:", email);
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#1351B4] px-8 py-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                  <Building2 className="h-9 w-9 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
              <p className="text-sm text-white/80 mt-1">
                Sistema Integrado de Gestão do Patrimônio Imobiliário
              </p>
            </div>

            {/* Conteúdo de Sucesso */}
            <div className="px-8 py-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                E-mail enviado!
              </h2>
              <p className="text-gray-600 mb-6">
                Enviamos as instruções para recuperação de senha para{" "}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Verifique sua caixa de entrada e siga os passos indicados no
                e-mail. Se não receber em alguns minutos, verifique a pasta de
                spam.
              </p>

              <Link to="/login">
                <Button className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium">
                  Voltar para o Login
                </Button>
              </Link>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
              <p className="text-xs text-center text-gray-600">
                Caso não tenha recebido o e-mail, entre em contato com o suporte
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
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#1351B4] px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Building2 className="h-9 w-9 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
            <p className="text-sm text-white/80 mt-1">
              Sistema Integrado de Gestão do Patrimônio Imobiliário
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Recuperar senha
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Informe seu e-mail institucional e enviaremos as instruções para
                redefinir sua senha
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
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
                  />
                </div>
              </div>

              {/* Botão de Enviar */}
              <Button
                type="submit"
                className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium"
              >
                Enviar Instruções
              </Button>
            </form>

            {/* Voltar para Login */}
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

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-center text-gray-600">
              Prefeitura Municipal de São Luís - SEPLAN
              <br />
              Sistema oficial do governo. Seus dados estão seguros.
            </p>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/90">Versão 1.0.0 - 2026</p>
          <p className="text-xs text-white/70 mt-2">
            Em caso de problemas técnicos, contate o suporte:
            <br />
            <a
              href="mailto:suporte.sigpim@slz.ma.gov.br"
              className="hover:underline font-medium"
            >
              suporte.sigpim@slz.ma.gov.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
