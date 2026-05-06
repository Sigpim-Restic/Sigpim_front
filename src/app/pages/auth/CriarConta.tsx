import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  User, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight,
  CheckCircle2, CreditCard, Briefcase, Phone, Hash, AtSign, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  orgaosApi, unidadesApi, usuariosApi,
  type OrgaoResponse, type UnidadeOrganizacionalResponse,
} from "../../api/usuarios";
import { ApiError } from "../../api/client";

function validarSenha(senha: string) {
  return {
    tamanho:  senha.length >= 8,
    numero:   /\d/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    especial: /[!@#$%^&*()_+\-=\[\]{};:"|,.<>/?\\]/.test(senha),
  };
}

function formatarCPF(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validarCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcularDigito = (base: number) => {
    let soma = 0;
    for (let i = 0; i < base; i++) {
      soma += Number(digits[i]) * (base + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(digits[9]) && calcularDigito(10) === Number(digits[10]);
}

function formatarCelular(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export function CriarConta() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nomeCompleto: "", email: "", cpf: "", celular: "",
    nomeUsuario: "", matricula: "", cargo: "",
    senha: "", confirmarSenha: "",
    idOrgao: "" as string, idUnidade: "" as string,
  });

  const [orgaos,   setOrgaos]   = useState<OrgaoResponse[]>([]);
  const [unidades, setUnidades] = useState<UnidadeOrganizacionalResponse[]>([]);

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [senhaDetalhes,       setSenhaDetalhes]       = useState(validarSenha(""));
  const [erro,                setErro]                = useState<string | null>(null);
  const [loading,             setLoading]             = useState(false);
  const [loadingOrgaos,       setLoadingOrgaos]       = useState(true);
  const [loadingUnidades,     setLoadingUnidades]     = useState(false);
  const [enviado,             setEnviado]             = useState(false);

  const cpfDigits = formData.cpf.replace(/\D/g, "");
  const cpfCompleto = cpfDigits.length === 11;
  const cpfValido = cpfCompleto && validarCPF(formData.cpf);
  const cpfInvalido = cpfCompleto && !cpfValido;

  useEffect(() => {
    orgaosApi.listarAtivos()
      .then((data) => setOrgaos(Array.isArray(data) ? data : []))
      .catch(() => setErro("Não foi possível carregar os órgãos."))
      .finally(() => setLoadingOrgaos(false));
  }, []);

  useEffect(() => {
    if (!formData.idOrgao) { setUnidades([]); return; }
    setLoadingUnidades(true);
    setFormData((prev) => ({ ...prev, idUnidade: "" }));
    unidadesApi.listarAtivasPorOrgao(Number(formData.idOrgao))
      .then((data) => setUnidades(Array.isArray(data) ? data : []))
      .catch(() => setErro("Não foi possível carregar as unidades."))
      .finally(() => setLoadingUnidades(false));
  }, [formData.idOrgao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!cpfValido) {
      setErro("Informe um CPF válido para continuar.");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem."); return;
    }
    const sv = validarSenha(formData.senha);
    if (!sv.tamanho || !sv.numero || !sv.maiuscula || !sv.especial) {
      setErro("A senha não atende aos requisitos mínimos."); return;
    }

    setLoading(true);
    try {
      await usuariosApi.criar({
        nomeCompleto: formData.nomeCompleto,
        email:        formData.email,
        cpf:          formData.cpf.replace(/\D/g, ""),
        celular:      formData.celular.replace(/\D/g, "") || undefined,
        nomeUsuario:  formData.nomeUsuario,
        senha:        formData.senha,
        matricula:    formData.matricula || undefined,
        cargo:        formData.cargo || undefined,
        idOrgao:      formData.idOrgao  ? Number(formData.idOrgao)  : null,
        idUnidade:    formData.idUnidade ? Number(formData.idUnidade) : null,
      });
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro inesperado. Tente novamente.");
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
            </div>

            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">Solicitação enviada!</h2>
            
            <p className="text-slate-600 mb-2">
              Sua conta foi criada e está <span className="font-semibold text-yellow-600">aguardando ativação</span>.
            </p>
            
            <p className="text-sm text-slate-500 mb-8">
              Um administrador do sistema irá revisar seu cadastro, definir seu perfil de acesso e ativar sua conta. Você receberá acesso em breve.
            </p>

            <Button
              onClick={() => navigate("/login")}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3b8d] py-3 text-sm font-semibold text-white"
            >
              Ir para o Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} SEMAD/SIN
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-4xl px-4">
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
                Novo cadastro
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Criar Conta</h2>
              <p className="mt-1 text-sm text-slate-500">
                Preencha os dados para solicitar acesso ao sistema
              </p>
            </div>

            {/* Info box */}
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
              <span>
                Sua conta será criada como <strong>inativa</strong>. Um administrador irá definir seu perfil de acesso e ativar sua conta.
              </span>
            </div>

            {erro && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome Completo */}
              <div>
                <Label htmlFor="nomeCompleto" className="text-sm font-medium text-slate-700">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                  <User className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  <input
                    id="nomeCompleto"
                    type="text"
                    value={formData.nomeCompleto}
                    onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* E-mail */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    E-mail Institucional <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <Mail className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="seu.email@slz.ma.gov.br"
                      required
                    />
                  </div>
                </div>

                {/* CPF */}
                <div>
                  <Label htmlFor="cpf" className="text-sm font-medium text-slate-700">
                    CPF <span className="text-red-500">*</span>
                  </Label>
                  <div className={`mt-1.5 flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20 ${
                    cpfInvalido ? "border-red-300" : "border-slate-300"
                  }`}>
                    <CreditCard className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatarCPF(e.target.value) })}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                    />
                  </div>
                  {cpfInvalido && (
                    <p className="mt-1 text-xs text-red-600">CPF inválido. Informe um CPF válido.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome de Usuário */}
                <div>
                  <Label htmlFor="nomeUsuario" className="text-sm font-medium text-slate-700">
                    Nome de Usuário <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <AtSign className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="nomeUsuario"
                      type="text"
                      value={formData.nomeUsuario}
                      onChange={(e) => setFormData({ ...formData, nomeUsuario: e.target.value })}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="letras, números, . _ -"
                      required
                    />
                  </div>
                </div>

                {/* Celular */}
                <div>
                  <Label htmlFor="celular" className="text-sm font-medium text-slate-700">Celular</Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="celular"
                      type="text"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: formatarCelular(e.target.value) })}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="(98) 99999-0000"
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matrícula */}
                <div>
                  <Label htmlFor="matricula" className="text-sm font-medium text-slate-700">Matrícula</Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <Hash className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="matricula"
                      type="text"
                      value={formData.matricula}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="Número de matrícula"
                    />
                  </div>
                </div>

                {/* Cargo */}
                <div>
                  <Label htmlFor="cargo" className="text-sm font-medium text-slate-700">Cargo</Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <Briefcase className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="cargo"
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="Ex: Analista Patrimonial"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Senha */}
                <div>
                  <Label htmlFor="senha" className="text-sm font-medium text-slate-700">
                    Senha <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <Lock className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={(e) => { setFormData({ ...formData, senha: e.target.value }); setSenhaDetalhes(validarSenha(e.target.value)); }}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.senha && (
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <p className={senhaDetalhes.tamanho ? "text-emerald-600" : "text-slate-400"}>
                        {senhaDetalhes.tamanho ? "✓" : "○"} Mínimo 8 caracteres
                      </p>
                      <p className={senhaDetalhes.numero ? "text-emerald-600" : "text-slate-400"}>
                        {senhaDetalhes.numero ? "✓" : "○"} Pelo menos um número
                      </p>
                      <p className={senhaDetalhes.maiuscula ? "text-emerald-600" : "text-slate-400"}>
                        {senhaDetalhes.maiuscula ? "✓" : "○"} Pelo menos uma maiúscula
                      </p>
                      <p className={senhaDetalhes.especial ? "text-emerald-600" : "text-slate-400"}>
                        {senhaDetalhes.especial ? "✓" : "○"} Pelo menos um caractere especial
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <Label htmlFor="confirmarSenha" className="text-sm font-medium text-slate-700">
                    Confirmar Senha <span className="text-red-500">*</span>
                  </Label>
                  <div className={`mt-1.5 flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20 ${
                    formData.confirmarSenha && formData.senha !== formData.confirmarSenha ? "border-red-300" : "border-slate-300"
                  }`}>
                    <Lock className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <input
                      id="confirmarSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="Repita a senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="flex-shrink-0 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
                    <p className="mt-1 text-xs text-red-600">As senhas não coincidem</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Órgão */}
                <div>
                  <Label className="text-sm font-medium text-slate-700">Órgão</Label>
                  <Select value={formData.idOrgao} onValueChange={(v) => setFormData({ ...formData, idOrgao: v })} disabled={loadingOrgaos}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={loadingOrgaos ? "Carregando..." : "Selecione o órgão"} />
                    </SelectTrigger>
                    <SelectContent>
                      {orgaos.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>{o.sigla} – {o.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unidade */}
                <div>
                  <Label className="text-sm font-medium text-slate-700">Unidade Organizacional</Label>
                  <Select value={formData.idUnidade} onValueChange={(v) => setFormData({ ...formData, idUnidade: v })} disabled={!formData.idOrgao || loadingUnidades}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={!formData.idOrgao ? "Selecione primeiro o órgão" : loadingUnidades ? "Carregando..." : "Selecione a unidade"} />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !cpfValido}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#1351B4] hover:bg-[#0c3b8d] py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Solicitar Acesso
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
              <Link to="/">
                <Button variant="ghost" className="w-full text-sm text-slate-400 hover:text-[#1351B4]">
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Voltar ao início
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