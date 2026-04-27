import React, { useState } from "react";
import { Shield, ShieldCheck, ShieldOff, Loader2, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { mfaApi, type MfaSetupResponse } from "../../api/mfa";
import { useAuth } from "../../contexts/AuthContext";
import QRCode from "react-qr-code";

type Etapa = "inicial" | "qrcode" | "confirmar" | "ativo" | "desativar";

export function ConfigurarMfa() {
  const { usuario, atualizarMfa } = useAuth();
  const mfaAtivo = usuario?.mfaAtivo ?? false;

  const [etapa,    setEtapa]    = useState<Etapa>(mfaAtivo ? "ativo" : "inicial");
  const [setup,    setSetup]    = useState<MfaSetupResponse | null>(null);
  const [codigo,   setCodigo]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [erro,     setErro]     = useState<string | null>(null);
  const [copiado,  setCopiado]  = useState(false);

  const handleIniciarSetup = async () => {
    setLoading(true); setErro(null);
    try {
      const res = await mfaApi.setup();
      setSetup(res);
      setEtapa("qrcode");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao iniciar configuração.");
    } finally { setLoading(false); }
  };

  const handleConfirmar = async () => {
    if (codigo.length !== 6) return;
    setLoading(true); setErro(null);
    try {
      await mfaApi.confirmar(codigo);
      atualizarMfa(true);
      setEtapa("ativo");
      setCodigo("");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Código inválido. Tente novamente.");
      setCodigo("");
    } finally { setLoading(false); }
  };

  const handleDesativar = async () => {
    if (codigo.length !== 6) return;
    setLoading(true); setErro(null);
    try {
      await mfaApi.desativar(codigo);
      atualizarMfa(false);
      setEtapa("inicial");
      setCodigo("");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Código inválido. Tente novamente.");
      setCodigo("");
    } finally { setLoading(false); }
  };

  const copiarChave = () => {
    if (setup?.secretKey) {
      navigator.clipboard.writeText(setup.secretKey);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
    if (erro) setErro(null);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        {mfaAtivo
          ? <ShieldCheck className="h-6 w-6 text-green-600" />
          : <Shield className="h-6 w-6 text-gray-400" />
        }
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Autenticação em dois fatores (MFA)
          </h3>
          <p className="text-xs text-gray-500">
            {mfaAtivo
              ? "MFA ativo — sua conta está protegida com um segundo fator."
              : "Adicione uma camada extra de segurança ao seu login."}
          </p>
        </div>
        {mfaAtivo && (
          <span className="ml-auto rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            Ativo
          </span>
        )}
      </div>

      {erro && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{erro}
        </div>
      )}

      {/* Etapa: inicial — MFA desativado */}
      {etapa === "inicial" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 space-y-1">
            <p>Com o MFA ativo, além da senha você precisará de um código do app autenticador a cada login.</p>
            <p className="text-xs text-gray-400">Compatível com Google Authenticator, Microsoft Authenticator e Authy — todos gratuitos.</p>
          </div>
          <Button
            className="bg-[#1351B4] hover:bg-[#0c3b8d]"
            onClick={handleIniciarSetup}
            disabled={loading}
          >
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando...</>
              : <><Shield className="mr-2 h-4 w-4" />Ativar MFA</>
            }
          </Button>
        </div>
      )}

      {/* Etapa: QR Code */}
      {etapa === "qrcode" && setup && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Passo 1 — Escaneie o QR Code</p>
            <p>Abra o app autenticador e escaneie o código abaixo. Se não conseguir escanear, use a chave manual.</p>
          </div>

          <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg">
            <QRCode value={setup.qrCodeUri} size={180} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Chave manual (se não conseguir escanear)</Label>
            <div className="flex gap-2">
              <Input
                value={setup.secretKey}
                readOnly
                className="font-mono text-xs bg-gray-50"
              />
              <Button variant="outline" size="sm" onClick={copiarChave}>
                {copiado
                  ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                  : <Copy className="h-4 w-4" />
                }
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEtapa("confirmar")}
          >
            Já escaneei — inserir código de confirmação →
          </Button>
        </div>
      )}

      {/* Etapa: confirmar com código */}
      {etapa === "confirmar" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">Passo 2 — Confirme com um código</p>
            <p>Digite o código de 6 dígitos gerado pelo app para confirmar que a configuração funcionou.</p>
          </div>

          <div className="space-y-2">
            <Label>Código de verificação</Label>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={codigo}
              onChange={handleCodigoChange}
              placeholder="000000"
              maxLength={6}
              className="text-center text-xl font-mono tracking-widest h-12"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEtapa("qrcode")} disabled={loading}>
              Voltar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleConfirmar}
              disabled={loading || codigo.length !== 6}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirmando...</>
                : <><CheckCircle2 className="mr-2 h-4 w-4" />Ativar MFA</>
              }
            </Button>
          </div>
        </div>
      )}

      {/* Etapa: MFA ativo */}
      {etapa === "ativo" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            MFA configurado com sucesso. Seu login agora exige o código do app autenticador.
          </div>
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => { setEtapa("desativar"); setCodigo(""); setErro(null); }}
          >
            <ShieldOff className="mr-2 h-4 w-4" />Desativar MFA
          </Button>
        </div>
      )}

      {/* Etapa: desativar */}
      {etapa === "desativar" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Para desativar o MFA, confirme com um código válido do seu app autenticador.
          </div>

          <div className="space-y-2">
            <Label>Código de verificação</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={codigo}
              onChange={handleCodigoChange}
              placeholder="000000"
              maxLength={6}
              className="text-center text-xl font-mono tracking-widest h-12"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEtapa("ativo"); setCodigo(""); setErro(null); }} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDesativar}
              disabled={loading || codigo.length !== 6}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Desativando...</>
                : <><ShieldOff className="mr-2 h-4 w-4" />Confirmar desativação</>
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}