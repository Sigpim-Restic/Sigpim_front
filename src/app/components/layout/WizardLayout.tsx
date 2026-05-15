import React, { useCallback } from "react";
import { useNavigate, useBlocker } from "react-router";
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Stepper } from "./Stepper";
import { useCadastroImovel } from "../../contexts/CadastroImovelContext";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "../ui/alert-dialog";

const wizardSteps = [
  { number: 1, label: "Identificação",  path: "/dashboard/imoveis/novo/etapa-1" },
  { number: 2, label: "Localização",    path: "/dashboard/imoveis/novo/etapa-2" },
  { number: 3, label: "Classificação",  path: "/dashboard/imoveis/novo/etapa-3" },
  { number: 4, label: "Dados Físicos",  path: "/dashboard/imoveis/novo/etapa-4" },
  { number: 5, label: "Ocupação",       path: "/dashboard/imoveis/novo/etapa-5" },
  { number: 6, label: "Instrumentos",   path: "/dashboard/imoveis/novo/etapa-6" },
  { number: 7, label: "Dominial",       path: "/dashboard/imoveis/novo/etapa-7" },
  { number: 8, label: "Pat. Histórico", path: "/dashboard/imoveis/novo/etapa-8" },
  { number: 9, label: "Anexos",         path: "/dashboard/imoveis/novo/etapa-9" },
];

const TOTAL = wizardSteps.length;

interface WizardLayoutProps {
  currentStep: number;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  salvando?: boolean;
  nextDisabled?: boolean;
}

export function WizardLayout({ currentStep, children, onNext, onBack, salvando, nextDisabled }: WizardLayoutProps) {
  const navigate = useNavigate();
  const { salvarRascunhoManual, temDadosPreenchidos } = useCadastroImovel();
  const [rascunhoSalvo, setRascunhoSalvo] = useState(false);


  const blocker = useBlocker(
    useCallback(({ currentLocation, nextLocation }) => {
      const dentroDoWizard = nextLocation.pathname.startsWith("/dashboard/imoveis/novo");
      const indo_para_sucesso = nextLocation.pathname.includes("/sucesso");
      if (dentroDoWizard || indo_para_sucesso) return false;
      return temDadosPreenchidos;
    }, [temDadosPreenchidos])
  );

  const handleBack = () => {
    salvarRascunhoManual();
    if (onBack) { onBack(); return; }
    if (currentStep > 1) navigate(`/dashboard/imoveis/novo/etapa-${currentStep - 1}`);
    else navigate("/dashboard/imoveis");
  };

  const handleNext = () => {
    salvarRascunhoManual();
    if (onNext) { onNext(); return; }
    if (currentStep < TOTAL) navigate(`/dashboard/imoveis/novo/etapa-${currentStep + 1}`);
    else navigate("/dashboard/imoveis/sucesso");
  };

  const handleSalvarRascunho = () => {
    salvarRascunhoManual();
    setRascunhoSalvo(true);
    setTimeout(() => setRascunhoSalvo(false), 2500);
  };

  const handleConfirmarSaida = () => {
    salvarRascunhoManual();
    blocker.proceed?.();
  };

  const handleCancelarSaida = () => {
    blocker.reset?.();
  };

  return (
    <>
      {/* Modal de confirmação ao sair do wizard com dados não salvos */}
      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do cadastro?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem dados preenchidos neste formulário. O rascunho será salvo automaticamente
              antes de sair e você poderá continuar de onde parou.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelarSaida}>
              Continuar preenchendo
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarSaida}
              className="bg-[#1351B4] hover:bg-[#0c3b8d] text-white"
            >
              Salvar rascunho e sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/imoveis")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Cadastro de Imóvel</h2>
            {/* Item #1: "Etapa X de 9" text-xs → text-sm */}
            <p className="text-sm text-gray-500">
              Etapa {currentStep} de {TOTAL} — preencha o que souber; campos incompletos viram pendências
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSalvarRascunho}
            className={rascunhoSalvo
              ? "border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-50"
              : ""
            }
          >
            {rascunhoSalvo ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                Rascunho salvo!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Rascunho
              </>
            )}
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <Stepper steps={wizardSteps} currentStep={currentStep} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {children}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handleBack} disabled={salvando}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={salvando || nextDisabled}
            className="bg-[#1351B4] hover:bg-[#0c3b8d]"
          >
            {currentStep === TOTAL ? "Finalizar Cadastro" : "Próxima Etapa"}
            {currentStep < TOTAL && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}