import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2, ArrowLeft
} from "lucide-react";
import { Logo } from "../../components/Logo";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { api } from "../../api/client";
import { ApiError } from "../../api/client";

function validarSenha(senha: string) {
  return {
    tamanho: senha.length >= 8,
    numero: /\d/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    especial: /[!@#$%^&*()_+\-=[\]{};:"|,.<>/?\\]/.test(senha),
  };
}

export function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [senhaDetalhes, setSenhaDetalhes] = useState(validarSenha(""));

  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [tokenErro, setTokenErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Valida o token ao montar a página
  useEffect(() => {
    if (!token) {
      setTokenValido(false);
      setTokenErro("Token não informado. Solicite um novo link de recuperação.");
      return;
    }

    api.get(`/auth/redefinir-senha/validar?token=${token}`)
      .then(() => setTokenValido(true))
      .catch((e) => {
        setTokenValido(false);
        setTokenErro(
          e instanceof ApiError ? e.message : "Token inválido ou expirado."
        );
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    const sv = validarSenha(novaSenha);
    if (!sv.tamanho || !sv.numero || !sv.maiuscula || !sv.especial) {
      setErro("A senha não atende aos requisitos mínimos.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/redefinir-senha", { token, novaSenha });
      setSucesso(true);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Token inválido
  if (tokenValido === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1351B4] px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="medium" />
            </div>
            <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
          </div>
          <div className="px-8 py-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Link inválido</h2>
            <p className="text-gray-600 mb-8">{tokenErro}</p>
            <Link to="/auth/recuperar-senha">
              <Button className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium">
                Solicitar novo link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1351B4] px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="medium" />
            </div>
            <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
          </div>
          <div className="px-8 py-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Senha redefinida!</h2>
            <p className="text-gray-600 mb-8">
              Sua senha foi alterada com sucesso. Faça login com a nova senha.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium"
            >
              Ir para o Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Carregando validação do token
  if (tokenValido === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  // Formulário
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
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
              <h2 className="text-2xl font-semibold text-gray-900">Nova senha</h2>
              <p className="text-sm text-gray-600 mt-2">Defina uma nova senha para sua conta</p>
            </div>

            {erro && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="novaSenha"
                    type={showSenha ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={novaSenha}
                    onChange={(e) => {
                      setNovaSenha(e.target.value);
                      setSenhaDetalhes(validarSenha(e.target.value));
                    }}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {novaSenha && (
                  <div className="space-y-1 text-xs">
                    {[
                      { ok: senhaDetalhes.tamanho, label: "Mínimo 8 caracteres" },
                      { ok: senhaDetalhes.numero, label: "Pelo menos um número" },
                      { ok: senhaDetalhes.maiuscula, label: "Pelo menos uma maiúscula" },
                      { ok: senhaDetalhes.especial, label: "Pelo menos um caractere especial" },
                    ].map(({ ok, label }) => (
                      <p key={label} className={ok ? "text-green-600" : "text-gray-400"}>
                        {ok ? "✓" : "○"} {label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmarSenha"
                    type={showConfirmar ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmar(!showConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmarSenha && novaSenha !== confirmarSenha && (
                  <p className="text-xs text-red-600">As senhas não coincidem</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  "Redefinir Senha"
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