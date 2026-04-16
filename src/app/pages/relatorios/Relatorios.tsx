import React, { useState } from "react";
import {
  FileText, Building2, ClipboardList, History,
  Download, Loader2, CheckCircle2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { imoveisApi, type ImovelResponse } from "../../api/imoveis";
import { ocupacoesApi, type OcupacaoResponse } from "../../api/ocupacoes";
import { api } from "../../api/client";

// ─── tipos ────────────────────────────────────────────────────────────────────

interface FiltrosRelatorio {
  periodo_ini: string;
  periodo_fim: string;
  orgao: string;
  status: string;
}

interface RelatorioGerado {
  tipo: string;
  geradoEm: string;
  totalRegistros: number;
  nomeArquivo: string;
}

const tiposRelatorio = [
  {
    id: "LISTA_IMOVEIS",
    title: "Lista de Imóveis",
    desc: "Listagem filtrada do acervo patrimonial com status, tipo e órgão gestor.",
    icon: Building2,
    cor: "bg-green-50 text-green-600",
  },
  {
    id: "RELATORIO_OCUPACAO",
    title: "Relatório de Ocupação",
    desc: "Situação de uso e responsáveis dos imóveis por secretaria e período.",
    icon: ClipboardList,
    cor: "bg-purple-50 text-purple-600",
  },
  {
    id: "HISTORICO_AUDITORIA",
    title: "Histórico de Auditoria",
    desc: "Log de alterações realizadas por usuário, período e entidade.",
    icon: History,
    cor: "bg-orange-50 text-orange-600",
  },
  {
    id: "FICHA_IMOVEL",
    title: "Ficha do Imóvel",
    desc: "Relatório completo de um imóvel com localização, dados físicos, ocupação e documentos.",
    icon: Building2,
    cor: "bg-blue-50 text-[#1351B4]",
  },
];

// ─── helpers de exportação ────────────────────────────────────────────────────

function baixarJSON(dados: object, nome: string) {
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function baixarCSV(linhas: string[][], nome: string) {
  const csv  = linhas.map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM para Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function agora() {
  return new Date().toLocaleString("pt-BR");
}

function nomeArquivo(tipo: string, ext: string) {
  const ts = new Date().toISOString().slice(0, 10);
  return `SIGPIM_${tipo}_${ts}.${ext}`;
}

// ─── componente ───────────────────────────────────────────────────────────────

export function Relatorios() {
  const [selected,  setSelected]  = useState("");
  const [filtros,   setFiltros]   = useState<FiltrosRelatorio>({
    periodo_ini: "", periodo_fim: "", orgao: "", status: "",
  });
  const [gerando,   setGerando]   = useState(false);
  const [erro,      setErro]      = useState<string | null>(null);
  const [historico, setHistorico] = useState<RelatorioGerado[]>([]);

  const handleGerar = async () => {
    if (!selected) return;
    setGerando(true);
    setErro(null);

    try {
      let totalRegistros = 0;
      let arquivo = "";

      if (selected === "LISTA_IMOVEIS") {
        // Busca até 500 imóveis e exporta CSV
        const res = await imoveisApi.listar(0, 500);
        const imoveis = res.content.filter((im) => {
          if (filtros.status && filtros.status !== "todos" && im.statusCadastro !== filtros.status) return false;
          return true;
        });
        totalRegistros = imoveis.length;
        arquivo = nomeArquivo("LISTA_IMOVEIS", "csv");

        const cabecalho = [
          "Código SIGPIM", "Nome / Referência", "Tipo", "Status",
          "Situação Dominial", "Área Terreno (m²)", "Área Construída (m²)",
          "Tipologia", "Estado de Conservação", "Cadastrado em",
        ];
        const linhas = imoveis.map((im) => [
          im.codigoSigpim,
          im.nomeReferencia ?? "",
          im.nomeTipoImovel ?? "",
          im.statusCadastro,
          im.nomeSituacaoDominial ?? "",
          im.areaTerrenoM2 ?? "",
          im.areaConstruidaM2 ?? "",
          im.tipologia ?? "",
          im.estadoConservacaoAtual ?? "",
          im.criadoEm?.slice(0, 10) ?? "",
        ]);
        baixarCSV([cabecalho, ...linhas], arquivo);

      } else if (selected === "RELATORIO_OCUPACAO") {
        const res = await api.get<{ content: OcupacaoResponse[] }>("/ocupacoes?size=500");
        const ocupacoes = res.content;
        totalRegistros = ocupacoes.length;
        arquivo = nomeArquivo("OCUPACAO", "csv");

        const cabecalho = [
          "ID Imóvel", "Status Ocupação", "Nível Ocupação",
          "Ocupante Externo", "Responsável Local", "Contato",
          "Destinação", "Data Início", "Data Fim Prevista",
          "Vigente", "Observações",
        ];
        const linhas = ocupacoes.map((oc) => [
          oc.idImovel,
          oc.statusOcupacao,
          oc.nivelOcupacao ?? "",
          oc.nomeOcupanteExterno ?? "",
          oc.nomeResponsavelLocal ?? "",
          oc.contatoResponsavel ?? "",
          oc.destinacaoFinalidade ?? "",
          oc.dataInicio ?? "",
          oc.dataFimPrevista ?? "",
          oc.vigente ? "Sim" : "Não",
          oc.observacoes ?? "",
        ]);
        baixarCSV([cabecalho, ...linhas], arquivo);

      } else if (selected === "HISTORICO_AUDITORIA") {
        const res = await api.get<{ content: any[] }>("/auditorias?size=500&sort=realizadoEm,desc");
        const logs = res.content;

        // Aplica filtro de período se informado
        const filtrados = logs.filter((l) => {
          if (filtros.periodo_ini && l.realizadoEm < filtros.periodo_ini) return false;
          if (filtros.periodo_fim && l.realizadoEm > filtros.periodo_fim + "T23:59:59") return false;
          return true;
        });
        totalRegistros = filtrados.length;
        arquivo = nomeArquivo("AUDITORIA", "csv");

        const cabecalho = [
          "Data/Hora", "Ação", "Tabela", "Registro",
          "Usuário", "Perfil", "IP", "Descrição",
        ];
        const linhas = filtrados.map((l) => [
          l.realizadoEm ? new Date(l.realizadoEm).toLocaleString("pt-BR") : "",
          l.acao,
          l.tabela,
          `#${l.idRegistro}`,
          l.nomeUsuario ?? `#${l.idUsuario}`,
          l.perfilUsuario ?? "",
          l.ipOrigem ?? "",
          l.descricao ?? "",
        ]);
        baixarCSV([cabecalho, ...linhas], arquivo);

      } else if (selected === "FICHA_IMOVEL") {
        // Exporta todos os imóveis como JSON completo
        const res = await imoveisApi.listar(0, 500);
        totalRegistros = res.content.length;
        arquivo = nomeArquivo("FICHAS", "json");
        baixarJSON({
          geradoEm: agora(),
          totalImoveis: totalRegistros,
          imoveis: res.content,
        }, arquivo);
      }

      // Adiciona ao histórico local
      setHistorico((h) => [{
        tipo: tiposRelatorio.find((t) => t.id === selected)?.title ?? selected,
        geradoEm: agora(),
        totalRegistros,
        nomeArquivo: arquivo,
      }, ...h].slice(0, 10));

    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar relatório.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Geração de relatórios gerenciais e operacionais do SIGPIM
      </p>

      {/* Cards de tipo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiposRelatorio.map((t) => {
          const Icon = t.icon;
          const [bg, txt] = t.cor.split(" ");
          return (
            <Card
              key={t.id}
              onClick={() => { setSelected(t.id); setErro(null); }}
              className={`cursor-pointer p-5 transition-all hover:shadow-md ${
                selected === t.id ? "ring-2 ring-[#1351B4] border-[#1351B4]" : ""
              }`}
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${txt}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">{t.title}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{t.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Filtros e botão */}
      {selected && (
        <Card className="p-6">
          <h3 className="mb-5 text-sm font-semibold text-gray-900">
            Configurar: {tiposRelatorio.find((t) => t.id === selected)?.title}
          </h3>

          {erro && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erro}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Data inicial</Label>
              <Input
                type="date"
                value={filtros.periodo_ini}
                onChange={(e) => setFiltros({ ...filtros, periodo_ini: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data final</Label>
              <Input
                type="date"
                value={filtros.periodo_fim}
                onChange={(e) => setFiltros({ ...filtros, periodo_fim: e.target.value })}
              />
            </div>
            {selected === "LISTA_IMOVEIS" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={filtros.status}
                  onValueChange={(v) => setFiltros({ ...filtros, status: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="VALIDADO">Validado</SelectItem>
                    <SelectItem value="PRE_CADASTRO">Pré-cadastro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={handleGerar}
              disabled={gerando}
            >
              {gerando
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando...</>
                : <><Download className="mr-2 h-4 w-4" />Gerar e Baixar</>
              }
            </Button>
            <Button variant="outline" onClick={() => { setSelected(""); setErro(null); }}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Histórico da sessão */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Relatórios Gerados</h3>
        {historico.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
            <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p>Nenhum relatório gerado ainda.</p>
            <p className="mt-1 text-xs">Selecione um tipo acima e clique em "Gerar e Baixar".</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            {historico.map((h, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-5 py-3 ${
                  i < historico.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{h.tipo}</p>
                    <p className="text-xs text-gray-400">
                      {h.geradoEm} · {h.totalRegistros} registros · {h.nomeArquivo}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}