import React, { useState, useRef } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { AlertBox } from "../../../components/layout/States";
import {
  Upload, FileText, Image, File, FileArchive,
  X, CheckCircle2, AlertTriangle, Plus, Eye,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoDocumento =
  | "MATRICULA"
  | "FOTO"
  | "PLANTA"
  | "CONTRATO"
  | "LAUDO"
  | "DECRETO"
  | "CERTIDAO"
  | "OUTRO";

interface Arquivo {
  id: number;
  file: File;
  tipo: TipoDocumento;
  descricao: string;
  tamanhoFormatado: string;
  mimeGroup: "pdf" | "image" | "doc" | "other";
  status: "ok" | "grande" | "invalido";
  dataDocumento: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_MB = 10;

function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeGroup(mime: string): Arquivo["mimeGroup"] {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("word") || mime.includes("document") || mime.includes("text")) return "doc";
  return "other";
}

function statusArquivo(file: File): Arquivo["status"] {
  const aceitos = [
    "application/pdf",
    "image/jpeg", "image/png", "image/tiff", "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!aceitos.includes(file.type)) return "invalido";
  if (file.size > MAX_MB * 1024 * 1024) return "grande";
  return "ok";
}

const TIPOS_DOCUMENTO: { value: TipoDocumento; label: string }[] = [
  { value: "MATRICULA",  label: "Matrícula do Imóvel" },
  { value: "FOTO",       label: "Fotografia" },
  { value: "PLANTA",     label: "Planta Baixa" },
  { value: "CONTRATO",   label: "Contrato" },
  { value: "LAUDO",      label: "Laudo Técnico" },
  { value: "DECRETO",    label: "Decreto / Ato" },
  { value: "CERTIDAO",   label: "Certidão" },
  { value: "OUTRO",      label: "Outro" },
];

function IconeArquivo({ grupo }: { grupo: Arquivo["mimeGroup"] }) {
  if (grupo === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (grupo === "image") return <Image className="h-5 w-5 text-blue-500" />;
  if (grupo === "doc") return <FileText className="h-5 w-5 text-blue-700" />;
  return <File className="h-5 w-5 text-gray-400" />;
}

let _fileId = 1;

// ─── Componente ───────────────────────────────────────────────────────────────

export function CadastroImovelStep6() {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Processamento de arquivos ────────────────────────────────────────────

  const processarArquivos = (files: FileList | File[]) => {
    const novos: Arquivo[] = Array.from(files).map(file => ({
      id: _fileId++,
      file,
      tipo: inferirTipo(file),
      descricao: "",
      tamanhoFormatado: formatarTamanho(file.size),
      mimeGroup: mimeGroup(file.type),
      status: statusArquivo(file),
      dataDocumento: "",
    }));
    setArquivos(prev => [...prev, ...novos]);
  };

  const inferirTipo = (file: File): TipoDocumento => {
    const n = file.name.toLowerCase();
    if (n.includes("matricula") || n.includes("matrícula")) return "MATRICULA";
    if (n.includes("planta") || n.includes("croqui")) return "PLANTA";
    if (n.includes("contrato")) return "CONTRATO";
    if (n.includes("laudo")) return "LAUDO";
    if (n.includes("foto") || file.type.startsWith("image/")) return "FOTO";
    if (n.includes("certidao") || n.includes("certidão")) return "CERTIDAO";
    return "OUTRO";
  };

  const remover = (id: number) => setArquivos(prev => prev.filter(a => a.id !== id));

  const atualizarTipo = (id: number, tipo: TipoDocumento) =>
    setArquivos(prev => prev.map(a => a.id === id ? { ...a, tipo } : a));

  const atualizarDescricao = (id: number, descricao: string) =>
    setArquivos(prev => prev.map(a => a.id === id ? { ...a, descricao } : a));

  const atualizarData = (id: number, dataDocumento: string) =>
    setArquivos(prev => prev.map(a => a.id === id ? { ...a, dataDocumento } : a));

  // ── Drag and drop ─────────────────────────────────────────────────────────

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) processarArquivos(e.dataTransfer.files);
  };

  // ── Contadores ────────────────────────────────────────────────────────────

  const ok = arquivos.filter(a => a.status === "ok").length;
  const erros = arquivos.filter(a => a.status !== "ok").length;

  return (
    <WizardLayout currentStep={6}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documentos e Anexos</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload de fotos, plantas, contratos e demais evidências do imóvel
          </p>
        </div>

        <AlertBox variant="info">
          <p className="text-sm">
            <strong>Formatos aceitos:</strong> PDF, JPG, PNG, TIFF, WEBP, DOC, DOCX
            <span className="mx-2">·</span>
            <strong>Tamanho máximo:</strong> {MAX_MB} MB por arquivo
          </p>
        </AlertBox>

        {/* Zona de drop */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-10 text-center transition-all cursor-pointer ${
            dragging
              ? "border-[#1351B4] bg-blue-50 scale-[1.01]"
              : "border-gray-300 bg-gray-50 hover:border-[#1351B4] hover:bg-blue-50/50"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp,.doc,.docx"
            className="sr-only"
            onChange={e => { if (e.target.files) processarArquivos(e.target.files); e.target.value = ""; }}
          />
          <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-colors ${dragging ? "bg-[#1351B4]/10" : "bg-white"}`}>
            <Upload className={`h-7 w-7 ${dragging ? "text-[#1351B4]" : "text-gray-400"}`} />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {dragging ? "Solte os arquivos aqui" : "Clique para selecionar ou arraste os arquivos"}
          </p>
          <p className="mt-1 text-xs text-gray-400">PDF, JPG, PNG, TIFF, WEBP, DOC, DOCX — até {MAX_MB} MB cada</p>
          <Button type="button" variant="outline" size="sm" className="mt-4 border-[#1351B4] text-[#1351B4] hover:bg-blue-50 pointer-events-none">
            <Plus className="mr-1.5 h-3.5 w-3.5" />Selecionar arquivos
          </Button>
        </div>

        {/* Resumo */}
        {arquivos.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">{arquivos.length} {arquivos.length === 1 ? "arquivo" : "arquivos"}</span>
            {ok > 0 && (
              <span className="flex items-center gap-1 text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />{ok} {ok === 1 ? "válido" : "válidos"}
              </span>
            )}
            {erros > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />{erros} com {erros === 1 ? "problema" : "problemas"}
              </span>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => setArquivos([])} className="ml-auto text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
              Remover todos
            </Button>
          </div>
        )}

        {/* Lista de arquivos */}
        {arquivos.length > 0 && (
          <div className="space-y-3">
            {arquivos.map(arq => (
              <div
                key={arq.id}
                className={`rounded-xl border bg-white p-4 transition-colors ${
                  arq.status === "ok"
                    ? "border-gray-200"
                    : arq.status === "grande"
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-red-200 bg-red-50/30"
                }`}
              >
                {/* Linha superior: ícone + nome + status + remover */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    <IconeArquivo grupo={arq.mimeGroup} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {arq.file.name}
                      </p>
                      <span className="text-xs text-gray-400">{arq.tamanhoFormatado}</span>
                      {arq.status === "ok" && (
                        <Badge className="bg-green-100 text-green-800 text-xs" variant="secondary">
                          <CheckCircle2 className="mr-1 h-2.5 w-2.5" />Válido
                        </Badge>
                      )}
                      {arq.status === "grande" && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs" variant="secondary">
                          <AlertTriangle className="mr-1 h-2.5 w-2.5" />Arquivo muito grande
                        </Badge>
                      )}
                      {arq.status === "invalido" && (
                        <Badge className="bg-red-100 text-red-800 text-xs" variant="secondary">
                          <AlertTriangle className="mr-1 h-2.5 w-2.5" />Formato não aceito
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remover(arq.id)} className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Linha inferior: tipo + descrição + data */}
                {arq.status === "ok" && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Tipo de documento</Label>
                      <Select value={arq.tipo} onValueChange={v => atualizarTipo(arq.id, v as TipoDocumento)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_DOCUMENTO.map(t => (
                            <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Descrição / referência</Label>
                      <Input
                        className="h-8 text-xs"
                        value={arq.descricao}
                        onChange={e => atualizarDescricao(arq.id, e.target.value)}
                        placeholder="Ex: Matrícula nº 45.231"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Data do documento</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={arq.dataDocumento}
                        onChange={e => atualizarData(arq.id, e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {arquivos.length === 0 && (
          <AlertBox variant="warning">
            Nenhum arquivo anexado. Recomendamos incluir ao menos uma foto da fachada e, se disponível, a matrícula do imóvel. Os documentos podem ser complementados posteriormente.
          </AlertBox>
        )}

        {/* Orientações */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Orientações para upload</p>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• Fotos devem mostrar diferentes ângulos — fachada, interior, fundos e laterais</li>
            <li>• Plantas e peças técnicas devem estar legíveis (PDF preferencial)</li>
            <li>• Nomeie os arquivos de forma descritiva antes de anexar</li>
            <li>• Documentos sensíveis são armazenados com controle de acesso por perfil</li>
            <li>• O hash SHA-256 de cada arquivo é registrado automaticamente para integridade</li>
          </ul>
        </div>
      </div>
    </WizardLayout>
  );
}
