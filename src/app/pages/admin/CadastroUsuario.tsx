import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card } from "../../components/ui/card";
import { AlertBox } from "../../components/layout/States";

export function CadastroUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    orgao: "",
    unidade: "",
    perfil: "",
    status: "Ativo",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors: Record<string, string> = {};

    switch (field) {
      case "nome":
        if (!formData.nome.trim()) {
          newErrors.nome = "Nome completo é obrigatório";
        } else if (formData.nome.trim().length < 3) {
          newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
        }
        break;
      case "email":
        if (!formData.email.trim()) {
          newErrors.email = "E-mail institucional é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "E-mail inválido";
        } else if (!formData.email.includes(".gov.br")) {
          newErrors.email = "Deve ser um e-mail institucional (.gov.br)";
        }
        break;
      case "orgao":
        if (!formData.orgao) {
          newErrors.orgao = "Órgão é obrigatório";
        }
        break;
      case "unidade":
        if (!formData.unidade.trim()) {
          newErrors.unidade = "Unidade é obrigatória";
        }
        break;
      case "perfil":
        if (!formData.perfil) {
          newErrors.perfil = "Perfil de acesso é obrigatório";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = ["nome", "email", "orgao", "unidade", "perfil"];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Simulate API call
      setTimeout(() => {
        navigate("/usuarios/sucesso");
      }, 500);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/usuarios")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Novo Usuário
          </h2>
          <p className="text-sm text-gray-600">
            Cadastre um novo usuário no sistema e defina suas permissões
          </p>
        </div>
      </div>

      <AlertBox variant="info">
        <p>
          Todos os campos marcados com <span className="text-red-600">*</span>{" "}
          são obrigatórios. O usuário receberá um e-mail com instruções de
          acesso após o cadastro.
        </p>
      </AlertBox>

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome Completo <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                onBlur={() => handleBlur("nome")}
                placeholder="Ex: Maria Silva Santos"
                className={errors.nome && touched.nome ? "border-red-500" : ""}
                aria-invalid={errors.nome && touched.nome ? "true" : "false"}
                aria-describedby={
                  errors.nome && touched.nome ? "nome-error" : undefined
                }
              />
              {errors.nome && touched.nome && (
                <p
                  id="nome-error"
                  className="flex items-center gap-1 text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.nome}
                </p>
              )}
            </div>

            {/* E-mail Institucional */}
            <div className="space-y-2">
              <Label htmlFor="email">
                E-mail Institucional <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="usuario@orgao.slz.ma.gov.br"
                className={
                  errors.email && touched.email ? "border-red-500" : ""
                }
                aria-invalid={errors.email && touched.email ? "true" : "false"}
                aria-describedby={
                  errors.email && touched.email ? "email-error" : undefined
                }
              />
              {errors.email && touched.email && (
                <p
                  id="email-error"
                  className="flex items-center gap-1 text-sm text-red-600"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Utilize apenas e-mails corporativos com domínio .gov.br
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Órgão */}
              <div className="space-y-2">
                <Label htmlFor="orgao">
                  Órgão <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.orgao}
                  onValueChange={(value) => handleChange("orgao", value)}
                >
                  <SelectTrigger
                    id="orgao"
                    className={
                      errors.orgao && touched.orgao ? "border-red-500" : ""
                    }
                    aria-invalid={
                      errors.orgao && touched.orgao ? "true" : "false"
                    }
                    onBlur={() => handleBlur("orgao")}
                  >
                    <SelectValue placeholder="Selecione o órgão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEPLAN">
                      SEPLAN - Sec. Municipal de Planejamento
                    </SelectItem>
                    <SelectItem value="SEMED">
                      SEMED - Sec. Municipal de Educação
                    </SelectItem>
                    <SelectItem value="SEMUS">
                      SEMUS - Sec. Municipal de Saúde
                    </SelectItem>
                    <SelectItem value="SEMFAZ">
                      SEMFAZ - Sec. Municipal de Fazenda
                    </SelectItem>
                    <SelectItem value="SEINFRA">
                      SEINFRA - Sec. Municipal de Infraestrutura
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.orgao && touched.orgao && (
                  <p className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.orgao}
                  </p>
                )}
              </div>

              {/* Unidade */}
              <div className="space-y-2">
                <Label htmlFor="unidade">
                  Unidade <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="unidade"
                  value={formData.unidade}
                  onChange={(e) => handleChange("unidade", e.target.value)}
                  onBlur={() => handleBlur("unidade")}
                  placeholder="Ex: Diretoria de Patrimônio"
                  className={
                    errors.unidade && touched.unidade ? "border-red-500" : ""
                  }
                  aria-invalid={
                    errors.unidade && touched.unidade ? "true" : "false"
                  }
                />
                {errors.unidade && touched.unidade && (
                  <p className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.unidade}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Perfil de Acesso */}
              <div className="space-y-2">
                <Label htmlFor="perfil">
                  Perfil de Acesso <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value) => handleChange("perfil", value)}
                >
                  <SelectTrigger
                    id="perfil"
                    className={
                      errors.perfil && touched.perfil ? "border-red-500" : ""
                    }
                    onBlur={() => handleBlur("perfil")}
                  >
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">
                      Administrador - Acesso total
                    </SelectItem>
                    <SelectItem value="Gestor">
                      Gestor - Gestão e aprovações
                    </SelectItem>
                    <SelectItem value="Operacional">
                      Operacional - Cadastro e edição
                    </SelectItem>
                    <SelectItem value="Consulta">
                      Consulta - Apenas visualização
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.perfil && touched.perfil && (
                  <p className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.perfil}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/usuarios")}
          >
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#1351B4] hover:bg-[#0c3b8d]">
            <Save className="mr-2 h-4 w-4" />
            Salvar e Continuar
          </Button>
        </div>
      </form>
    </div>
  );
}