import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, AlertCircle, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  ocupacoesApi, type OcupacaoResponse, type OcupacaoRequest,
  type StatusOcupacao, type NivelOcupacao,
} from "../../api/ocupacoes";
import { imoveisApi, type ImovelResponse } from "../../api/imoveis";
import { orgaosApi, type OrgaoResponse } from "../../api/usuarios";

const statusCfg: Record<string, string> = {
  OCUPADO:          "bg-green-100 text-green-800",
  DESOCUPADO:       "bg-gray-100 text-gray-600",
  DESCONHECIDO:     "bg-yellow-100 text-yellow-800",
  NAO_REGULARIZADO: "bg-red-100 text-red-800",
};
const STATUS_LABEL: Record<string, string> = {
  OCUPADO: "Ocupado", DESOCUPADO: "Desocupado",
  DESCONHECIDO: "Desconhecido", NAO_REGULARIZADO: "Não regularizado",
};
const NIVEL_LABEL: Record<string, string> = {
  TOTAL: "Total", PARCIAL: "Parcial", COMPARTILHADO: "Compartilhado",
};

interface FormState {
  idImovel: string;
  statusOcupacao: StatusOcupacao | "";
  nivelOcupacao: NivelOcupacao | "";
  idOrgaoOcupante: string;
  nomeOcupanteExterno: string;
  nomeResponsavelLocal: string;
  contatoResponsavel: string;
  destinacaoFinalidade: string;
  dataInicio: string;
  dataFimPrevista: string;
  observacoes: string;
}

const formVazio: FormState = {
  idImovel: "", statusOcupacao: "", nivelOcupacao: "",
  idOrgaoOcupante: "", nomeOcupanteExterno: "",
  nomeResponsavelLocal: "", contatoResponsavel: "",
  destinacaoFinalidade: "", dataInicio: "", dataFimPrevista: "",
  observacoes: "",
};

