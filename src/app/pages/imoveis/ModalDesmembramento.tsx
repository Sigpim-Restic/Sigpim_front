import React, { useState } from "react";
import { Loader2, Plus, Trash2, Copy, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import type { ImovelResponse } from "../../api/imoveis";
import { composicoesApi, type ImovelDestinoForm } from "../../api/composicoes";

interface Props {
  imovelPai: ImovelResponse;
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

function filhoZerado(): ImovelDestinoForm {
  return {
    herdarDoPai: true,
    nomeReferencia: "",
    descricao: "",
    areaTerrenoM2: undefined,
    areaConstruidaM2: undefined,
    inscricaoImobiliaria: "",
    matriculaRegistro: "",
  };
}

function filhoHerdado(pai: ImovelResponse): ImovelDestinoForm {
  return {
    herdarDoPai: true,
    nomeReferencia: pai.nomeReferencia ?? "",
    descricao: pai.descricao ?? "",
    areaTerrenoM2: undefined,            // área é sempre nova
    areaConstruidaM2: undefined,
    inscricaoImobiliaria: "",            // documento novo
    matriculaRegistro: "",
    idTipoImovel: pai.idTipoImovel,
    idOrgaoGestorPatrimonial: pai.idOrgaoGestorPatrimonial,
    idOrgaoGestorOperacional: pai.idOrgaoGestorOperacional,
    idUnidadeGestora: pai.idUnidadeGestora,
    tipologia: pai.tipologia ?? "",
    categoriaMacro: pai.categoriaMacro ?? "",
  };
}

export function ModalDesmembramento({ imovelPai, aberto, onFechar, onSucesso }: Props) {
  const [filhos,          setFilhos]          = useState<ImovelDestinoForm[]>([filhoHerdado(imovelPai), filhoHerdado(imovelPai)]);
  const [numeroProcesso,  setNumeroProcesso]  = useState("");
  const [observacoes,     setObservacoes]      = useState("");
  const [salvando,        setSalvando]         = useState(false);
  const [erro,            setErro]             = useState<string | null>(null);
  const [sucesso,         setSucesso]          = useState(false);

  const adicionarFilho = () =>
    setFilhos((prev) => [...prev, filhoHerdado(imovelPai)]);

  const removerFilho = (i: number) =>
    setFilhos((prev) => prev.filter((_, idx) => idx !== i));

  const atualizarFilho = (i: number, campo: keyof ImovelDestinoForm, valor: unknown) =>
    setFilhos((prev) => prev.map((f, idx) => idx === i ? { ...f, [campo]: valor } : f));

  const toggleHerdar = (i: number, herdar: boolean) =>
    setFilhos((prev) => prev.map((f, idx) =>
      idx === i ? (herdar ? filhoHerdado(imovelPai) : { ...filhoZerado(), herdarDoPai: false }) : f
    ));

  const handleConfirmar = async () => {
    if (!numeroProcesso.trim()) { setErro("Número do processo é obrigatório."); return; }
    if (filhos.length < 2) { setErro("Desmembramento exige ao menos 2 imóveis resultantes."); return; }

    setSalvando(true);
    setErro(null);
    try {
      await composicoesApi.registrar({
        tipoOperacao: "DESMEMBRAMENTO",
        idsImoveisOrigem: [imovelPai.id],
        imoveisDestino: filhos,
        numeroProcesso: numeroProcesso.trim(),
        observacoes: observacoes.trim() || undefined,
      });
      setSucesso(true);
      setTimeout(() => { onSucesso(); onFechar(); }, 1800);
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao registrar desmembramento.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(open) => { if (!open && !salvando) onFechar(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#1351B4]" />
            Desmembramento de Imóvel
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Imóvel de origem:{" "}
            <span className="font-medium text-gray-800">
              {imovelPai.codigoSigpim} — {imovelPai.nomeReferencia ?? "Sem nome"}
            </span>
          </p>
        </DialogHeader>

        {sucesso ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="font-semibold text-gray-900">Desmembramento registrado!</p>
            <p className="text-sm text-gray-500">
              {filhos.length} novos imóveis criados como PRÉ-CADASTRO.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-2">

            {/* Dados da operação */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900 text-sm">Dados da operação</h3>
              <div>
                <Label className="text-xs text-gray-600">Número do processo *</Label>
                <Input
                  value={numeroProcesso}
                  onChange={(e) => setNumeroProcesso(e.target.value)}
                  placeholder="Ex: 001234/2026-SEMAD"
                  className="mt-1"
                  disabled={salvando}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Observações</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Justificativa ou detalhes do desmembramento..."
                  rows={2}
                  className="mt-1 resize-none"
                  disabled={salvando}
                />
              </div>
            </div>

            {/* Imóveis resultantes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm">
                  Imóveis resultantes ({filhos.length})
                </h3>
                <Button variant="outline" size="sm" onClick={adicionarFilho} disabled={salvando}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                </Button>
              </div>

              {filhos.map((filho, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Imóvel {i + 1}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={filho.herdarDoPai}
                          onCheckedChange={(v) => toggleHerdar(i, v)}
                          disabled={salvando}
                        />
                        <span className="text-xs text-gray-500">
                          {filho.herdarDoPai ? "Herdando do pai" : "Preenchimento manual"}
                        </span>
                      </div>
                      {filhos.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50"
                          onClick={() => removerFilho(i)} disabled={salvando}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Nome de referência</Label>
                      <Input value={filho.nomeReferencia ?? ""} className="mt-1 text-sm"
                        onChange={(e) => atualizarFilho(i, "nomeReferencia", e.target.value)}
                        placeholder="Nome do imóvel resultante" disabled={salvando} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Inscrição imobiliária</Label>
                      <Input value={filho.inscricaoImobiliaria ?? ""} className="mt-1 text-sm"
                        onChange={(e) => atualizarFilho(i, "inscricaoImobiliaria", e.target.value)}
                        placeholder="Nova inscrição" disabled={salvando} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Área terreno (m²)</Label>
                      <Input type="number" value={filho.areaTerrenoM2 ?? ""} className="mt-1 text-sm"
                        onChange={(e) => atualizarFilho(i, "areaTerrenoM2", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="m²" disabled={salvando} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Área construída (m²)</Label>
                      <Input type="number" value={filho.areaConstruidaM2 ?? ""} className="mt-1 text-sm"
                        onChange={(e) => atualizarFilho(i, "areaConstruidaM2", e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="m²" disabled={salvando} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Matrícula</Label>
                      <Input value={filho.matriculaRegistro ?? ""} className="mt-1 text-sm"
                        onChange={(e) => atualizarFilho(i, "matriculaRegistro", e.target.value)}
                        placeholder="Matrícula no cartório" disabled={salvando} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                O imóvel de origem <strong>{imovelPai.codigoSigpim}</strong> será <strong>encerrado</strong>.
                Os imóveis resultantes nascerão como <strong>PRÉ-CADASTRO</strong> e deverão ser completados.
              </span>
            </div>

            {erro && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{erro}</span>
              </div>
            )}
          </div>
        )}

        {!sucesso && (
          <DialogFooter>
            <Button variant="outline" onClick={onFechar} disabled={salvando}>Cancelar</Button>
            <Button onClick={handleConfirmar} disabled={salvando}
              className="bg-[#1351B4] hover:bg-[#0c3b8d]">
              {salvando
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processando...</>
                : "Confirmar Desmembramento"
              }
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
