import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  CheckCircle2, XCircle, RefreshCw, ShieldCheck,
  FileText, Building2, User, Calendar,
} from "lucide-react";
import { relatoriosApi, type VerificacaoResponse } from "../../api/relatorios";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(dt: string | null | undefined): string {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Campo({ icone, label, valor }: {
  icone: React.ReactNode; label: string; valor: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1351B4]">
        {icone}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-800">{valor}</p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function VerificarDocumento() {
  const { token } = useParams<{ token: string }>();

  const [dados,      setDados]      = useState<VerificacaoResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro,       setErro]       = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setErro("Token inválido."); setCarregando(false); return; }

    relatoriosApi.verificarDocumento(token)
      .then((d) => setDados(d as unknown as VerificacaoResponse))
      .catch((e) => setErro(e?.message ?? "Documento não encontrado ou token inválido."))
      .finally(() => setCarregando(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Cabeçalho institucional */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#1351B4]">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">SIGPIM-SLZ</h1>
        <p className="text-sm text-gray-500">
          Prefeitura Municipal de São Luís · SEMAD
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Verificação de Autenticidade de Documento
        </p>
      </div>

      <div className="w-full max-w-md">

        {/* Carregando */}
        {carregando && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#1351B4] mb-3" />
            <p className="text-sm text-gray-500">Verificando autenticidade do documento...</p>
          </div>
        )}

        {/* Erro / Documento não encontrado */}
        {!carregando && erro && (
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-4">
              <XCircle className="h-12 w-12 text-red-500 mb-3" />
              <h2 className="text-base font-semibold text-gray-900">
                Documento não verificado
              </h2>
              <p className="text-sm text-gray-500 mt-1">{erro}</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-700 text-center">
              Este QR Code pode ser inválido, o documento pode ter sido removido,
              ou o token foi adulterado.
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">
              Token consultado: <code className="font-mono">{token}</code>
            </p>
          </div>
        )}

        {/* Documento verificado */}
        {!carregando && dados && (
          <div className="rounded-xl border border-green-200 bg-white shadow-sm overflow-hidden">

            {/* Banner de sucesso */}
            <div className="bg-green-500 px-5 py-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-white shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Documento Autêntico</p>
                <p className="text-xs text-green-100">
                  Emitido pelo SIGPIM-SLZ · Sistema oficial da Prefeitura de São Luís
                </p>
              </div>
            </div>

            {/* Dados do documento */}
            <div className="px-5 py-2">
              <Campo
                icone={<FileText className="h-4 w-4" />}
                label="Tipo de documento"
                valor={dados.nomeTipoRelatorio ?? "Ficha Cadastral"}
              />
              {dados.codigoSigpim && (
                <Campo
                  icone={<Building2 className="h-4 w-4" />}
                  label="Imóvel"
                  valor={dados.codigoSigpim}
                />
              )}
              {dados.nomeGeradoPor && (
                <Campo
                  icone={<User className="h-4 w-4" />}
                  label="Emitido por"
                  valor={dados.nomeGeradoPor}
                />
              )}
              <Campo
                icone={<Calendar className="h-4 w-4" />}
                label="Data de emissão"
                valor={fmt(dados.geradoEm)}
              />
            </div>

            {/* Token */}
            <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
              <p className="text-xs text-gray-400">
                Token de verificação: <code className="font-mono text-gray-600">{dados.token}</code>
              </p>
            </div>
          </div>
        )}

        {/* Link para o sistema */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs text-[#1351B4] hover:underline"
          >
            Acessar o SIGPIM-SLZ
          </Link>
          <span className="mx-2 text-gray-300">·</span>
          <span className="text-xs text-gray-400">
            Prefeitura Municipal de São Luís · {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}