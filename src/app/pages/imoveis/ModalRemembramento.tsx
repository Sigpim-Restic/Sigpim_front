import React, { useState } from "react";
import { Loader2, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import type { ImovelResponse } from "../../api/imoveis";
import { composicoesApi } from "../../api/composicoes";

interface Props {
  imoveisOrigem: ImovelResponse[];    // selecionados na listagem
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

export function ModalRemembramento({ imoveisOrigem, aberto, onFechar, onSucesso }: Props) {
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [observacoes,    setObservacoes]    = useState("");
  const [nomeResultado,  setNomeResultado]  = useState("");
  const [descricao,      setDescricao]      = useState("");
  const [areaTerrenoM2,  setAreaTerreno]    = useState("");
  const [areaConstruida, setAreaConstruida] = useState("");
  const [inscricao,      setInscricao]      = useState("");
  const [matricula,      setMatricula]      = useState("");
  const [salvando,       setSalvando]       = useState(false);
  const [erro,           setErro]           = useState<string | null>(null);
  const [sucesso,        setSucesso]        = useState(false);

  const handleConfirmar = async () => {
    if (!numeroProcesso.trim()) { setErro("Número do processo é obrigatório."); return; }
    if (imoveisOrigem.length < 2) { setErro("Remembramento exige ao menos 2 imóveis de origem."); return; }

    setSalvando(true);
    setErro(null);
    try {
      await composicoesApi.registrar({
        tipoOperacao: "REMEMBRAMENTO",
        idsImoveisOrigem: imoveisOrigem.map((im) => im.id),
        imoveisDestino: [{
          herdarDoPai: false,
          nomeReferencia:       nomeResultado.trim() || undefined,
          descricao:            descricao.trim() || undefined,
          areaTerrenoM2:        areaTerrenoM2  ? Number(areaTerrenoM2)  : undefined,
          areaConstruidaM2:     areaConstruida ? Number(areaConstruida) : undefined,
          inscricaoImobiliaria: inscricao.trim()  || undefined,
          matriculaRegistro:    matricula.trim()   || undefined,
        }],
        numeroProcesso: numeroProcesso.trim(),
        observacoes:    observacoes.trim() || undefined,
      });
      setSucesso(true);
      setTimeout(() => { onSucesso(); onFechar(); }, 1800);
    } catch (e: unknown) {
      setErro((e as Error)?.message ?? "Erro ao registrar remembramento.");
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
            Remembramento de Imóveis
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {imoveisOrigem.length} imóveis serão unificados em um novo imóvel.
          </p>
        </DialogHeader>

        {sucesso ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="font-semibold text-gray-900">Remembramento registrado!</p>
            <p className="text-sm text-gray-500">Novo imóvel criado como PRÉ-CADASTRO.</p>
          </div>
        ) : (
          <div className="space-y-6 py-2">

            {/* Origens */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <h3 className="font-medium text-gray-900 text-sm">Imóveis de origem (serão encerrados)</h3>
              <div className="space-y-1">
                {imoveisOrigem.map((im) => (
                  <div key={im.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs">✕</span>
                    <span className="font-mono text-xs text-gray-500">{im.codigoSigpim}</span>
                    <span>{im.nomeReferencia ?? "Sem nome"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dados da operação */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900 text-sm">Dados da operação</h3>
              <div>
                <Label className="text-xs text-gray-600">Número do processo *</Label>
                <Input value={numeroProcesso} onChange={(e) => setNumeroProcesso(e.target.value)}
                  placeholder="Ex: 001234/2026-SEMAD" className="mt-1" disabled={salvando} />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Observações</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Justificativa ou detalhes do remembramento..."
                  rows={2} className="mt-1 resize-none" disabled={salvando} />
              </div>
            </div>

            {/* Imóvel resultado */}
            <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/30 p-4">
              <h3 className="font-medium text-gray-900 text-sm">
                Imóvel resultante{" "}
                <span className="font-normal text-gray-500 text-xs">(nasce como PRÉ-CADASTRO)</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Nome de referência</Label>
                  <Input value={nomeResultado} onChange={(e) => setNomeResultado(e.target.value)}
                    placeholder="Nome do imóvel resultante" className="mt-1 text-sm" disabled={salvando} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Descrição</Label>
                  <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição do imóvel resultante..." rows={2}
                    className="mt-1 resize-none text-sm" disabled={salvando} />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Inscrição imobiliária</Label>
                  <Input value={inscricao} onChange={(e) => setInscricao(e.target.value)}
                    placeholder="Nova inscrição" className="mt-1 text-sm" disabled={salvando} />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Matrícula</Label>
                  <Input value={matricula} onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Matrícula no cartório" className="mt-1 text-sm" disabled={salvando} />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Área terreno (m²)</Label>
                  <Input type="number" value={areaTerrenoM2} onChange={(e) => setAreaTerreno(e.target.value)}
                    placeholder="m²" className="mt-1 text-sm" disabled={salvando} />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Área construída (m²)</Label>
                  <Input type="number" value={areaConstruida} onChange={(e) => setAreaConstruida(e.target.value)}
                    placeholder="m²" className="mt-1 text-sm" disabled={salvando} />
                </div>
              </div>
            </div>

            {/* Aviso */}
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Os <strong>{imoveisOrigem.length} imóveis de origem</strong> serão <strong>encerrados</strong>.
                O imóvel resultante nascerá como <strong>PRÉ-CADASTRO</strong> e deverá ser completado.
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
                : "Confirmar Remembramento"
              }
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
