import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Stepper } from "../../../components/layout/Stepper";
import { useEditarImovel } from "../../../contexts/EditarImovelContext";

const steps = [
  { number: 1, label: "Identificação", path: "" },
  { number: 2, label: "Localização",   path: "" },
  { number: 3, label: "Classificação", path: "" },
  { number: 4, label: "Dados Físicos", path: "" },
  { number: 5, label: "Ocupação",      path: "" },
];

const TOTAL = steps.length;

interface Props {
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  salvando?: boolean;
}

export function EditarWizardLayout({ currentStep, children, onNext, salvando }: Props) {
  const navigate  = useNavigate();
  const { imovel } = useEditarImovel();
  const idImovel  = imovel?.id;

  const stepsComPath = steps.map((s) => ({
    ...s,
    path: `/imoveis/${idImovel}/editar/etapa-${s.number}`,
  }));

  const handleBack = () => {
    if (currentStep > 1) navigate(`/imoveis/${idImovel}/editar/etapa-${currentStep - 1}`);
    else navigate(`/imoveis/${idImovel}`);
  };

  const handleNext = () => {
    if (onNext) { onNext(); return; }
    if (currentStep < TOTAL) navigate(`/imoveis/${idImovel}/editar/etapa-${currentStep + 1}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">

      {/* Cabeçalho com contexto do imóvel sendo editado */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/imoveis/${idImovel}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">Editar Imóvel</h2>
          <p className="text-xs text-gray-500">
            Etapa {currentStep} de {TOTAL} — altere apenas os campos necessários
          </p>
        </div>
      </div>

      {/* Banner identificador — para o usuário nunca perder o contexto */}
      {imovel && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <Building2 className="h-5 w-5 text-[#1351B4] shrink-0" />
          <div>
            <span className="font-mono text-sm font-bold text-[#1351B4]">
              {imovel.codigoSigpim}
            </span>
            <span className="mx-2 text-gray-300">·</span>
            <span className="text-sm font-medium text-gray-700">
              {imovel.nomeReferencia ?? "Sem nome"}
            </span>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <Stepper steps={stepsComPath} currentStep={currentStep} />
      </div>

      {/* Conteúdo da etapa */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {children}
      </div>

      {/* Navegação */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleBack} disabled={salvando}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? "Cancelar" : "Voltar"}
        </Button>
        <Button
          onClick={handleNext}
          className="bg-[#1351B4] hover:bg-[#0c3b8d]"
          disabled={salvando}
        >
          {salvando
            ? "Salvando..."
            : currentStep === TOTAL
            ? "Salvar Alterações"
            : "Próxima Etapa"}
          {!salvando && currentStep < TOTAL && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}