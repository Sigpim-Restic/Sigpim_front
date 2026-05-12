import React, { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { usuariosApi } from "../../api/usuarios";

interface Props {
  idUsuario: number;
  nomeUsuario: string;
  aberto: boolean;
  onFechar: () => void;
}

export function ModalResetSenha({ idUsuario, nomeUsuario, aberto, onFechar }: Props) {
  const [novaSenha, setNovaSenha]           = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarNova, setMostrarNova]       = useState(false);
  const [mostrarConf, setMostrarConf]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [erro, setErro]                     = useState<string | null>(null);
  const [sucesso, setSucesso]               = useState(false);

  const erroValidacao =
    novaSenha.length > 0 && novaSenha.length < 8
      ? "A senha deve ter no mínimo 8 caracteres."
      : confirmarSenha.length > 0 && novaSenha !== confirmarSenha
      ? "As senhas não coincidem."
      : null;

  const podeEnviar =
    novaSenha.length >= 8 && novaSenha === confirmarSenha && !loading;

  const handleFechar = () => {
    if (loading) return;
    setNovaSenha("");
    setConfirmarSenha("");
    setErro(null);
    setSucesso(false);
    onFechar();
  };

  const handleSalvar = async () => {
    if (!podeEnviar) return;
    setLoading(true);
    setErro(null);
    try {
      await usuariosApi.resetarSenha(idUsuario, novaSenha);
      setSucesso(true);
    } catch (e: unknown) {
      setErro((e as Error).message ?? "Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && handleFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#1351B4]" />
            Redefinir Senha
          </DialogTitle>
        </DialogHeader>

        {sucesso ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-sm font-medium text-gray-800">Senha redefinida com sucesso!</p>
            <p className="text-sm text-gray-500">
              A nova senha de <span className="font-medium">{nomeUsuario}</span> já está ativa.
              O usuário será solicitado a alterá-la no próximo login.
            </p>
            <Button className="mt-2 bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={handleFechar}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <p className="text-sm text-gray-600">
                Definindo nova senha para:{" "}
                <span className="font-medium text-gray-800">{nomeUsuario}</span>
              </p>

              {/* Nova senha */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nova senha</label>
                <div className="relative">
                  <Input
                    type={mostrarNova ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setMostrarNova((v) => !v)}
                  >
                    {mostrarNova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirmar nova senha</label>
                <div className="relative">
                  <Input
                    type={mostrarConf ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
                    className="pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setMostrarConf((v) => !v)}
                  >
                    {mostrarConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Erros de validação / API */}
              {(erroValidacao || erro) && (
                <p className="text-sm text-red-600">{erroValidacao ?? erro}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleFechar} disabled={loading}>
                Cancelar
              </Button>
              <Button
                className="bg-[#1351B4] hover:bg-[#0c3b8d]"
                onClick={handleSalvar}
                disabled={!podeEnviar}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando…</>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}