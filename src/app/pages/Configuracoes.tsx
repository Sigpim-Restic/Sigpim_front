import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Shield, Bell, Tag, Scale, Info, MapPin, RefreshCw, Layers } from "lucide-react";
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

  useEffect(() => {
    configuracoesSistemaApi.getMfaForcado()
      .then((r) => setMfaForcado(r.ativo))
      .catch(() => {})
      .finally(() => setCarregandoMfa(false));
  }, []);

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
          {/* Novo: Níveis de Ocupação (V16) */}
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
            { label: "Versão",             value: "2.0.0 — Fase 2" },
            { label: "Ambiente",           value: "Produção" },
            { label: "Banco de dados",     value: "PostgreSQL 18 + PostGIS" },
            { label: "Última atualização", value: "01/05/2026" },
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
          <div className="space-y-1.5">
            <Label className="text-xs">Tempo de sessão (minutos)</Label>
            <Input type="number" defaultValue={120} className="max-w-32" />
          </div>

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

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">Salvar Configurações</Button>
      </div>
    </div>
  );
}