export function ListaOcupacoes() {
  const [ocupacoes, setOcupacoes] = useState<OcupacaoResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState<string | null>(null);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(0);
  const [search,    setSearch]    = useState("");

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [form,        setForm]        = useState<FormState>(formVazio);
  const [formErro,    setFormErro]    = useState<string | null>(null);
  const [salvando,    setSalvando]    = useState(false);

  // Dados para o formulário
  const [imoveis,   setImoveis]   = useState<ImovelResponse[]>([]);
  const [orgaos,    setOrgaos]    = useState<OrgaoResponse[]>([]);
  const [carregandoForm, setCarregandoForm] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null);
    try {
      const res = await ocupacoesApi.listar(page, 20);
      setOcupacoes(res.content);
      setTotal(res.totalElements);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar ocupações.");
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirModal = async () => {
    setForm(formVazio);
    setFormErro(null);
    setModalAberto(true);
    setCarregandoForm(true);
    try {
      const [imPage, ogs] = await Promise.all([
        imoveisApi.listar(0, 100),
        orgaosApi.listarAtivos(),
      ]);
      setImoveis(imPage.content);
      setOrgaos(ogs);
    } catch {
      setFormErro("Não foi possível carregar os dados necessários.");
    } finally {
      setCarregandoForm(false);
    }
  };

  const handleSalvar = async () => {
    setFormErro(null);
    if (!form.idImovel)        { setFormErro("Selecione o imóvel.");          return; }
    if (!form.statusOcupacao)  { setFormErro("Selecione o status de ocupação."); return; }

    const req: OcupacaoRequest = {
      idImovel:             Number(form.idImovel),
      statusOcupacao:       form.statusOcupacao as StatusOcupacao,
      nivelOcupacao:        (form.nivelOcupacao as NivelOcupacao) || undefined,
      idOrgaoOcupante:      form.idOrgaoOcupante ? Number(form.idOrgaoOcupante) : undefined,
      nomeOcupanteExterno:  form.nomeOcupanteExterno  || undefined,
      nomeResponsavelLocal: form.nomeResponsavelLocal || undefined,
      contatoResponsavel:   form.contatoResponsavel   || undefined,
      destinacaoFinalidade: form.destinacaoFinalidade || undefined,
      dataInicio:           form.dataInicio           || undefined,
      dataFimPrevista:      form.dataFimPrevista       || undefined,
      observacoes:          form.observacoes           || undefined,
      vigente:              true,
    };

    setSalvando(true);
    try {
      await ocupacoesApi.criar(req);
      setModalAberto(false);
      carregar();
    } catch (e: unknown) {
      setFormErro(e instanceof Error ? e.message : "Erro ao salvar ocupação.");
    } finally {
      setSalvando(false);
    }
  };

  const filtradas = ocupacoes.filter((o) =>
    !search || [String(o.idImovel), o.statusOcupacao,
      o.nomeOcupanteExterno ?? "", o.nomeResponsavelLocal ?? ""]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const ocupados    = ocupacoes.filter(o => o.statusOcupacao === "OCUPADO").length;
  const desocupados = ocupacoes.filter(o => o.statusOcupacao === "DESOCUPADO").length;

  const imovelLabel = (id: number) => {
    const im = imoveis.find(i => i.id === id);
    return im ? `${im.codigoSigpim}${im.nomeReferencia ? ` — ${im.nomeReferencia}` : ""}` : `#${id}`;
  };

  return (
    <div className="space-y-5">

      {/* Modal Nova Ocupação */}
      <Dialog open={modalAberto} onOpenChange={(v) => !v && setModalAberto(false)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Ocupação</DialogTitle>
          </DialogHeader>

          {carregandoForm ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {formErro && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{formErro}</span>
                </div>
              )}

              {/* Imóvel */}
              <div className="space-y-2">
                <Label>Imóvel <span className="text-red-500">*</span></Label>
                <Select
                  value={form.idImovel}
                  onValueChange={(v) => setForm((f) => ({ ...f, idImovel: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    {imoveis.map((im) => (
                      <SelectItem key={im.id} value={String(im.id)}>
                        {im.codigoSigpim}{im.nomeReferencia ? ` — ${im.nomeReferencia}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status + Nível */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status de Ocupação <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.statusOcupacao}
                    onValueChange={(v) => setForm((f) => ({ ...f, statusOcupacao: v as StatusOcupacao }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OCUPADO">Ocupado</SelectItem>
                      <SelectItem value="DESOCUPADO">Desocupado</SelectItem>
                      <SelectItem value="NAO_REGULARIZADO">Não regularizado</SelectItem>
                      <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nível de Ocupação</Label>
                  <Select
                    value={form.nivelOcupacao}
                    onValueChange={(v) => setForm((f) => ({ ...f, nivelOcupacao: v as NivelOcupacao }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOTAL">Total</SelectItem>
                      <SelectItem value="PARCIAL">Parcial</SelectItem>
                      <SelectItem value="COMPARTILHADO">Compartilhado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Órgão ocupante */}
              <div className="space-y-2">
                <Label>Órgão Ocupante (interno)</Label>
                <Select
                  value={form.idOrgaoOcupante}
                  onValueChange={(v) => setForm((f) => ({ ...f, idOrgaoOcupante: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {orgaos.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.sigla} – {o.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ocupante externo */}
              <div className="space-y-2">
                <Label>Ocupante Externo</Label>
                <Input
                  placeholder="Nome da pessoa ou entidade externa (se aplicável)"
                  value={form.nomeOcupanteExterno}
                  onChange={(e) => setForm((f) => ({ ...f, nomeOcupanteExterno: e.target.value }))}
                />
              </div>

              {/* Responsável + Contato */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Responsável Local</Label>
                  <Input
                    placeholder="Nome do responsável"
                    value={form.nomeResponsavelLocal}
                    onChange={(e) => setForm((f) => ({ ...f, nomeResponsavelLocal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input
                    placeholder="Telefone ou e-mail"
                    value={form.contatoResponsavel}
                    onChange={(e) => setForm((f) => ({ ...f, contatoResponsavel: e.target.value }))}
                  />
                </div>
              </div>

              {/* Finalidade */}
              <div className="space-y-2">
                <Label>Destinação / Finalidade</Label>
                <Input
                  placeholder="Ex: Escola municipal, Unidade de saúde, Depósito..."
                  value={form.destinacaoFinalidade}
                  onChange={(e) => setForm((f) => ({ ...f, destinacaoFinalidade: e.target.value }))}
                />
              </div>

              {/* Datas */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input type="date" value={form.dataInicio}
                    onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Previsão de Término</Label>
                  <Input type="date" value={form.dataFimPrevista}
                    onChange={(e) => setForm((f) => ({ ...f, dataFimPrevista: e.target.value }))} />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Informações complementares, condicionantes..."
                  value={form.observacoes}
                  onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={handleSalvar}
              disabled={salvando || carregandoForm}
            >
              {salvando
                ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                : "Registrar Ocupação"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Histórico e situação atual de ocupação dos imóveis
          {!loading && <span className="ml-2 text-gray-400">({total} no total)</span>}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={carregar} disabled={loading} title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]" onClick={abrirModal}>
            <Plus className="mr-2 h-4 w-4" />Nova Ocupação
          </Button>
        </div>
      </div>

      {erro && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1"><p className="font-medium">Falha ao carregar ocupações</p><p className="mt-1">{erro}</p></div>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={carregar}>Tentar novamente</Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Buscar por imóvel, status ou responsável..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {!loading && !erro && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Ocupados",    value: ocupados,    color: "text-green-600", bg: "bg-green-50" },
            { label: "Desocupados", value: desocupados, color: "text-gray-600",  bg: "bg-gray-50"  },
            { label: "Total",       value: total,       color: "text-[#1351B4]", bg: "bg-blue-50"  },
          ].map((s) => (
            <Card key={s.label} className={`p-4 ${s.bg}`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">Imóvel</TableHead>
                <TableHead className="text-xs">Ocupante</TableHead>
                <TableHead className="text-xs">Responsável</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Nível</TableHead>
                <TableHead className="text-xs">Finalidade</TableHead>
                <TableHead className="text-xs">Início</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />Carregando ocupações...
                  </TableCell>
                </TableRow>
              )}
              {!loading && !erro && filtradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-400">
                    {search ? "Nenhuma ocupação encontrada." : "Nenhuma ocupação cadastrada ainda."}
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtradas.map((o) => (
                <TableRow key={o.id} className="hover:bg-gray-50/80">
                  <TableCell className="font-mono text-xs font-semibold text-[#1351B4]">
                    {imovelLabel(o.idImovel)}
                  </TableCell>
                  <TableCell className="text-sm">{o.nomeOcupanteExterno || "—"}</TableCell>
                  <TableCell className="text-sm">{o.nomeResponsavelLocal || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${statusCfg[o.statusOcupacao] || ""}`}>
                      {STATUS_LABEL[o.statusOcupacao] || o.statusOcupacao}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {o.nivelOcupacao ? NIVEL_LABEL[o.nivelOcupacao] : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">{o.destinacaoFinalidade || "—"}</TableCell>
                  <TableCell className="text-xs text-gray-600">{o.dataInicio || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {!loading && total > 20 && (
          <div className="flex items-center justify-between border-t px-6 py-3">
            <p className="text-xs text-gray-500">Página {page + 1} — {total} no total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0}
                onClick={() => setPage(p => p - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={(page + 1) * 20 >= total}
                onClick={() => setPage(p => p + 1)}>Próxima</Button>
            </div>
          </div>
        )}
        {!loading && (
          <div className="border-t px-6 py-3">
            <p className="text-xs text-gray-500">{filtradas.length} ocupação(ões) exibida(s)</p>
          </div>
        )}
      </div>
    </div>
  );
}