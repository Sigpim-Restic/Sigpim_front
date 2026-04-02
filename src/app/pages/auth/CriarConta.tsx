import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Órgãos Responsáveis (mesmos do Step1Identificacao)
const secretarias = [
  { sigla: "SEMAD", nome: "Secretaria Municipal de Administração" },
  { sigla: "SEMURH", nome: "Secretaria Municipal de Urbanismo e Habitação" },
  { sigla: "SEMOSP", nome: "Secretaria Municipal de Obras e Serviços Públicos" },
  { sigla: "SEPLAN", nome: "Secretaria Municipal de Planejamento" },
  { sigla: "SEMFAZ", nome: "Secretaria Municipal da Fazenda" },
  { sigla: "SEMMAM", nome: "Secretaria Municipal de Meio Ambiente" },
  { sigla: "SEMISPE", nome: "Secretaria Municipal de Projetos Especiais" },
  { sigla: "INCID", nome: "Instituto da Cidade" },
  { sigla: "IMPUR", nome: "Instituto Municipal de Paisagem Urbana" },
  { sigla: "FUMPH", nome: "Fundação Municipal do Patrimônio Histórico" },
];

// Unidades Gestoras por Órgão
const unidadesPorSecretaria: Record<string, string[]> = {
  SEMAD: [
    "Coordenação de Bens Patrimoniais",
    "Departamento de Patrimônio Imobiliário",
    "Gestão de Prédios Públicos",
    "Serviços Gerais",
    "Almoxarifado Central",
    "Diretoria Administrativa",
  ],
  SEMURH: [
    "Coordenação de Habitação Popular",
    "Departamento de Urbanismo",
    "Regularização Fundiária",
    "Planejamento Urbano e Territorial",
    "Fiscalização de Obras Particulares",
  ],
  SEMOSP: [
    "Obras Públicas",
    "Manutenção Urbana",
    "Engenharia e Projetos",
    "Infraestrutura Municipal",
    "Conservação de Vias Públicas",
  ],
  SEPLAN: [
    "Diretoria de Patrimônio Público",
    "Coordenação de Cadastro Imobiliário",
    "GIS e Georreferenciamento",
    "Planejamento Territorial",
    "Gestão de Projetos Estratégicos",
    "Desenvolvimento Urbano",
  ],
  SEMFAZ: [
    "Auditoria Patrimonial",
    "Controle Interno",
    "Gestão de Contratos",
    "Tributação Imobiliária",
    "Fiscalização de Receitas",
  ],
  SEMMAM: [
    "Gestão Ambiental",
    "Fiscalização Ambiental",
    "Áreas Protegidas e Unidades de Conservação",
    "Licenciamento Ambiental",
    "Educação Ambiental",
  ],
  SEMISPE: [
    "Coordenação de Projetos Especiais",
    "Captação de Recursos",
    "Gestão de Convênios",
    "Desenvolvimento Institucional",
  ],
  INCID: [
    "Pesquisa e Desenvolvimento Urbano",
    "Observatório da Cidade",
    "Cartografia e Geoprocessamento",
    "Estudos Territoriais",
    "Sistema de Informação Urbana",
  ],
  IMPUR: [
    "Ordenamento Paisagístico",
    "Fiscalização de Publicidade",
    "Mobiliário Urbano",
    "Gestão de Espaços Públicos",
  ],
  FUMPH: [
    "Preservação Histórica",
    "Tombamento e Inventário",
    "Restauração e Conservação",
    "Educação Patrimonial",
    "Acervo Documental",
  ],
};

// Funções/Cargos
const funcoes = [
  "Secretário(a) Municipal",
  "Diretor(a)",
  "Coordenador(a)",
  "Gerente",
  "Supervisor(a)",
  "Analista",
  "Técnico(a)",
  "Assistente Administrativo",
  "Auditor(a)",
  "Fiscal",
  "Engenheiro(a)",
  "Arquiteto(a)",
  "Advogado(a)",
  "Contador(a)",
  "Estagiário(a)",
];

