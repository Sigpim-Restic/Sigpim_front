import React, { useState, useRef } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { AlertBox } from "../../../components/layout/States";
import { Upload, FileText, Image, File, X, AlertTriangle, Loader2 } from "lucide-react";
import { useCadastroImovel, type ArquivoAnexo } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";

const MAX_MB = 10;

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

// ── Máscara de data dd/mm/aaaa ────────────────────────────────────────────────

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

// dd/mm/aaaa → aaaa-mm-dd (ISO para envio ao backend)
function mascaraParaIso(mascara: string): string {
  const n = mascara.replace(/\D/g, "");
  if (n.length < 8) return "";
  return `${n.slice(4, 8)}-${n.slice(2, 4)}-${n.slice(0, 2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────

let _id = 1;

export function CadastroImovelStep9() {
  const { arquivos, setArquivos, finalizar, salvando, erro } = useCadastroImovel();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estado local para as máscaras de data — um por arquivo (keyed por id)
  const [mascaras, setMascaras] = useState<Record<number, string>>({});

  const getMascara = (id: number) => mascaras[id] ?? "";

  const setMascara = (id: number, valor: string) =>
    setMascaras((prev) => ({ ...prev, [id]: valor }));

  const adicionar = (files: FileList | File[]) => {
    const novos: ArquivoAnexo[] = Array.from(files)
      .filter((f) => f.size <= MAX_MB * 1024 * 1024)
      .map((file) => ({
        id: _id++,
        file,
        tipo: inferirTipo(file),
        descricao: "",
        dataDocumento: "",
      }));
    setArquivos([...arquivos, ...novos]);
  };

  const remover = (id: number) => {
    setArquivos(arquivos.filter((a) => a.id !== id));
    setMascaras((prev) => { const next = { ...prev }; delete next[id]; return next; });
  };

  const atualizar = (id: number, campo: "tipo" | "descricao" | "dataDocumento", valor: string) =>
    setArquivos(arquivos.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)));

  const handleDataChange = (id: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nova = aplicarMascara(e.target.value);
    setMascara(id, nova);
    atualizar(id, "dataDocumento", dataValida(nova) ? mascaraParaIso(nova) : "");
  };

  const handleFinalizar = () => {
    finalizar(() => navigate("/dashboard/imoveis/sucesso"));
  };

  return (
    <WizardLayout currentStep={9} onNext={handleFinalizar} salvando={salvando}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documentos e Anexos</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload de fotos, plantas, contratos e demais evidências do imóvel
          </p>
        </div>

        {erro && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <AlertBox variant="info">
          <p className="text-sm">
            <strong>Formatos aceitos:</strong> PDF, JPG, PNG, TIFF, WEBP, DOC, DOCX
            <span className="mx-2">·</span>
            <strong>Máximo:</strong> {MAX_MB} MB por arquivo
          </p>
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

        {/* Lista de arquivos */}
        {arquivos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{arquivos.length} arquivo(s) anexado(s)</span>
              <Button variant="ghost" size="sm" onClick={() => { setArquivos([]); setMascaras({}); }} className="text-xs text-red-500 hover:text-red-700">
                Remover todos
              </Button>
            </div>
            {arquivos.map((arq) => {
              const mascara = getMascara(arq.id);
              const erroData = mascara.replace(/\D/g, "").length === 8 && !dataValida(mascara);
              return (
                <div key={arq.id} className="rounded-xl border border-gray-200 bg-white p-4">
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
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remover(arq.id)} className="h-8 w-8 text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Tipo de documento</Label>
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
                </div>
              );
            })}
          </div>
        )}

        {arquivos.length === 0 && (
          <AlertBox variant="warning">
            Nenhum arquivo anexado. Os documentos podem ser complementados posteriormente.
          </AlertBox>
        )}

        {salvando && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>Salvando imóvel no sistema... aguarde.</span>
          </div>
        )}
      </div>
    </WizardLayout>
  );
}