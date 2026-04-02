import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - em produção, isso seria uma chamada à API
    console.log("Login:", formData);
    // Redireciona para o dashboard
    navigate("/");
  };

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
                Acesse sua conta
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Entre com suas credenciais para continuar
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Lembrar-me e Esqueceu senha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        rememberMe: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Lembrar-me
                  </label>
                </div>
                <Link
                  to="/auth/recuperar-senha"
                  className="text-sm font-medium text-[#1351B4] hover:text-[#0c3b8d] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium"
              >
                Entrar no Sistema
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">
                  Não tem uma conta?
                </span>
              </div>
            </div>

            {/* Criar Conta */}
            <Link to="/auth/criar-conta">
              <Button
                variant="outline"
                className="w-full h-11 text-base font-medium border-[#1351B4] text-[#1351B4] hover:bg-[#1351B4]/5"
              >
                Criar Conta
              </Button>
            </Link>
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
          <p className="text-sm text-white/90">
            Versão 1.0.0 - 2026
          </p>
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
