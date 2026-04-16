import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Search, Download, Eye, FileText, Image, File,
  CheckCircle2, Clock, XCircle, RefreshCw, AlertCircle, X, Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import { documentosApi, type DocumentoResponse } from "../../api/documentos";
import { imoveisApi, type ImovelResponse } from "../../api/imoveis";
import { usePermissoes } from "../../hooks/usePermissoes";

// ─── helpers ─────────────────────────────────────────────────────────────────

const tipoIcon: Record<string, React.ReactNode> = {
  FOTO:      <Image    className="h-4 w-4 text-blue-500" />,
  PLANTA:    <FileText className="h-4 w-4 text-purple-500" />,
  MATRICULA: <FileText className="h-4 w-4 text-green-500" />,
  CONTRATO:  <FileText className="h-4 w-4 text-orange-500" />,
  LAUDO:     <FileText className="h-4 w-4 text-red-500" />,
  OUTRO:     <File     className="h-4 w-4 text-gray-400" />,
};

const valCfg: Record<string, { cls: string; icon: React.ReactNode }> = {
  VALIDADO:  { cls: "bg-green-100 text-green-800",  icon: <CheckCircle2 className="h-3 w-3" /> },
  PENDENTE:  { cls: "bg-yellow-100 text-yellow-800", icon: <Clock       className="h-3 w-3" /> },
  REJEITADO: { cls: "bg-red-100 text-red-800",       icon: <XCircle     className="h-3 w-3" /> },
  VENCIDO:   { cls: "bg-gray-100 text-gray-600",     icon: <Clock       className="h-3 w-3" /> },
};

const TIPOS_DOC = [
  { value: "FOTO",      label: "Fotografia" },
  { value: "PLANTA",    label: "Planta Baixa" },
  { value: "MATRICULA", label: "Matrícula do Imóvel" },
  { value: "CONTRATO",  label: "Contrato" },
  { value: "LAUDO",     label: "Laudo Técnico" },
  { value: "DECRETO",   label: "Decreto / Ato" },
  { value: "CERTIDAO",  label: "Certidão" },
  { value: "OUTRO",     label: "Outro" },
];

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Modal de upload ─────────────────────────────────────────────────────────

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSucesso: () => void;
}

