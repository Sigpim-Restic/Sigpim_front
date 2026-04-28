import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Menu, X, ArrowRight, Mail, Lock, Eye, EyeOff,
  AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { useAuth } from "../../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [showPassword,     setShowPassword]     = useState(false);
  const [erro,             setErro]             = useState<string | null>(null);
  const [formData, setFormData] = useState({
    identificador: "",
    senha: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    try {
      const resultado = await login({ identificador: formData.identificador, senha: formData.senha });
      if (resultado.mfaRequired && resultado.mfaToken) {
        navigate("/mfa", { state: { mfaToken: resultado.mfaToken } });
      } else if (resultado.trocarSenhaNoProximoLogin) {
        // Admin criou a conta com troca obrigatória — redireciona para redefinição
        navigate("/auth/redefinir-senha", { state: { forcado: true } });
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao servidor. Verifique se o back-end está rodando."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 antialiased font-sans">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/brasao-sao-luis.png" alt="Brasão de São Luís" className="h-11 w-auto object-contain" />
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight text-[#1351B4]">SIGPIM-SLZ</p>
              <p className="text-[11px] font-medium text-slate-500">Prefeitura de São Luís — MA</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link to="/#sobre"           className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Sobre</Link>
            <Link to="/#funcionalidades" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Funcionalidades</Link>
            <Link to="/#mapa"            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Mapa Público</Link>
            <Link to="/#objetivos"       className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Objetivos</Link>
            <div className="mx-2 h-6 w-px bg-slate-200" />
            <Button variant="ghost" className="text-slate-700 hover:text-[#1351B4]" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button className="ml-1 gap-1.5 bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={() => navigate("/auth/criar-conta")}>
              Criar Conta
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            onClick={() => setMenuMobileAberto(!menuMobileAberto)}
            className="text-slate-700 md:hidden"
            aria-label="menu"
          >
            {menuMobileAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {menuMobileAberto && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <Link to="/#sobre"           className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Sobre</Link>
              <Link to="/#funcionalidades" className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Funcionalidades</Link>
              <Link to="/#mapa"            className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Mapa Público</Link>
              <Link to="/#objetivos"       className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Objetivos</Link>
              <div className="my-2 h-px bg-slate-200" />
              <Button variant="ghost" className="w-full justify-start text-slate-700" onClick={() => { navigate("/login"); setMenuMobileAberto(false); }}>
                Login
              </Button>
              <Button className="w-full bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={() => { navigate("/auth/criar-conta"); setMenuMobileAberto(false); }}>
                Criar Conta
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── Conteúdo central ─────────────────────────────────────────────────── */}
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">

            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src="/assets/brasao-sao-luis.png" alt="Brasão de São Luís" className="h-12 w-12 object-contain" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Acesso de servidor
              </span>
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
              Acessar o sistema
            </h1>
            <p className="mt-1 text-center text-sm text-slate-500">
              Entre com seu CPF ou e-mail e senha institucional.
            </p>

            {erro && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">

              <div>
                <label htmlFor="identificador" className="text-sm font-medium text-slate-700">
                  CPF ou E-mail
                </label>
                <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                  <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <input
                    id="identificador"
                    type="text"
                    value={formData.identificador}
                    onChange={(e) => setFormData({ ...formData, identificador: e.target.value })}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="CPF (só dígitos) ou e-mail institucional"
                    autoComplete="username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="senha" className="text-sm font-medium text-slate-700">Senha</label>
                  <Link to="/auth/recuperar-senha" className="text-xs font-medium text-[#1351B4] hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                  <Lock className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="cursor-pointer text-sm text-slate-700">
                  Manter conectado neste dispositivo
                </label>
              </div>

              <Button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 bg-[#1351B4] py-3 text-sm font-semibold text-white hover:bg-[#0c3b8d] disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="pt-1 text-center text-sm text-slate-500">
                Ainda não tem conta?{" "}
                <Link to="/auth/criar-conta" className="font-semibold text-[#1351B4] hover:underline">
                  Solicitar acesso
                </Link>
              </p>

            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Prefeitura Municipal de São Luís — SEMAD/SIN
          </p>
        </div>
      </main>
    </div>
  );
}