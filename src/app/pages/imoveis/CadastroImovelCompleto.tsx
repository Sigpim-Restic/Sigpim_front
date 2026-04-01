import React, { useState } from "react";
import { MainLayout } from "../../components/layout/MainLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { HierarchicalCombobox } from "../../components/ui/hierarchical-combobox";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

const unidadesGestoras = [
  {
    secretaria: "Secretaria de Planejamento",
    sigla: "SEPLAN",
    unidades: [
      {
        value: "seplan-diretoria-patrimonio",
        label: "Diretoria de Patrimônio",
      },
      {
        value: "seplan-coordenacao-cadastro",
        label: "Coordenação de Cadastro Imobiliário",
      },
      {
        value: "seplan-gis-georreferenciamento",
        label: "GIS e Georreferenciamento",
      },
      {
        value: "seplan-planejamento-territorial",
        label: "Planejamento Territorial",
      },
      {
        value: "seplan-gestao-projetos",
        label: "Gestão de Projetos Estratégicos",
      },
    ],
  },
  {
    secretaria: "Secretaria de Educação",
    sigla: "SEMED",
    unidades: [
      {
        value: "semed-gestao-predial",
        label: "Gestão Predial",
      },
      {
        value: "semed-infraestrutura-escolar",
        label: "Infraestrutura Escolar",
      },
      {
        value: "semed-manutencao",
        label: "Manutenção e Conservação",
      },
    ],
  },
  {
    secretaria: "Secretaria de Saúde",
    sigla: "SEMUS",
    unidades: [
      {
        value: "semus-infraestrutura",
        label: "Infraestrutura",
      },
      {
        value: "semus-patrimonio-hospitalar",
        label: "Patrimônio Hospitalar",
      },
      {
        value: "semus-unidades-basicas",
        label: "Gestão de Unidades Básicas",
      },
    ],
  },
  {
    secretaria: "Secretaria de Finanças",
    sigla: "SEMFAZ",
    unidades: [
      {
        value: "semfaz-auditoria-patrimonial",
        label: "Auditoria Patrimonial",
      },
      {
        value: "semfaz-controle-interno",
        label: "Controle Interno",
      },
      {
        value: "semfaz-gestao-contratos",
        label: "Gestão de Contratos",
      },
    ],
  },
  {
    secretaria: "Secretaria de Administração",
    sigla: "SEMAD",
    unidades: [
      {
        value: "semad-gestao-predios",
        label: "Gestão de Prédios Públicos",
      },
      {
        value: "semad-servicos-gerais",
        label: "Serviços Gerais",
      },
      {
        value: "semad-almoxarifado",
        label: "Almoxarifado Central",
      },
    ],
  },
  {
    secretaria: "Secretaria de Obras e Serviços Públicos",
    sigla: "SEMOSP",
    unidades: [
      {
        value: "semosp-obras-publicas",
        label: "Obras Públicas",
      },
      {
        value: "semosp-manutencao-urbana",
        label: "Manutenção Urbana",
      },
      {
        value: "semosp-engenharia",
        label: "Engenharia e Projetos",
      },
    ],
  },
  {
    secretaria: "Secretaria de Recursos Humanos",
    sigla: "SEMURH",
    unidades: [
      {
        value: "semurh-gestao-pessoas",
        label: "Gestão de Pessoas",
      },
      {
        value: "semurh-desenvolvimento",
        label: "Desenvolvimento e Capacitação",
      },
    ],
  },
];

interface DocumentoAnexado {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  status: "enviado" | "processando" | "erro";
}