function UploadModal({ open, onClose, onSucesso }: UploadModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [arquivo,       setArquivo]       = useState<File | null>(null);
  const [idImovel,      setIdImovel]      = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("OUTRO");
  const [descricao,     setDescricao]     = useState("");
  const [dataDocumento, setDataDocumento] = useState("");
  const [imoveis,       setImoveis]       = useState<ImovelResponse[]>([]);
  const [enviando,      setEnviando]      = useState(false);
  const [erro,          setErro]          = useState<string | null>(null);

  // Carrega lista de imóveis ao abrir
  useEffect(() => {
    if (!open) return;
    imoveisApi.listar(0, 200).then((r) => setImoveis(r.content)).catch(() => {});
  }, [open]);

  const resetar = () => {
    setArquivo(null); setIdImovel(""); setTipoDocumento("OUTRO");
    setDescricao(""); setDataDocumento(""); setErro(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFechar = () => { resetar(); onClose(); };

  const handleEnviar = async () => {
    if (!arquivo)    { setErro("Selecione um arquivo."); return; }
    if (!idImovel)   { setErro("Selecione o imóvel."); return; }
    if (!descricao.trim()) { setErro("Informe uma descrição."); return; }

    setEnviando(true);
    setErro(null);
    try {
      await documentosApi.upload(arquivo, {
        idImovel:      Number(idImovel),
        tipoDocumento,
        descricao:     descricao.trim(),
        dataDocumento: dataDocumento || undefined,
        imagemPrincipal: tipoDocumento === "FOTO",
      });
      resetar();
      onSucesso();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao enviar documento.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleFechar(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Anexar Documento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {erro && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Arquivo */}
          <div className="space-y-1.5">
            <Label>Arquivo <span className="text-red-500">*</span></Label>
            <div
              className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition hover:border-[#1351B4] hover:bg-blue-50/40"
              onClick={() => fileRef.current?.click()}
            >
              {arquivo ? (
                <div className="flex items-center gap-3">
                  <File className="h-6 w-6 text-[#1351B4]" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{arquivo.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(arquivo.size)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setArquivo(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-1" />
                  <p className="text-sm text-gray-500">Clique para selecionar o arquivo</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, PNG, TIFF, DOC — máx. 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp,.doc,.docx"
              onChange={(e) => { if (e.target.files?.[0]) setArquivo(e.target.files[0]); }}
            />
          </div>

          {/* Imóvel */}
          <div className="space-y-1.5">
            <Label>Imóvel <span className="text-red-500">*</span></Label>
            <Select value={idImovel} onValueChange={setIdImovel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o imóvel" />
              </SelectTrigger>
              <SelectContent>
                {imoveis.map((im) => (
                  <SelectItem key={im.id} value={String(im.id)}>
                    {im.codigoSigpim} — {im.nomeReferencia ?? "Sem nome"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo + Descrição */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo de documento</Label>
              <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_DOC.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data do documento</Label>
              <Input
                type="date"
                value={dataDocumento}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDataDocumento(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição <span className="text-red-500">*</span></Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Matrícula nº 45.231 — Cartório do 2º Ofício"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            className="bg-[#1351B4] hover:bg-[#0c3b8d]"
            onClick={handleEnviar}
            disabled={enviando}
          >
            {enviando
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
              : <><Upload className="mr-2 h-4 w-4" />Enviar</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export function ListaDocumentos() {
  const perm = usePermissoes();

  const [documentos,  setDocumentos]  = useState<DocumentoResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(0);
  const [search,      setSearch]      = useState("");
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const res = await documentosApi.listar(page, 20);
      setDocumentos(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar documentos.");
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleVisualizar = async (doc: DocumentoResponse) => {
    try {
      // Fetch with auth header, follow redirect to Supabase signed URL
      const blob = await documentosApi.download(doc.id);
      const url  = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { alert("Não foi possível abrir o documento."); }
  };

  const handleDownload = async (doc: DocumentoResponse) => {
    try {
      const blob = await documentosApi.download(doc.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const ext  = doc.tipoMime ? "." + doc.tipoMime.split("/").pop() : "";
      a.href = url;
      a.download = (doc.descricao || `documento-${doc.id}`) + ext;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Erro ao baixar documento."); }
  };

  const filtrados = documentos.filter((d) =>
    !search || [d.tipoDocumento, d.descricao, String(d.idImovel)]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">

      {/* Modal de upload */}
      <UploadModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSucesso={() => { setModalAberto(false); carregar(); }}
      />

      {/* Topo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Gestão de documentos e anexos dos imóveis
          {!loading && <span className="ml-2 text-gray-400">({total} no total)</span>}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {perm.canUploadDocumento && (
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={() => setModalAberto(true)}
            >
              <Upload className="mr-2 h-4 w-4" />Anexar Documento
            </Button>
          )}
        </div>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1"><p className="font-medium">Falha ao carregar documentos</p><p className="mt-1">{erro}</p></div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>Tentar novamente</Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por imóvel, tipo ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Imóvel</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs">Formato</TableHead>
                <TableHead className="text-xs">Tamanho</TableHead>
                <TableHead className="text-xs">Validação</TableHead>
                <TableHead className="text-right text-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />Carregando documentos...
                  </TableCell>
                </TableRow>
              )}
              {!loading && !erro && filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    {search ? "Nenhum documento encontrado." : "Nenhum documento cadastrado ainda."}
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtrados.map((d) => {
                const vc   = valCfg[d.statusValidacao] || valCfg.PENDENTE;
                const tipo = (d.tipoDocumento || "OUTRO").toUpperCase();
                return (
                  <TableRow key={d.id} className="hover:bg-gray-50/80">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tipoIcon[tipo] || tipoIcon.OUTRO}
                        <span className="text-xs text-gray-600">{d.tipoDocumento}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-[#1351B4]">#{d.idImovel}</TableCell>
                    <TableCell className="text-sm text-gray-700 max-w-xs truncate">{d.descricao}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {d.dataDocumento || d.criadoEm?.slice(0, 10) || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {d.tipoMime?.split("/")[1]?.toUpperCase() || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{formatBytes(d.tamanhoBytes)}</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit text-xs ${vc.cls}`} variant="secondary">
                        {vc.icon}{d.statusValidacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar"
                          onClick={() => handleVisualizar(d)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Baixar"
                          onClick={() => handleDownload(d)}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {!loading && total > 20 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-xs text-gray-500">Página {page + 1} — {total} no total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={(page + 1) * 20 >= total} onClick={() => setPage(p => p + 1)}>Próxima</Button>
            </div>
          </div>
        )}
        {!loading && (
          <div className="border-t px-6 py-3">
            <p className="text-xs text-gray-500">{filtrados.length} documento(s) exibido(s)</p>
          </div>
        )}
      </div>
    </div>
  );
}