export function CriarConta() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    secretaria: "",
    unidade: "",
    funcao: "",
  });
  const [erros, setErros] = useState({
    senhasDiferentes: false,
    senhaFraca: false,
    senhaDetalhes: {
      tamanho: false,
      numero: false,
      maiuscula: false,
      especial: false,
    },
  });

  // Validação de CPF simples (apenas formato)
  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return valor;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cpfFormatado = formatarCPF(e.target.value);
    setFormData({ ...formData, cpf: cpfFormatado });
  };

  const handleSecretariaChange = (sigla: string) => {
    setFormData({ ...formData, secretaria: sigla, unidade: "" });
  };

  const validarSenha = (senha: string) => {
    return {
      tamanho: senha.length >= 10,
      numero: /\d/.test(senha),
      maiuscula: /[A-Z]/.test(senha),
      especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha),
    };
  };

  const validarFormulario = () => {
    let valido = true;
    const validacaoSenha = validarSenha(formData.senha);
    const senhaValida =
      validacaoSenha.tamanho &&
      validacaoSenha.numero &&
      validacaoSenha.maiuscula &&
      validacaoSenha.especial;

    const novosErros = {
      senhasDiferentes: false,
      senhaFraca: false,
      senhaDetalhes: validacaoSenha,
    };

    // Validar se as senhas coincidem
    if (formData.senha !== formData.confirmarSenha) {
      novosErros.senhasDiferentes = true;
      valido = false;
    }

    // Validar força da senha
    if (!senhaValida) {
      novosErros.senhaFraca = true;
      valido = false;
    }

    setErros(novosErros);
    return valido;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    // Mock de criação de conta - em produção, isso seria uma chamada à API
    console.log("Criar conta:", formData);
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
                Solicitação enviada!
              </h2>
              <p className="text-gray-600 mb-6">
                Sua solicitação de acesso foi enviada para análise do administrador
                do sistema.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Você receberá um e-mail em{" "}
                <span className="font-medium text-gray-900">{formData.email}</span>{" "}
                assim que seu acesso for aprovado. O processo pode levar até 48
                horas úteis.
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
                Em caso de dúvidas, entre em contato com o administrador do sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1351B4] to-[#0c3b8d] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
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
                Criar Conta
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Preencha os dados abaixo para solicitar acesso ao sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email e CPF em Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      className="pl-10"
                      maxLength={14}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Senha e Confirmar Senha em Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 10 caracteres"
                      value={formData.senha}
                      onChange={(e) => {
                        const novaSenha = e.target.value;
                        setFormData({ ...formData, senha: novaSenha });
                        setErros({
                          ...erros,
                          senhaDetalhes: validarSenha(novaSenha),
                        });
                      }}
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
                  {formData.senha && (
                    <div className="space-y-1 text-xs">
                      <p
                        className={
                          erros.senhaDetalhes.tamanho
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {erros.senhaDetalhes.tamanho ? "✓" : "○"} Mínimo 10
                        caracteres
                      </p>
                      <p
                        className={
                          erros.senhaDetalhes.numero
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {erros.senhaDetalhes.numero ? "✓" : "○"} Pelo menos um
                        número
                      </p>
                      <p
                        className={
                          erros.senhaDetalhes.maiuscula
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {erros.senhaDetalhes.maiuscula ? "✓" : "○"} Pelo menos
                        uma letra maiúscula
                      </p>
                      <p
                        className={
                          erros.senhaDetalhes.especial
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        {erros.senhaDetalhes.especial ? "✓" : "○"} Pelo menos um
                        caractere especial (!@#$%&*)
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmarSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={formData.confirmarSenha}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmarSenha: e.target.value,
                        })
                      }
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {erros.senhasDiferentes && (
                    <p className="text-xs text-red-600">As senhas não coincidem</p>
                  )}
                </div>
              </div>

              {/* Secretaria e Unidade em Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Secretaria */}
                <div className="space-y-2">
                  <Label htmlFor="secretaria">Secretaria/Órgão</Label>
                  <Select
                    value={formData.secretaria}
                    onValueChange={handleSecretariaChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a secretaria" />
                    </SelectTrigger>
                    <SelectContent>
                      {secretarias.map((sec) => (
                        <SelectItem key={sec.sigla} value={sec.sigla}>
                          {sec.sigla} – {sec.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Unidade */}
                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade Gestora</Label>
                  <Select
                    value={formData.unidade}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unidade: value })
                    }
                    disabled={!formData.secretaria}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.secretaria
                            ? "Selecione a unidade"
                            : "Selecione primeiro a secretaria"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.secretaria &&
                        unidadesPorSecretaria[formData.secretaria]?.map(
                          (unidade) => (
                            <SelectItem key={unidade} value={unidade}>
                              {unidade}
                            </SelectItem>
                          )
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Função */}
              <div className="space-y-2">
                <Label htmlFor="funcao">Função/Cargo</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <Select
                    value={formData.funcao}
                    onValueChange={(value) =>
                      setFormData({ ...formData, funcao: value })
                    }
                    required
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Selecione sua função" />
                    </SelectTrigger>
                    <SelectContent>
                      {funcoes.map((funcao) => (
                        <SelectItem key={funcao} value={funcao}>
                          {funcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão de Criar Conta */}
              <Button
                type="submit"
                className="w-full bg-[#1351B4] hover:bg-[#0c3b8d] h-11 text-base font-medium mt-6"
              >
                Criar Conta
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
