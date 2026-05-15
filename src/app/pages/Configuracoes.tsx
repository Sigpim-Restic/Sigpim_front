import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Bell, Tag, Scale, Info, MapPin, RefreshCw, Layers, Users, Loader2, Save, Building2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { configuracoesSistemaApi } from "../api/configuracoes-sistema";

export function Configuracoes() {
  const navigate = useNavigate();

  const [mfaForcado,    setMfaForcado]    = useState(false);
  const [carregandoMfa, setCarregandoMfa] = useState(true);
  const [salvandoMfa,   setSalvandoMfa]   = useState(false);

  const [sessionMinutes,        setSessionMinutes]        = useState<number>(120);
  const [idleTimeoutMinutes,    setIdleTimeoutMinutes]    = useState<number>(30);
  const [idleWarningMinutes,    setIdleWarningMinutes]    = useState<number>(5);
  const [carregandoSession,     setCarregandoSession]     = useState(true);
  const [salvandoSession,       setSalvandoSession]       = useState(false);

  useEffect(() => {
    configuracoesSistemaApi.getMfaForcado()
      .then((r) => setMfaForcado(r.ativo))
      .catch(() => {})
      .finally(() => setCarregandoMfa(false));
  }, []);

  useEffect(() => {
    configuracoesSistemaApi.getSessionExpiration()
      .then((r) => setSessionMinutes(r.minutos))
      .catch(() => {})
      .finally(() => setCarregandoSession(false));
    configuracoesSistemaApi.getSessionIdle()
      .then((r) => {
        setIdleTimeoutMinutes(r.timeoutMinutes);
        setIdleWarningMinutes(r.warningMinutes);
      })
      .catch(() => {});
  }, []);

  const handleSalvarSessao = async () => {
    setSalvandoSession(true);
    try {
      await configuracoesSistemaApi.setSessionExpiration(sessionMinutes);
      await configuracoesSistemaApi.setSessionIdle(idleTimeoutMinutes, idleWarningMinutes);
      toast.success("Configurações de sessão salvas. Efeito nos próximos logins.");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Erro ao salvar configurações de sessão.");
    } finally {
      setSalvandoSession(false);
    }
  };

  const handleToggleMfa = async (ativo: boolean) => {
    setSalvandoMfa(true);
    try {
      const res = await configuracoesSistemaApi.setMfaForcado(ativo);
      setMfaForcado(res.ativo);
    } catch {
      setMfaForcado(!ativo);
    } finally {
      setSalvandoMfa(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-gray-500">Configurações do sistema — restrito ao Administrador do Sistema (SIN/SEMAD)</p>

      {/* Estrutura Organizacional */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#1351B4]" />
          <h3 className="text-sm font-semibold text-gray-900">Estrutura Organizacional</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Gerencie órgãos, secretarias e departamentos. Como o SIGPIM é político-administrativo,
          órgãos podem ser criados, fundidos ou extintos a qualquer momento.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/dashboard/configuracoes/orgaos")}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Building2 className="h-5 w-5 text-[#1351B4] shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Órgãos e Secretarias</p>
              <p className="text-xs text-gray-500">SEMAD, SEPLAN, FUMPH e outros — criar, extinguir ou restabelecer</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Catálogos Administrativos */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#1351B4]" />
          <h3 className="text-sm font-semibold text-gray-900">Catálogos Administrativos</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Gerencie as tabelas configuráveis do sistema. Apenas administradores podem editar.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => navigate("/dashboard/configuracoes/tipos-imovel")}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Tag className="h-5 w-5 text-[#1351B4] shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Tipos de Imóvel</p>
              <p className="text-xs text-gray-500">Próprio, Locado, Incerto e outros</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/dashboard/configuracoes/situacoes-dominiais")}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Scale className="h-5 w-5 text-[#1351B4] shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Situações Dominiais</p>
              <p className="text-xs text-gray-500">Regular, Irregular, Em Apuração e outras</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/dashboard/configuracoes/origens-cadastro")}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <MapPin className="h-5 w-5 text-[#1351B4] shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Origens de Cadastro</p>
              <p className="text-xs text-gray-500">Levantamento, Demanda, Processo e outras</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/dashboard/configuracoes/niveis-ocupacao")}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Layers className="h-5 w-5 text-[#1351B4] shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Níveis de Ocupação</p>
              <p className="text-xs text-gray-500">Total, Parcial, Compartilhado e outros</p>
            </div>
          </button>
          <button
            onClick={() => navigate("/dashboard/configuracoes/pessoas")}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Users className="h-5 w-5 text-[#1351B4] shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pessoas</p>
              <p className="text-xs text-gray-500">Locadores, cessionários e contatos patrimoniais</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Informações do Sistema */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Info className="h-4 w-4 text-[#1351B4]" />
          <h3 className="text-sm font-semibold text-gray-900">Informações do Sistema</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Versão",             value: "2.0.0 — Fase 3" },
            { label: "Ambiente",           value: "Produção" },
            { label: "Banco de dados",     value: "PostgreSQL 18 + PostGIS" },
            { label: "Última atualização", value: "15/05/2026" },
          ].map((i) => (
            <div key={i.label} className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">{i.label}</p>
              <p className="text-sm font-medium text-gray-900">{i.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Notificações */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#1351B4]" />
          <h3 className="text-sm font-semibold text-gray-900">Notificações e Alertas</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Imóveis em pré-cadastro há mais de 30 dias",          desc: "Alerta para operadores responsáveis" },
            { label: "Documentos pendentes de validação há mais de 7 dias", desc: "Notificação para validadores" },
            { label: "Ocupações sem instrumento formal",                    desc: "Alerta diário para administradores patrimoniais" },
            { label: "Imóveis sem validação GIS",                           desc: "Resumo semanal para equipe SEMURH" },
            { label: "Intervenções com parecer FUMPH pendente",             desc: "Alerta para vistoriadores e administradores" },
            { label: "Vistorias de risco ALTO ou CRÍTICO",                  desc: "Notificação imediata para SEMOSP" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-900">{n.label}</p>
                <p className="text-xs text-gray-500">{n.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </Card>

      {/* Segurança */}
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#1351B4]" />
          <h3 className="text-sm font-semibold text-gray-900">Segurança e Sessão</h3>
        </div>
        <div className="space-y-4">
          {carregandoSession ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <RefreshCw className="h-4 w-4 animate-spin" />Carregando...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Duração da sessão (minutos)</Label>
                <p className="text-xs text-gray-500">
                  Tempo de vida do token após o login. Mín: 5 min, Máx: 480 min (8h).
                  Alterações têm efeito nos <strong>próximos logins</strong>.
                </p>
                <Input
                  type="number" min={5} max={480}
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(Number(e.target.value))}
                  className="max-w-32"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Timeout de inatividade (minutos)</Label>
                <p className="text-xs text-gray-500">
                  Minutos sem interação antes de exibir o aviso. Use 0 para desativar.
                </p>
                <Input
                  type="number" min={0} max={240}
                  value={idleTimeoutMinutes}
                  onChange={(e) => setIdleTimeoutMinutes(Number(e.target.value))}
                  className="max-w-32"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Janela de aviso antes do logout (minutos)</Label>
                <p className="text-xs text-gray-500">
                  Contagem regressiva exibida ao usuário antes do logout automático.
                </p>
                <Input
                  type="number" min={1} max={30}
                  value={idleWarningMinutes}
                  onChange={(e) => setIdleWarningMinutes(Number(e.target.value))}
                  className="max-w-32"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSalvarSessao}
                  disabled={salvandoSession}
                  className="bg-[#1351B4] hover:bg-[#0c3b8d]"
                >
                  {salvandoSession
                    ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Salvando...</>
                    : <><Save className="mr-2 h-3.5 w-3.5" />Salvar configurações de sessão</>
                  }
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Forçar MFA para todos os usuários</p>
              <p className="text-xs text-gray-500">
                Bloqueia o login de qualquer usuário sem MFA ativo e confirmado. Toda alteração é registrada na auditoria.
              </p>
            </div>
            {carregandoMfa ? (
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <Switch
                checked={mfaForcado}
                onCheckedChange={handleToggleMfa}
                disabled={salvandoMfa}
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900">Log de acesso completo</p>
              <p className="text-xs text-gray-500">Registrar todos os acessos na auditoria</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

    </div>
  );
}