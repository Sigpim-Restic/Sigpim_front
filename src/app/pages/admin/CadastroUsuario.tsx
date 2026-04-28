import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Card } from "../../components/ui/card";
import { AlertBox } from "../../components/layout/States";
import { orgaosApi, type OrgaoResponse } from "../../api/orgaos";
import { unidadesApi, type UnidadeOrganizacionalResponse } from "../../api/unidades";
import { usuariosApi, type PerfilUsuario } from "../../api/usuarios";

// ── Validação de CPF (algoritmo dos dígitos verificadores) ────────────────────
function validarCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(9) === parseInt(digits[9]) && calc(10) === parseInt(digits[10]);
}

function formatarCpf(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// ── Validação de força de senha ───────────────────────────────────────────────
interface RequisitosSenh {
  minimo8: boolean;
  maiuscula: boolean;
  numero: boolean;
  especial: boolean;
}

function verificarRequisitos(senha: string): RequisitosSenh {
  return {
    minimo8:  senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    numero:   /[0-9]/.test(senha),
    especial: /[^A-Za-z0-9]/.test(senha),
  };
}

function senhaValida(senha: string): boolean {
  const r = verificarRequisitos(senha);
  return r.minimo8 && r.maiuscula && r.numero && r.especial;
}

// Os 7 perfis do Manual SIGPIM §1 — Usuários, Perfis e Auditoria
const PERFIS: { value: PerfilUsuario; label: string; descricao: string }[] = [
  { value: "ADMINISTRADOR_SISTEMA",    label: "Administrador do Sistema",      descricao: "SIN/SEMAD — infraestrutura, perfis, auditoria técnica" },
  { value: "ADMINISTRADOR_PATRIMONIAL",label: "Administrador Patrimonial",     descricao: "SEMAD — cadastro patrimonial, termos, guarda/uso" },
  { value: "CADASTRADOR_SETORIAL",     label: "Cadastrador Setorial",          descricao: "Por secretaria — alimenta as abas de sua competência" },
  { value: "VALIDADOR_DOCUMENTAL",     label: "Validador Documental/Jurídico", descricao: "SEMAD/Procuradoria — valida documentos e situação dominial" },
  { value: "VISTORIADOR",              label: "Vistoriador",                   descricao: "SEMOSP/SEMAD — vistorias, conservação e risco" },
  { value: "PLANEJAMENTO",             label: "Planejamento",                  descricao: "SEPLAN — carteira de projetos e uso planejado" },
  { value: "AUDITOR",                  label: "Auditor/Controladoria",         descricao: "Somente leitura e exportações" },
];

export function CadastroUsuario() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nomeCompleto: "", cpf: "", email: "", celular: "",
    nomeUsuario: "", matricula: "", cargo: "",
    idOrgao: "", idUnidade: "", perfil: "" as PerfilUsuario | "",
    status: "Ativo",
    senha: "", confirmarSenha: "",
    trocarSenhaNoProximoLogin: true,
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [orgaos,   setOrgaos]   = useState<OrgaoResponse[]>([]);
  const [unidades, setUnidades] = useState<UnidadeOrganizacionalResponse[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erroApi,  setErroApi]  = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [senhaFocada, setSenhaFocada] = useState(false);

  useEffect(() => {
    orgaosApi.listarAtivos().then(setOrgaos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.idOrgao) { setUnidades([]); return; }
    unidadesApi.listarAtivasPorOrgao(Number(form.idOrgao))
      .then(setUnidades)
      .catch(() => setUnidades([]));
  }, [form.idOrgao]);

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nomeCompleto.trim()) e.nomeCompleto = "Nome completo é obrigatório.";
    const cpfDigits = form.cpf.replace(/\D/g, "");
    if (!cpfDigits || cpfDigits.length !== 11) e.cpf = "CPF deve conter 11 dígitos.";
    else if (!validarCpf(form.cpf)) e.cpf = "CPF inválido. Verifique os dígitos informados.";
    // FIX: removida validação de domínio .gov.br — e-mail livre
    if (!form.email.trim()) e.email = "E-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Informe um e-mail válido.";
    if (!form.nomeUsuario.trim()) e.nomeUsuario = "Nome de usuário é obrigatório.";
    if (!form.idOrgao) e.idOrgao = "Órgão é obrigatório.";
    if (!form.idUnidade) e.idUnidade = "Unidade é obrigatória.";
    if (!form.perfil) e.perfil = "Perfil de acesso é obrigatório.";
    if (!form.senha) e.senha = "Senha é obrigatória.";
    else if (!senhaValida(form.senha)) e.senha = "A senha não atende aos requisitos mínimos.";
    if (form.senha !== form.confirmarSenha) e.confirmarSenha = "As senhas não coincidem.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    if (!validarCpf(form.cpf)) {
      setErros(prev => ({ ...prev, cpf: "CPF inválido. Verifique os dígitos informados." }));
      return;
    }
    setSalvando(true);
    setErroApi(null);
    try {
      await usuariosApi.criar({
        nomeCompleto: form.nomeCompleto,
        cpf:          form.cpf.replace(/\D/g, ""),
        email:        form.email,
        celular:      form.celular || undefined,
        nomeUsuario:  form.nomeUsuario,
        senha:        form.senha,
        matricula:    form.matricula || undefined,
        cargo:        form.cargo     || undefined,
        idOrgao:      Number(form.idOrgao),
        idUnidade:    Number(form.idUnidade),
        perfil:       form.perfil as PerfilUsuario,
        trocarSenhaNoProximoLogin: form.trocarSenhaNoProximoLogin,
      });
      navigate("/dashboard/usuarios/sucesso");
    } catch (err: unknown) {
      setErroApi(err instanceof Error ? err.message : "Erro ao criar usuário.");
    } finally {
      setSalvando(false);
    }
  };

  const campo = (field: string, label: string, opts?: { required?: boolean; placeholder?: string; hint?: string; type?: string }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>
        {label}{opts?.required && <span className="text-red-600 ml-0.5">*</span>}
      </Label>
      <Input
        id={field}
        type={opts?.type ?? "text"}
        value={(form as any)[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={opts?.placeholder}
        className={erros[field] ? "border-red-400" : ""}
      />
      {opts?.hint && <p className="text-xs text-gray-500">{opts.hint}</p>}
      {erros[field] && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />{erros[field]}
        </p>
      )}
    </div>
  );

  const requisitos = verificarRequisitos(form.senha);
  const mostrarRequisitos = senhaFocada || (form.senha.length > 0 && !senhaValida(form.senha));

  const RequisitoItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-600" : "text-gray-500"}`}>
      {ok
        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        : <XCircle className="h-3.5 w-3.5 shrink-0" />
      }
      {label}
    </li>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/usuarios")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Novo Usuário</h2>
          <p className="text-sm text-gray-600">Cadastre um novo usuário e defina suas permissões</p>
        </div>
      </div>

      <AlertBox variant="info">
        Campos com <span className="text-red-600 font-medium">*</span> são obrigatórios.
        Se marcado "Exigir troca de senha no primeiro login", o usuário verá um modal ao entrar pela primeira vez.
      </AlertBox>

      {erroApi && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />{erroApi}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Dados pessoais ───────────────────────────────────────────────── */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Dados Pessoais</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {campo("nomeCompleto", "Nome Completo", { required: true, placeholder: "Ex: Maria Silva Santos" })}

            {/* CPF com validação em tempo real */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF <span className="text-red-600">*</span></Label>
              <div className="relative">
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(e) => {
                    const formatado = formatarCpf(e.target.value);
                    set("cpf", formatado);
                    const digits = formatado.replace(/\D/g, "");
                    if (digits.length === 11) {
                      setErros(prev => ({
                        ...prev,
                        cpf: validarCpf(formatado) ? "" : "CPF inválido. Verifique os dígitos informados.",
                      }));
                    } else {
                      setErros(prev => ({ ...prev, cpf: "" }));
                    }
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                  className={`pr-8 ${erros.cpf ? "border-red-400" : form.cpf.replace(/\D/g, "").length === 11 ? validarCpf(form.cpf) ? "border-green-400" : "border-red-400" : ""}`}
                />
                {form.cpf.replace(/\D/g, "").length === 11 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validarCpf(form.cpf)
                      ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                      : <AlertCircle className="h-4 w-4 text-red-500" />
                    }
                  </span>
                )}
              </div>
              {form.cpf.replace(/\D/g, "").length === 11 && !validarCpf(form.cpf) && !erros.cpf && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />CPF inválido. Verifique os dígitos.
                </p>
              )}
              {form.cpf.replace(/\D/g, "").length === 11 && validarCpf(form.cpf) && (
                <p className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3" />CPF válido.
                </p>
              )}
              {erros.cpf && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />{erros.cpf}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* FIX: removido hint de domínio .gov.br e validação simples de formato */}
            {campo("email", "E-mail Institucional", { required: true, placeholder: "usuario@orgao.slz.ma.gov.br" })}
            {campo("celular", "Celular", { placeholder: "(98) 99999-9999" })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {campo("matricula", "Matrícula", { placeholder: "Ex: 123456" })}
            {campo("cargo", "Cargo", { placeholder: "Ex: Analista de TI" })}
          </div>
        </Card>

        {/* ── Acesso ao sistema ────────────────────────────────────────────── */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Acesso ao Sistema</h3>
          {campo("nomeUsuario", "Nome de Usuário", { required: true, placeholder: "Ex: maria.silva" })}

          {/* Senha */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="senha">Senha <span className="text-red-600">*</span></Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={form.senha}
                  onChange={e => set("senha", e.target.value)}
                  onFocus={() => setSenhaFocada(true)}
                  onBlur={() => setSenhaFocada(false)}
                  placeholder="Mínimo 8 caracteres"
                  className={erros.senha ? "border-red-400 pr-10" : "pr-10"}
                />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setMostrarSenha(v => !v)}>
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Requisitos de senha — aparecem ao focar ou enquanto inválida */}
              {mostrarRequisitos && (
                <ul className="mt-2 space-y-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  <RequisitoItem ok={requisitos.minimo8}  label="Mínimo 8 caracteres" />
                  <RequisitoItem ok={requisitos.maiuscula} label="Pelo menos uma letra maiúscula" />
                  <RequisitoItem ok={requisitos.numero}   label="Pelo menos um número" />
                  <RequisitoItem ok={requisitos.especial} label="Pelo menos um caractere especial (!@#$...)" />
                </ul>
              )}

              {erros.senha && <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />{erros.senha}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha <span className="text-red-600">*</span></Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={mostrarConfirmar ? "text" : "password"}
                  value={form.confirmarSenha}
                  onChange={e => set("confirmarSenha", e.target.value)}
                  placeholder="Repita a senha"
                  className={erros.confirmarSenha ? "border-red-400 pr-10" : "pr-10"}
                />
                <button type="button" tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setMostrarConfirmar(v => !v)}>
                  {mostrarConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {erros.confirmarSenha && <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />{erros.confirmarSenha}</p>}
            </div>
          </div>

          {/* Troca de senha no primeiro login */}
          <label className="flex items-start gap-3 cursor-pointer select-none rounded-lg border border-orange-200 bg-orange-50 p-3">
            <input
              type="checkbox"
              checked={form.trocarSenhaNoProximoLogin}
              onChange={e => set("trocarSenhaNoProximoLogin", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#1351B4]"
            />
            <div>
              <p className="text-sm font-medium text-orange-900">Exigir troca de senha no primeiro login</p>
              <p className="text-xs text-orange-700 mt-0.5">
                Recomendado. O usuário verá um modal ao entrar pela primeira vez solicitando que defina uma nova senha pessoal.
              </p>
            </div>
          </label>
        </Card>

        {/* ── Vínculo organizacional ───────────────────────────────────────── */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Vínculo Organizacional e Perfil</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Órgão <span className="text-red-600">*</span></Label>
              <Select value={form.idOrgao} onValueChange={v => { set("idOrgao", v); set("idUnidade", ""); }}>
                <SelectTrigger className={erros.idOrgao ? "border-red-400" : ""}>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {orgaos.map(o => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.sigla} — {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.idOrgao && <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />{erros.idOrgao}</p>}
            </div>

            <div className="space-y-2">
              <Label>Unidade <span className="text-red-600">*</span></Label>
              <Select
                value={form.idUnidade}
                onValueChange={v => set("idUnidade", v)}
                disabled={!form.idOrgao || unidades.length === 0}
              >
                <SelectTrigger className={erros.idUnidade ? "border-red-400" : ""}>
                  <SelectValue placeholder={!form.idOrgao ? "Selecione o órgão primeiro" : unidades.length === 0 ? "Carregando..." : "Selecione a unidade"} />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.sigla ? `${u.sigla} — ` : ""}{u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.idUnidade && <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />{erros.idUnidade}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Perfil de Acesso <span className="text-red-600">*</span></Label>
            <Select value={form.perfil} onValueChange={v => set("perfil", v)}>
              <SelectTrigger className={erros.perfil ? "border-red-400" : ""}>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {PERFIS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    <div>
                      <span className="font-medium">{p.label}</span>
                      <span className="text-xs text-gray-500 ml-2">— {p.descricao}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.perfil && <p className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />{erros.perfil}</p>}
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard/usuarios")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando} className="bg-[#1351B4] hover:bg-[#0c3b8d]">
            <Save className="mr-2 h-4 w-4" />
            {salvando ? "Salvando..." : "Salvar e Continuar"}
          </Button>
        </div>
      </form>
    </div>
  );
}