export function CadastroImovelCompleto() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    nomeImovel: "",
    tipoImovel: "",
    origemCadastro: "",
    orgaoResponsavel: "",
    unidadeGestora: "",
    frente: "",
    fundo: "",
    lateral1: "",
    lateral2: "",
    diagonal: "",
    p001Lat: "",
    p001Lng: "",
    p002Lat: "",
    p002Lng: "",
    p003Lat: "",
    p003Lng: "",
    p004Lat: "",
    p004Lng: "",
    p005Lat: "",
    p005Lng: "",
  });

  const [documentos, setDocumentos] = useState<DocumentoAnexado[]>([
    {
      id: "1",
      nome: "escritura_imovel_001.pdf",
      tipo: "Escritura",
      tamanho: "2.4 MB",
      status: "enviado",
    },
  ]);

  const documentosObrigatorios = [
    { id: "matricula", nome: "Matrícula do Imóvel", obrigatorio: true },
    { id: "escritura", nome: "Escritura ou Documento de Propriedade", obrigatorio: true },
    { id: "planta", nome: "Planta/Croqui de Localização", obrigatorio: true },
    { id: "fotos", nome: "Registro Fotográfico do Imóvel", obrigatorio: true },
    { id: "iptu", nome: "Comprovante de IPTU", obrigatorio: true },
    { id: "certidao", nome: "Certidão Negativa de Débitos", obrigatorio: true },
    { id: "laudo", nome: "Laudo de Vistoria", obrigatorio: true },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Aqui seria feito o upload real
      const novoDoc: DocumentoAnexado = {
        id: Date.now().toString(),
        nome: e.dataTransfer.files[0].name,
        tipo: "Documento",
        tamanho: "1.2 MB",
        status: "enviado",
      };
      setDocumentos([...documentos, novoDoc]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const novoDoc: DocumentoAnexado = {
        id: Date.now().toString(),
        nome: e.target.files[0].name,
        tipo: "Documento",
        tamanho: "1.2 MB",
        status: "enviado",
      };
      setDocumentos([...documentos, novoDoc]);
    }
  };

  const removerDocumento = (id: string) => {
    setDocumentos(documentos.filter((doc) => doc.id !== id));
  };

  return (
    <MainLayout
      title="Cadastro de Imóvel"
      breadcrumbs={[
        { label: "Imóveis", href: "/imoveis" },
        { label: "Novo Cadastro" },
      ]}
    >
      <div className="mx-auto max-w-5xl">
        {/* Progress Indicator */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">
              Progresso do Cadastro
            </span>
            <span className="text-gray-600">3 de 10 etapas</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-[#1351B4]"
              style={{ width: "30%" }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Seção: Identificação e Governança */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Identificação e Governança
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Informações básicas e responsabilidade institucional
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomeImovel">
                  Nome do Imóvel <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="nomeImovel"
                  value={formData.nomeImovel}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeImovel: e.target.value })
                  }
                  placeholder="Ex: Edifício Sede SEPLAN"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoImovel">
                  Tipo do Imóvel <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.tipoImovel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipoImovel: value })
                  }
                >
                  <SelectTrigger id="tipoImovel">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="predioAdministrativo">
                      Prédio Administrativo
                    </SelectItem>
                    <SelectItem value="escola">Escola Municipal</SelectItem>
                    <SelectItem value="postoDeSaude">Posto de Saúde</SelectItem>
                    <SelectItem value="terreno">Terreno</SelectItem>
                    <SelectItem value="galpao">Galpão</SelectItem>
                    <SelectItem value="arquivo">Arquivo Público</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origemCadastro">
                  Origem do Cadastro <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.origemCadastro}
                  onValueChange={(value) =>
                    setFormData({ ...formData, origemCadastro: value })
                  }
                >
                  <SelectTrigger id="origemCadastro">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventario2024">
                      Inventário 2024
                    </SelectItem>
                    <SelectItem value="levantamentoCampo">
                      Levantamento de Campo
                    </SelectItem>
                    <SelectItem value="aquisicaoNova">
                      Aquisição Nova
                    </SelectItem>
                    <SelectItem value="regularizacao">
                      Regularização
                    </SelectItem>
                    <SelectItem value="transferencia">
                      Transferência entre Órgãos
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgaoResponsavel">
                  Órgão Responsável <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.orgaoResponsavel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, orgaoResponsavel: value })
                  }
                >
                  <SelectTrigger id="orgaoResponsavel">
                    <SelectValue placeholder="Selecione o órgão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEPLAN">SEPLAN</SelectItem>
                    <SelectItem value="SEMED">SEMED</SelectItem>
                    <SelectItem value="SEMUS">SEMUS</SelectItem>
                    <SelectItem value="SEMFAZ">SEMFAZ</SelectItem>
                    <SelectItem value="SEMOB">SEMOB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidadeGestora">
                  Unidade Gestora <span className="text-red-600">*</span>
                </Label>
                <HierarchicalCombobox
                  groups={unidadesGestoras}
                  value={formData.unidadeGestora}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unidadeGestora: value })
                  }
                  placeholder="Selecione ou busque uma unidade"
                  searchPlaceholder="Buscar unidade ou secretaria..."
                  emptyText="Nenhuma unidade encontrada."
                />
              </div>
            </div>
          </div>

          {/* Seção: Dimensões do Terreno */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Dimensões do Terreno (em metros)
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Medidas lineares do terreno e coordenadas geográficas
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="frente">Frente</Label>
                <Input
                  id="frente"
                  type="number"
                  step="0.01"
                  value={formData.frente}
                  onChange={(e) =>
                    setFormData({ ...formData, frente: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundo">Fundo</Label>
                <Input
                  id="fundo"
                  type="number"
                  step="0.01"
                  value={formData.fundo}
                  onChange={(e) =>
                    setFormData({ ...formData, fundo: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateral1">Lateral 1</Label>
                <Input
                  id="lateral1"
                  type="number"
                  step="0.01"
                  value={formData.lateral1}
                  onChange={(e) =>
                    setFormData({ ...formData, lateral1: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateral2">Lateral 2</Label>
                <Input
                  id="lateral2"
                  type="number"
                  step="0.01"
                  value={formData.lateral2}
                  onChange={(e) =>
                    setFormData({ ...formData, lateral2: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagonal">Diagonal</Label>
                <Input
                  id="diagonal"
                  type="number"
                  step="0.01"
                  value={formData.diagonal}
                  onChange={(e) =>
                    setFormData({ ...formData, diagonal: e.target.value })
                  }
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Subseção: Coordenadas do Terreno */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">
                  Coordenadas do Terreno
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Vértices do polígono para integração com o módulo GIS
                </p>
              </div>

              <div className="grid gap-4">
                {/* P001 */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 text-sm font-medium text-gray-700">
                    Ponto P001
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p001Lat">Latitude</Label>
                      <Input
                        id="p001Lat"
                        type="text"
                        value={formData.p001Lat}
                        onChange={(e) =>
                          setFormData({ ...formData, p001Lat: e.target.value })
                        }
                        placeholder="-2.5296"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p001Lng">Longitude</Label>
                      <Input
                        id="p001Lng"
                        type="text"
                        value={formData.p001Lng}
                        onChange={(e) =>
                          setFormData({ ...formData, p001Lng: e.target.value })
                        }
                        placeholder="-44.3028"
                      />
                    </div>
                  </div>
                </div>

                {/* P002 */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 text-sm font-medium text-gray-700">
                    Ponto P002
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p002Lat">Latitude</Label>
                      <Input
                        id="p002Lat"
                        type="text"
                        value={formData.p002Lat}
                        onChange={(e) =>
                          setFormData({ ...formData, p002Lat: e.target.value })
                        }
                        placeholder="-2.5296"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p002Lng">Longitude</Label>
                      <Input
                        id="p002Lng"
                        type="text"
                        value={formData.p002Lng}
                        onChange={(e) =>
                          setFormData({ ...formData, p002Lng: e.target.value })
                        }
                        placeholder="-44.3028"
                      />
                    </div>
                  </div>
                </div>

                {/* P003 */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 text-sm font-medium text-gray-700">
                    Ponto P003
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p003Lat">Latitude</Label>
                      <Input
                        id="p003Lat"
                        type="text"
                        value={formData.p003Lat}
                        onChange={(e) =>
                          setFormData({ ...formData, p003Lat: e.target.value })
                        }
                        placeholder="-2.5296"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p003Lng">Longitude</Label>
                      <Input
                        id="p003Lng"
                        type="text"
                        value={formData.p003Lng}
                        onChange={(e) =>
                          setFormData({ ...formData, p003Lng: e.target.value })
                        }
                        placeholder="-44.3028"
                      />
                    </div>
                  </div>
                </div>

                {/* P004 */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 text-sm font-medium text-gray-700">
                    Ponto P004
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p004Lat">Latitude</Label>
                      <Input
                        id="p004Lat"
                        type="text"
                        value={formData.p004Lat}
                        onChange={(e) =>
                          setFormData({ ...formData, p004Lat: e.target.value })
                        }
                        placeholder="-2.5296"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p004Lng">Longitude</Label>
                      <Input
                        id="p004Lng"
                        type="text"
                        value={formData.p004Lng}
                        onChange={(e) =>
                          setFormData({ ...formData, p004Lng: e.target.value })
                        }
                        placeholder="-44.3028"
                      />
                    </div>
                  </div>
                </div>

                {/* P005 */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 text-sm font-medium text-gray-700">
                    Ponto P005
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="p005Lat">Latitude</Label>
                      <Input
                        id="p005Lat"
                        type="text"
                        value={formData.p005Lat}
                        onChange={(e) =>
                          setFormData({ ...formData, p005Lat: e.target.value })
                        }
                        placeholder="-2.5296"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p005Lng">Longitude</Label>
                      <Input
                        id="p005Lng"
                        type="text"
                        value={formData.p005Lng}
                        onChange={(e) =>
                          setFormData({ ...formData, p005Lng: e.target.value })
                        }
                        placeholder="-44.3028"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Documentos e Anexos */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Documentos e Anexos
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Upload de documentação obrigatória e complementar
              </p>
            </div>

            {/* Documentos Obrigatórios */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Documentos Obrigatórios
              </h3>
              <div className="space-y-2">
                {documentosObrigatorios.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{doc.nome}</span>
                      {doc.obrigatorio && (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-700"
                        >
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {doc.id === "escritura" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Área de Upload Drag and Drop */}
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? "border-[#1351B4] bg-blue-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900">
                  Arraste arquivos para fazer upload
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  ou clique para selecionar
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG ou PNG até 10MB
                </p>
              </div>
              <input
                type="file"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>

            {/* Lista de Arquivos Anexados */}
            {documentos.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-gray-900">
                  Arquivos Anexados
                </h3>
                <div className="space-y-2">
                  {documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.nome}
                          </p>
                          <p className="text-xs text-gray-500">
                            {doc.tipo} • {doc.tamanho}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === "enviado" && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {doc.status === "processando" && (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1351B4] border-t-transparent" />
                        )}
                        {doc.status === "erro" && (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removerDocumento(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <Button
              variant="outline"
              onClick={() => navigate("/imoveis")}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar rascunho
              </Button>
              <Button className="gap-2 bg-[#1351B4] hover:bg-[#0D3B82]">
                Próxima etapa
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}