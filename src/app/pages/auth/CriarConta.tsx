import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Building2, User, Mail, Lock, Eye, EyeOff, ArrowLeft,
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
    especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha),
  };
}

function formatarCPF(valor: string) {
  const n = valor.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
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

  useEffect(() => {
    orgaosApi.listarAtivos()
      .then(setOrgaos)
      .catch(() => setErro("Não foi possível carregar os órgãos."))
      .finally(() => setLoadingOrgaos(false));
  }, []);

  useEffect(() => {
    if (!formData.idOrgao) { setUnidades([]); return; }
    setLoadingUnidades(true);
    setFormData((prev) => ({ ...prev, idUnidade: "" }));
    unidadesApi.listarAtivasPorOrgao(Number(formData.idOrgao))
      .then(setUnidades)
      .catch(() => setErro("Não foi possível carregar as unidades."))
      .finally(() => setLoadingUnidades(false));
  }, [formData.idOrgao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

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
        // perfil intentionally omitted — admin assigns it later
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
      <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1351B4] px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10">
                <Building2 className="h-9 w-9 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
          </div>
          <div className="px-8 py-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                <CheckCircle2 className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Cadastro enviado!</h2>
            <p className="text-gray-600 mb-2">
              Sua conta foi criada e está <span className="font-semibold text-yellow-700">aguardando ativação</span>.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Um administrador do sistema irá revisar seu cadastro, definir seu perfil de acesso e ativar sua conta. Você receberá acesso em breve.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          <div className="bg-[#1351B4] px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10">
                <Building2 className="h-9 w-9 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">SIGPIM-SLZ</h1>
            <p className="text-sm text-white/80 mt-1">Sistema Integrado de Gestão do Patrimônio Imobiliário</p>
          </div>

          <div className="px-8 py-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Criar Conta</h2>
              <p className="text-sm text-gray-600 mt-2">
                Preencha os dados para solicitar acesso ao sistema
              </p>
            </div>

            {/* Info box — explains that account starts inactive */}
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
              <span>
                Sua conta será criada como <strong>inativa</strong>. Um administrador irá definir seu perfil de acesso e ativar sua conta.
              </span>
            </div>

            {erro && (
              <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">
                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input id="nomeCompleto" type="text" placeholder="Digite seu nome completo"
                    value={formData.nomeCompleto}
                    onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                    className="pl-10" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Institucional *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="email" type="email" placeholder="seu.email@slz.ma.gov.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="cpf" type="text" placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: formatarCPF(e.target.value) })}
                      className="pl-10" maxLength={14} required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="nomeUsuario">Nome de Usuário *</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="nomeUsuario" type="text" placeholder="letras, números, . _ -"
                      value={formData.nomeUsuario}
                      onChange={(e) => setFormData({ ...formData, nomeUsuario: e.target.value })}
                      className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="celular" type="text" placeholder="(98) 99999-0000"
                      value={formData.celular}
                      onChange={(e) => setFormData({ ...formData, celular: formatarCelular(e.target.value) })}
                      className="pl-10" maxLength={15} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="matricula" type="text" placeholder="Número de matrícula"
                      value={formData.matricula}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="cargo" type="text" placeholder="Ex: Analista Patrimonial"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="senha" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres"
                      value={formData.senha}
                      onChange={(e) => { setFormData({ ...formData, senha: e.target.value }); setSenhaDetalhes(validarSenha(e.target.value)); }}
                      className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.senha && (
                    <div className="space-y-1 text-xs">
                      {[
                        { ok: senhaDetalhes.tamanho,   label: "Mínimo 8 caracteres" },
                        { ok: senhaDetalhes.numero,    label: "Pelo menos um número" },
                        { ok: senhaDetalhes.maiuscula, label: "Pelo menos uma maiúscula" },
                        { ok: senhaDetalhes.especial,  label: "Pelo menos um caractere especial" },
                      ].map(({ ok, label }) => (
                        <p key={label} className={ok ? "text-green-600" : "text-gray-400"}>{ok ? "✓" : "○"} {label}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="confirmarSenha" type={showConfirmPassword ? "text" : "password"} placeholder="Repita a senha"
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                      className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
                    <p className="text-xs text-red-600">As senhas não coincidem</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Órgão</Label>
                  <Select value={formData.idOrgao} onValueChange={(v) => setFormData({ ...formData, idOrgao: v })} disabled={loadingOrgaos}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingOrgaos ? "Carregando..." : "Selecione o órgão"} />
                    </SelectTrigger>
                    <SelectContent>
                      {orgaos.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>{o.sigla} – {o.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade Organizacional</Label>
                  <Select value={formData.idUnidade} onValueChange={(v) => setFormData({ ...formData, idUnidade: v })} disabled={!formData.idOrgao || loadingUnidades}>
                    <SelectTrigger>
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

              <Button type="submit" disabled={loading}
                className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium mt-2">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : "Solicitar Acesso"}
              </Button>
            </form>

            <div className="mt-6">
              <Link to="/login">
                <Button variant="ghost" className="w-full h-11 text-base font-medium text-gray-700 hover:text-[#1351B4]">
                  <ArrowLeft className="mr-2 h-4 w-4" />Voltar para o login
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" className="w-full h-10 text-sm text-gray-400 hover:text-[#1351B4]">
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />Voltar ao início
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <p className="text-xs text-center text-gray-600">
              Prefeitura Municipal de São Luís — SEMAD<br />
              Sistema oficial do governo. Seus dados estão seguros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}