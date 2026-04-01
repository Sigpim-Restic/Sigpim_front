import React from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Mail,
  User,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

export function Configuracoes() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-gray-600">
          Gerencie as configurações gerais do sistema
        </p>
      </div>

      {/* Sistema */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <SettingsIcon className="h-5 w-5 text-[#1351B4]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sistema</h3>
            <p className="text-sm text-gray-600">
              Configurações gerais da aplicação
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Modo de Manutenção</Label>
              <p className="text-xs text-gray-500">
                Desabilita acesso de usuários não administradores
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Validação Automática GIS</Label>
              <p className="text-xs text-gray-500">
                Valida coordenadas automaticamente no cadastro
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Logs de Auditoria Detalhados</Label>
              <p className="text-xs text-gray-500">
                Registra todas as ações dos usuários
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Notificações */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
            <Bell className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            <p className="text-sm text-gray-600">
              Configure alertas e notificações do sistema
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar Pendências Vencendo</Label>
              <p className="text-xs text-gray-500">
                Alerta 3 dias antes do vencimento
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar Novos Cadastros</Label>
              <p className="text-xs text-gray-500">
                Alerta gestores sobre novos imóveis
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Relatórios Semanais Automáticos</Label>
              <p className="text-xs text-gray-500">
                Envia resumo semanal por e-mail
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Segurança */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Segurança</h3>
            <p className="text-sm text-gray-600">
              Políticas de segurança e acesso
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessaoTimeout">
              Tempo de Sessão (minutos)
            </Label>
            <Input
              id="sessaoTimeout"
              type="number"
              defaultValue="30"
              className="max-w-xs"
            />
            <p className="text-xs text-gray-500">
              Tempo de inatividade até logout automático
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Exigir Autenticação de Dois Fatores</Label>
              <p className="text-xs text-gray-500">
                Obrigatório para administradores
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Bloquear Após Tentativas Falhas</Label>
              <p className="text-xs text-gray-500">
                Bloqueia conta após 5 tentativas
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* E-mail */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <Mail className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Servidor de E-mail
            </h3>
            <p className="text-sm text-gray-600">
              Configurações SMTP para envio de e-mails
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Servidor SMTP</Label>
              <Input id="smtpHost" placeholder="smtp.exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Porta</Label>
              <Input id="smtpPort" type="number" placeholder="587" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smtpEmail">E-mail Remetente</Label>
            <Input
              id="smtpEmail"
              type="email"
              placeholder="noreply@slz.ma.gov.br"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="smtpSSL" defaultChecked />
            <Label htmlFor="smtpSSL">Usar SSL/TLS</Label>
          </div>

          <Button variant="outline">Testar Conexão</Button>
        </div>
      </Card>

      {/* Backup */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <Database className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Backup e Recuperação
            </h3>
            <p className="text-sm text-gray-600">
              Gestão de backups automáticos
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Automático Diário</Label>
              <p className="text-xs text-gray-500">Realizado às 02:00</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Último Backup</Label>
            <p className="text-sm text-gray-600">17/02/2026 às 02:00</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">Realizar Backup Agora</Button>
            <Button variant="outline">Restaurar Backup</Button>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Descartar Alterações</Button>
        <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
