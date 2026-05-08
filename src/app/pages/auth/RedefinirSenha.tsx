import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router";
import {
  Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2, ArrowLeft, ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { api, ApiError } from "../../api/client";

function validarSenha(senha: string) {
  return {
    tamanho:   senha.length >= 8,
    numero:    /\d/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    especial:  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha),
  };
}

// ─── Layout wrapper — mesmo padrão do RecuperarSenha ────────────────────────

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SIGPIM
        </p>
      </div>
    </div>
  );
}

function CardHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div className="border-b border-slate-200 px-8 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <img src="/assets/logo-sigpim.png" alt="SIGPIM" className="h-8 w-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1351B4]">SIGPIM</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function CardFooter() {
  return (
    <div className="border-t border-slate-100 bg-slate-50 px-8 py-4">
      <p className="text-center text-xs text-slate-500">
        SEMAD
        <br />
        Sistema de gestão patrimonial municipal. Seus dados estão protegidos.
      </p>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function RedefinirSenha() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const [searchParams] = useSearchParams();

  const forcado = (location.state as { forcado?: boolean } | null)?.forcado === true;
  const token   = searchParams.get("token") ?? "";

  const [novaSenha,      setNovaSenha]      = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha,      setShowSenha]      = useState(false);
  const [showConfirmar,  setShowConfirmar]  = useState(false);
  const [senhaDetalhes,  setSenhaDetalhes]  = useState(validarSenha(""));

  const [tokenValido, setTokenValido] = useState<boolean | null>(forcado ? true : null);
  const [tokenErro,   setTokenErro]   = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [erro,        setErro]        = useState<string | null>(null);
  const [sucesso,     setSucesso]     = useState(false);

  useEffect(() => {
    if (forcado) return;
    if (!token) {
      setTokenValido(false);
      setTokenErro("Token não informado. Solicite um novo link de recuperação.");
      return;
    }
    api.get(`/auth/redefinir-senha/validar?token=${token}`)
      .then(() => setTokenValido(true))
      .catch((e) => {
        setTokenValido(false);
        setTokenErro(e instanceof ApiError ? e.message : "Token inválido ou expirado.");
      });
  }, [token, forcado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (novaSenha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
    const sv = validarSenha(novaSenha);
    if (!sv.tamanho || !sv.numero || !sv.maiuscula || !sv.especial) {
      setErro("A senha não atende aos requisitos mínimos."); return;
    }

    setLoading(true);
    try {
      if (forcado) {
        await api.patch("/usuarios/minha-senha", { novaSenha });
      } else {
        await api.post("/auth/redefinir-senha", { token, novaSenha });
      }
      setSucesso(true);
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Carregando validação do token ────────────────────────────────────────
  if (tokenValido === null) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1351B4]" />
      </div>
    );
  }

  // ── Token inválido ───────────────────────────────────────────────────────
  if (tokenValido === false) {
    return (
      <AuthCard>
        <CardHeader />
        <div className="px-8 py-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Link inválido</h2>
          <p className="text-sm text-slate-500 mb-8">{tokenErro}</p>
          <Link to="/auth/recuperar-senha">
            <Button className="w-full inline-flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3b8d] text-sm font-semibold">
              Solicitar novo link
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CardFooter />
      </AuthCard>
    );
  }

  // ── Sucesso ──────────────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <AuthCard>
        <CardHeader />
        <div className="px-8 py-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Senha redefinida
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
            Senha redefinida!
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            {forcado
              ? "Sua senha foi definida com sucesso. Você já pode usar o sistema."
              : "Sua senha foi alterada com sucesso. Faça login com a nova senha."
            }
          </p>
          <Button
            onClick={() => navigate(forcado ? "/dashboard" : "/login")}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3b8d] text-sm font-semibold"
          >
            {forcado ? "Ir para o sistema" : "Ir para o Login"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <CardFooter />
      </AuthCard>
    );
  }

  // ── Formulário ───────────────────────────────────────────────────────────
  return (
    <AuthCard>
      <CardHeader />

      <div className="px-8 py-8">
        {/* Título */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1351B4] ring-1 ring-blue-200 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1351B4]" />
            {forcado ? "Senha obrigatória" : "Nova senha"}
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {forcado ? "Defina sua senha" : "Nova senha"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {forcado
              ? "O administrador exige que você defina uma senha pessoal antes de continuar."
              : "Defina uma nova senha para sua conta"
            }
          </p>
        </div>

        {/* Aviso fluxo forçado */}
        {forcado && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Esta etapa é obrigatória. Não é possível acessar o sistema sem definir uma senha pessoal.</span>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nova senha */}
          <div className="space-y-1.5">
            <Label htmlFor="novaSenha" className="text-sm font-medium text-slate-700">
              Nova Senha *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="novaSenha"
                type={showSenha ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={novaSenha}
                onChange={(e) => {
                  setNovaSenha(e.target.value);
                  setSenhaDetalhes(validarSenha(e.target.value));
                }}
                className="pl-9 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {novaSenha && (
              <div className="space-y-1 pt-1">
                {[
                  { ok: senhaDetalhes.tamanho,   label: "Mínimo 8 caracteres" },
                  { ok: senhaDetalhes.numero,    label: "Pelo menos um número" },
                  { ok: senhaDetalhes.maiuscula, label: "Pelo menos uma maiúscula" },
                  { ok: senhaDetalhes.especial,  label: "Pelo menos um caractere especial" },
                ].map(({ ok, label }) => (
                  <p key={label} className={`text-xs ${ok ? "text-emerald-600" : "text-slate-400"}`}>
                    {ok ? "✓" : "○"} {label}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmarSenha" className="text-sm font-medium text-slate-700">
              Confirmar Senha *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="confirmarSenha"
                type={showConfirmar ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="pl-9 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmar(!showConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmarSenha && novaSenha !== confirmarSenha && (
              <p className="text-xs text-red-600">As senhas não coincidem</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3b8d] py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                {forcado ? "Definir Senha e Continuar" : "Redefinir Senha"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {!forcado && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link to="/login">
              <Button variant="ghost" className="w-full text-slate-600 hover:text-[#1351B4]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          </div>
        )}
      </div>

      <CardFooter />
    </AuthCard>
  );
}