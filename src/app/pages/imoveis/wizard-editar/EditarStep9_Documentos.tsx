// Etapa 9 — Documentos e Anexos (editar)
// Diferença do Step9 de cadastro: faz upload direto via documentosApi
// em vez de acumular em contexto, pois o imóvel já existe no banco.
import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { AlertBox } from "../../../components/layout/States";
import {
  Upload, FileText, Image, File, X, AlertTriangle, Loader2, CheckCircle2,
} from "lucide-react";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";
import { EditarWizardLayout } from "./EditarWizardLayout";
import { documentosApi } from "../../../api/documentos";

const MAX_MB = 100;

const TIPOS = [
  { value: "MATRICULA", label: "Matrícula do Imóvel" },
  { value: "FOTO",      label: "Fotografia" },
  { value: "PLANTA",    label: "Planta Baixa" },
  { value: "CONTRATO",  label: "Contrato" },
  { value: "LAUDO",     label: "Laudo Técnico" },
  { value: "DECRETO",   label: "Decreto / Ato" },
  { value: "CERTIDAO",  label: "Certidão" },
  { value: "OUTRO",     label: "Outro" },
];

function formatarTamanho(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function inferirTipo(file: File): string {
  const n = file.name.toLowerCase();
  if (n.includes("matricula") || n.includes("matrícula")) return "MATRICULA";
  if (n.includes("planta") || n.includes("croqui")) return "PLANTA";
  if (n.includes("contrato")) return "CONTRATO";
  if (n.includes("laudo")) return "LAUDO";
  if (file.type.startsWith("image/")) return "FOTO";
  if (n.includes("certidao") || n.includes("certidão")) return "CERTIDAO";
  return "OUTRO";
}

function aplicarMascara(valor: string): string {
  const n = valor.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function dataValida(mascara: string): boolean {
  const n = mascara.replace(/\D/g, "");
  if (n.length !== 8) return false;
  const dia = parseInt(n.slice(0, 2), 10);
  const mes = parseInt(n.slice(2, 4), 10);
  const ano = parseInt(n.slice(4, 8), 10);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31 && ano >= 1500 && ano <= new Date().getFullYear();
}

function mascaraParaIso(mascara: string): string {
  const n = mascara.replace(/\D/g, "");
  if (n.length < 8) return "";
  return `${n.slice(4, 8)}-${n.slice(2, 4)}-${n.slice(0, 2)}`;
}

interface ArquivoLocal {
  id: number;
  file: File;
  tipo: string;
  descricao: string;
  dataDocumento: string;
  status: "pendente" | "enviando" | "enviado" | "erro";
  erroMsg?: string;
}

let _nextId = 1;

export function EditarStep9() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { imovel, salvar, salvando, erro } = useEditarImovel();

  const [arquivos, setArquivos] = useState<ArquivoLocal[]>([]);
  const [dragging, setDragging] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mascaras, setMascaras] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const getMascara = (id: number) => mascaras[id] ?? "";
  const setMascara = (id: number, valor: string) =>
    setMascaras((prev) => ({ ...prev, [id]: valor }));

  const adicionar = (files: FileList | File[]) => {
    const novos: ArquivoLocal[] = Array.from(files)
      .filter((f) => f.size <= MAX_MB * 1024 * 1024)
      .map((file) => ({
        id: _nextId++,
        file,
        tipo: inferirTipo(file),
        descricao: "",
        dataDocumento: "",
        status: "pendente" as const,
      }));
    setArquivos((prev) => [...prev, ...novos]);
  };

  const remover = (id: number) => {
    setArquivos((prev) => prev.filter((a) => a.id !== id));
    setMascaras((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  const atualizar = (id: number, campo: "tipo" | "descricao" | "dataDocumento", valor: string) =>
    setArquivos((prev) => prev.map((a) => a.id === id ? { ...a, [campo]: valor } : a));

  const handleDataChange = (id: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nova = aplicarMascara(e.target.value);
    setMascara(id, nova);
    atualizar(id, "dataDocumento", dataValida(nova) ? mascaraParaIso(nova) : "");
  };

  const handleSalvar = async () => {
    if (!imovel) return;

    // 1. Salva os dados do imóvel (etapas 1-8) via contexto
    await new Promise<void>((resolve, reject) => {
      salvar(() => resolve()).catch(reject);
    });

    // 2. Faz upload dos arquivos pendentes diretamente para o imóvel existente
    if (arquivos.some((a) => a.status === "pendente")) {
      setEnviando(true);
      for (const arq of arquivos.filter((a) => a.status === "pendente")) {
        setArquivos((prev) => prev.map((a) => a.id === arq.id ? { ...a, status: "enviando" } : a));
        try {
          await documentosApi.upload(arq.file, {
            idImovel:        imovel.id,
            tipoDocumento:   arq.tipo || "OUTRO",
            descricao:       arq.descricao || arq.file.name,
            dataDocumento:   arq.dataDocumento || undefined,
            imagemPrincipal: arq.tipo === "FOTO",
          });
          setArquivos((prev) => prev.map((a) => a.id === arq.id ? { ...a, status: "enviado" } : a));
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Erro ao enviar arquivo";
          setArquivos((prev) => prev.map((a) => a.id === arq.id ? { ...a, status: "erro", erroMsg: msg } : a));
        }
      }
      setEnviando(false);
    }

    navigate(`/dashboard/imoveis/${id}`);
  };

  return (
    <EditarWizardLayout currentStep={9} onNext={handleSalvar} salvando={salvando || enviando}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documentos e Anexos</h3>
          <p className="text-sm text-gray-500 mt-1">
            Adicione novos arquivos ao imóvel. Os documentos existentes ficam disponíveis na aba Documentos.
          </p>
        </div>

        {erro && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <AlertBox variant="info">
          <strong>Formatos aceitos:</strong> PDF, JPG, PNG, TIFF, WEBP, DOC, DOCX
          <span className="mx-2">·</span>
          <strong>Máximo:</strong> {MAX_MB} MB por arquivo
        </AlertBox>

        {/* Zona de drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) adicionar(e.dataTransfer.files); }}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-10 text-center cursor-pointer transition-all ${
            dragging ? "border-[#1351B4] bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-[#1351B4] hover:bg-blue-50/50"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp,.doc,.docx"
            className="sr-only"
            onChange={(e) => { if (e.target.files) adicionar(e.target.files); e.target.value = ""; }}
          />
          <Upload className={`h-10 w-10 mb-3 ${dragging ? "text-[#1351B4]" : "text-gray-400"}`} />
          <p className="text-sm font-medium text-gray-700">
            {dragging ? "Solte os arquivos aqui" : "Clique para selecionar ou arraste os arquivos"}
          </p>
          <p className="mt-1 text-xs text-gray-400">PDF, JPG, PNG, TIFF, DOC — até {MAX_MB} MB cada</p>
        </div>

        {/* Lista */}
        {arquivos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{arquivos.length} arquivo(s) para enviar</span>
              <Button
                variant="ghost" size="sm"
                onClick={() => { setArquivos([]); setMascaras({}); }}
                className="text-xs text-red-500 hover:text-red-700"
                disabled={enviando}
              >
                Remover todos
              </Button>
            </div>
            {arquivos.map((arq) => {
              const mascara = getMascara(arq.id);
              const erroData = mascara.replace(/\D/g, "").length === 8 && !dataValida(mascara);
              return (
                <div
                  key={arq.id}
                  className={`rounded-xl border p-4 ${
                    arq.status === "enviado" ? "border-green-200 bg-green-50" :
                    arq.status === "erro"    ? "border-red-200 bg-red-50"    :
                    "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      {arq.file.type.startsWith("image/") ? (
                        <Image className="h-5 w-5 text-blue-500" />
                      ) : arq.file.type === "application/pdf" ? (
                        <FileText className="h-5 w-5 text-red-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{arq.file.name}</p>
                      <p className="text-xs text-gray-400">{formatarTamanho(arq.file.size)}</p>
                      {arq.status === "enviando" && (
                        <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Enviando...
                        </p>
                      )}
                      {arq.status === "enviado" && (
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="h-3 w-3" /> Enviado com sucesso
                        </p>
                      )}
                      {arq.status === "erro" && (
                        <p className="text-xs text-red-600 mt-1">{arq.erroMsg}</p>
                      )}
                    </div>
                    {arq.status !== "enviando" && arq.status !== "enviado" && (
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => remover(arq.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {arq.status === "pendente" && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Tipo</Label>
                        <Select value={arq.tipo} onValueChange={(v) => atualizar(arq.id, "tipo", v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TIPOS.map((t) => (
                              <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Descrição</Label>
                        <Input
                          className="h-8 text-xs"
                          value={arq.descricao}
                          onChange={(e) => atualizar(arq.id, "descricao", e.target.value)}
                          placeholder="Ex: Matrícula nº 45.231"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Data do documento</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          className={`h-8 text-xs ${erroData ? "border-red-300" : ""}`}
                          placeholder="dd/mm/aaaa"
                          maxLength={10}
                          value={mascara}
                          onChange={handleDataChange(arq.id)}
                        />
                        {erroData && <p className="text-xs text-red-500">Data inválida.</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {arquivos.length === 0 && (
          <AlertBox variant="info">
            Nenhum arquivo selecionado. Você pode pular esta etapa — os documentos existentes
            continuam disponíveis na aba Documentos do imóvel.
          </AlertBox>
        )}

        {(salvando || enviando) && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>{salvando ? "Salvando alterações..." : "Enviando arquivos..."}</span>
          </div>
        )}
      </div>
    </EditarWizardLayout>
  );
}