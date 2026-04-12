import React, { useEffect, useState } from "react";
import { User, Mail, Phone, BadgeCheck, Building2, Lock, Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { usuariosApi, type UsuarioResponse } from "../../api/usuarios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const PERFIL_LABEL: Record<string, string> = {
  ADMINISTRADOR_SISTEMA:     "Administrador do Sistema",
  ADMINISTRADOR_PATRIMONIAL: "Administrador Patrimonial",
  CADASTRADOR_SETORIAL:      "Cadastrador Setorial",
  VALIDADOR_DOCUMENTAL:      "Validador Documental",
  VISTORIADOR:               "Vistoriador",
  PLANEJAMENTO:              "Planejamento",
  AUDITOR:                   "Auditor",
};

function Campo({ icone, label, valor }: {
  icone: React.ReactNode;
  label: string;
  valor?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1351B4]">
        {icone}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{valor ?? "—"}</p>
      </div>
    </div>
  );
}

function validarSenha(senha: string) {
  return {
    tamanho:  senha.length >= 8,
    numero:   /\d/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha),
  };
}

export function MeuPerfil() {
  const { usuario } = useAuth();

  const [dados,       setDados]       = useState<UsuarioResponse | null>(null);
  const [carregando,  setCarregando]  = useState(true);
  const [erroLoad,    setErroLoad]    = useState<string | null>(null);

  // Alteração de senha
  const [novaSenha,        setNovaSenha]        = useState("");
  const [confirmarSenha,   setConfirmarSenha]   = useState("");
  const [showNova,         setShowNova]         = useState(false);
  const [showConfirmar,    setShowConfirmar]     = useState(false);
  const [salvandoSenha,    setSalvandoSenha]    = useState(false);
  const [erroSenha,        setErroSenha]        = useState<string | null>(null);
  const [sucessoSenha,     setSucessoSenha]     = useState(false);

  const validacao = validarSenha(novaSenha);
  const senhaValida = Object.values(validacao).every(Boolean);

  useEffect(() => {
    if (!usuario?.id) return;
    setCarregando(true);
    usuariosApi
      .buscarPorId(usuario.id)
      .then(setDados)
      .catch(() => setErroLoad("Não foi possível carregar os dados do perfil."))
      .finally(() => setCarregando(false));
  }, [usuario?.id]);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroSenha(null);
    setSucessoSenha(false);

    if (!senhaValida) {
      setErroSenha("A senha não atende aos requisitos mínimos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    setSalvandoSenha(true);
    try {
      await usuariosApi.alterarMinhaSenha(novaSenha);
      setSucessoSenha(true);
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err: unknown) {
      setErroSenha(err instanceof Error ? err.message : "Erro ao alterar a senha.");
    } finally {
      setSalvandoSenha(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (erroLoad || !dados) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{erroLoad ?? "Perfil não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Meu Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Suas informações cadastrais no sistema</p>
      </div>

      {/* Card de dados */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
          <User className="h-4 w-4 text-[#1351B4]" />
          <h2 className="text-sm font-semibold text-gray-700">Dados Pessoais</h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-5 py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1351B4] text-white text-xl font-semibold select-none">
            {dados.nomeCompleto?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">{dados.nomeCompleto}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              <BadgeCheck className="h-3 w-3" />
              {PERFIL_LABEL[dados.perfil] ?? dados.perfil}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          <Campo icone={<Mail className="h-4 w-4" />}       label="E-mail"        valor={dados.email} />
          <Campo icone={<User className="h-4 w-4" />}       label="Nome de usuário" valor={dados.nomeUsuario} />
          <Campo icone={<Phone className="h-4 w-4" />}      label="Celular"       valor={dados.celular} />
          <Campo icone={<BadgeCheck className="h-4 w-4" />} label="Matrícula"     valor={dados.matricula} />
          <Campo icone={<Building2 className="h-4 w-4" />}  label="Cargo"         valor={dados.cargo} />
          <Campo icone={<User className="h-4 w-4" />}       label="CPF"           valor={
            dados.cpf
              ? dados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
              : null
          } />
        </div>
      </div>

      {/* Card de alteração de senha */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
          <Lock className="h-4 w-4 text-[#1351B4]" />
          <h2 className="text-sm font-semibold text-gray-700">Alterar Senha</h2>
        </div>

        <form onSubmit={handleAlterarSenha} className="space-y-4 p-5">

          {erroSenha && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{erroSenha}</span>
            </div>
          )}

          {sucessoSenha && (
            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Senha alterada com sucesso!</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Nova senha <span className="text-red-600">*</span></Label>
            <div className="relative">
              <Input
                type={showNova ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => { setNovaSenha(e.target.value); setSucessoSenha(false); }}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNova(!showNova)}
              >
                {showNova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {novaSenha && (
              <div className="grid grid-cols-2 gap-1 pt-1">
                {[
                  { ok: validacao.tamanho,   label: "Mínimo 8 caracteres" },
                  { ok: validacao.numero,    label: "Pelo menos um número" },
                  { ok: validacao.maiuscula, label: "Pelo menos uma maiúscula" },
                  { ok: validacao.especial,  label: "Pelo menos um caractere especial" },
                ].map(({ ok, label }) => (
                  <p key={label} className={`text-xs flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}>
                    <span>{ok ? "✓" : "○"}</span> {label}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Confirmar nova senha <span className="text-red-600">*</span></Label>
            <div className="relative">
              <Input
                type={showConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => { setConfirmarSenha(e.target.value); setSucessoSenha(false); }}
                placeholder="••••••••"
                className={`pr-10 ${confirmarSenha && confirmarSenha !== novaSenha ? "border-red-400" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmar(!showConfirmar)}
              >
                {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmarSenha && confirmarSenha !== novaSenha && (
              <p className="text-xs text-red-500">As senhas não coincidem.</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1351B4] hover:bg-[#0c3b8d]"
            disabled={salvandoSenha || !novaSenha || !confirmarSenha}
          >
            {salvandoSenha ? (
              <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
            ) : (
              <><Lock className="mr-2 h-4 w-4" />Alterar Senha</>
            )}
          </Button>
        </form>
      </div>

    </div>
  );
}
