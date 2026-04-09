import React, { useState, useEffect, useCallback } from "react";
import { Upload, Search, Download, Eye, FileText, Image, File,
         CheckCircle2, Clock, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { documentosApi, type DocumentoResponse } from "../../api/documentos";

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
  PENDENTE:  { cls: "bg-yellow-100 text-yellow-800", icon: <Clock        className="h-3 w-3" /> },
  REJEITADO: { cls: "bg-red-100 text-red-800",       icon: <XCircle      className="h-3 w-3" /> },
  VENCIDO:   { cls: "bg-gray-100 text-gray-600",     icon: <Clock        className="h-3 w-3" /> },
};

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ListaDocumentos() {
  const [documentos, setDocumentos] = useState<DocumentoResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState<string | null>(null);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [search, setSearch]         = useState("");

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

  const handleDownload = async (doc: DocumentoResponse) => {
    try {
      const blob = await documentosApi.download(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.descricao || `documento-${doc.id}`;
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Gestão de documentos e anexos dos imóveis
          {!loading && <span className="ml-2 text-gray-400">({total} no total)</span>}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
            <Upload className="mr-2 h-4 w-4" />Anexar Documento
          </Button>
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
        <Input placeholder="Buscar por imóvel, tipo ou descrição..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                const vc = valCfg[d.statusValidacao] || valCfg.PENDENTE;
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Visualizar">
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
