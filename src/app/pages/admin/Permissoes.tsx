import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Shield, AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { AlertBox } from "../../components/layout/States";
import { Badge } from "../../components/ui/badge";

const modules = [
  {
    id: "dashboard",
    name: "Painel Geral",
    description: "Visualização de estatísticas e indicadores",
  },
  {
    id: "imoveis",
    name: "Gestão de Imóveis",
    description: "Cadastro, edição e consulta de imóveis",
  },
  {
    id: "pendencias",
    name: "Pendências",
    description: "Gestão de pendências e validações",
  },
  {
    id: "gis",
    name: "Mapa GIS",
    description: "Visualização georreferenciada",
  },
  {
    id: "relatorios",
    name: "Relatórios",
    description: "Geração e exportação de relatórios",
  },
  {
    id: "usuarios",
    name: "Usuários e Perfis",
    description: "Gestão de usuários do sistema",
    critical: true,
  },
  {
    id: "auditoria",
    name: "Auditoria",
    description: "Logs e rastreamento de ações",
    critical: true,
  },
  {
    id: "configuracoes",
    name: "Configurações",
    description: "Configurações gerais do sistema",
  },
];

const actions = [
  { id: "visualizar", name: "Visualizar" },
  { id: "criar", name: "Criar" },
  { id: "editar", name: "Editar" },
  { id: "excluir", name: "Excluir" },
];

export function Permissoes() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [permissions, setPermissions] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const handlePermissionChange = (
    moduleId: string,
    actionId: string,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [actionId]: checked,
      },
    }));
  };

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      navigate("/dashboard/usuarios");
    }, 500);
  };

  const criticalModules = modules.filter((m) => m.critical);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/usuarios")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Gerenciar Permissões
          </h2>
          <p className="text-sm text-gray-600">
            Usuário: <span className="font-medium">Maria Silva</span> •{" "}
            <Badge className="bg-[#1351B4]">Administrador</Badge>
          </p>
        </div>
      </div>

      {criticalModules.length > 0 && (
        <AlertBox variant="warning" title="Atenção - Módulos Críticos">
          <p>
            Os módulos marcados com{" "}
            <AlertTriangle className="inline h-4 w-4 text-yellow-600" />{" "}
            possuem permissões críticas que afetam a segurança e governança do
            sistema. Conceda acesso apenas a usuários autorizados.
          </p>
        </AlertBox>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">
                      Módulo
                    </span>
                  </div>
                </th>
                {actions.map((action) => (
                  <th
                    key={action.id}
                    className="px-4 py-4 text-center font-semibold text-gray-900"
                  >
                    {action.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module, index) => (
                <tr
                  key={module.id}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } ${module.critical ? "bg-yellow-50/30" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {module.critical && (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {module.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  {actions.map((action) => (
                    <td key={action.id} className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          id={`${module.id}-${action.id}`}
                          checked={
                            permissions[module.id]?.[action.id] || false
                          }
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              module.id,
                              action.id,
                              checked as boolean
                            )
                          }
                          aria-label={`${action.name} em ${module.name}`}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-semibold text-sm text-blue-900">
          Descrição das Permissões
        </h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            <span className="font-medium">Visualizar:</span> Permite consultar
            informações do módulo
          </li>
          <li>
            <span className="font-medium">Criar:</span> Permite adicionar novos
            registros
          </li>
          <li>
            <span className="font-medium">Editar:</span> Permite modificar
            registros existentes
          </li>
          <li>
            <span className="font-medium">Excluir:</span> Permite remover
            registros (requer auditoria)
          </li>
        </ul>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={() => navigate("/dashboard/usuarios")}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[#1351B4] hover:bg-[#0c3b8d]"
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Permissões
        </Button>
      </div>
    </div>
  );
}