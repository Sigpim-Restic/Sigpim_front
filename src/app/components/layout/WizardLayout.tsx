import React from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Stepper } from "./Stepper";

const wizardSteps = [
  { number: 1, label: "Identificação", path: "/imoveis/novo/etapa-1" },
  { number: 2, label: "Localização", path: "/imoveis/novo/etapa-2" },
  { number: 3, label: "Classificação", path: "/imoveis/novo/etapa-3" },
  { number: 4, label: "Dados Físicos", path: "/imoveis/novo/etapa-4" },
  { number: 5, label: "Ocupação", path: "/imoveis/novo/etapa-5" },
  { number: 6, label: "Instrumentos", path: "/imoveis/novo/etapa-6" },
  { number: 7, label: "Dominial", path: "/imoveis/novo/etapa-7" },
  { number: 8, label: "Vistorias", path: "/imoveis/novo/etapa-8" },
  { number: 9, label: "Patrimônio Histórico", path: "/imoveis/novo/etapa-9" },
  { number: 10, label: "Anexos", path: "/imoveis/novo/etapa-10" },
];

interface WizardLayoutProps {
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSaveDraft?: () => void;
}

export function WizardLayout({
  currentStep,
  children,
  onNext,
  onBack,
  onSaveDraft,
}: WizardLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (currentStep > 1) {
      navigate(`/imoveis/novo/etapa-${currentStep - 1}`);
    } else {
      navigate("/imoveis");
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (currentStep < 10) {
      navigate(`/imoveis/novo/etapa-${currentStep + 1}`);
    } else {
      navigate("/imoveis/sucesso");
    }
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    } else {
      // Simulate save
      alert("Rascunho salvo com sucesso!");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/imoveis")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            Cadastro de Imóvel
          </h2>
          <p className="text-sm text-gray-600">
            Preencha todas as informações obrigatórias em cada etapa
          </p>
        </div>
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Rascunho
        </Button>
      </div>

      {/* Stepper */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Stepper steps={wizardSteps} currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? "Cancelar" : "Voltar"}
        </Button>
        <Button
          onClick={handleNext}
          className="bg-[#1351B4] hover:bg-[#0c3b8d]"
        >
          {currentStep === 10 ? "Finalizar Cadastro" : "Próxima Etapa"}
          {currentStep < 10 && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}