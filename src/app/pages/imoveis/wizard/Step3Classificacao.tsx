import React, { useEffect, useState } from "react";
import { WizardLayout } from "../../../components/layout/WizardLayout";
import { Label } from "../../../components/ui/label";
import { AlertBox } from "../../../components/layout/States";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { useCadastroImovel } from "../../../contexts/CadastroImovelContext";
import { useNavigate } from "react-router";
import { tiposImovelApi, type TipoImovelResponse } from "../../../api/tipos-imovel-alertas";

export function CadastroImovelStep3() {
  const { etapa3, setEtapa3 } = useCadastroImovel();
  const navigate = useNavigate();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [tiposImovel, setTiposImovel] = useState<TipoImovelResponse[]>([]);
  const [carregandoTipos, setCarregandoTipos] = useState(true);

  useEffect(() => {
    tiposImovelApi.listarAtivos()
      .then(setTiposImovel)
      .catch(() => {})
      .finally(() => setCarregandoTipos(false));
  }, []);

  const handleNext = () => {
    const novosErros: Record<string, string> = {};

    // Tipo é obrigatório no pré-cadastro — Manual SIGPIM §4.2
    // "Incerto" é uma opção válida e vem do banco como qualquer outro tipo
    if (!etapa3.tipoImovel) {
      novosErros.tipoImovel =
        "Selecione o tipo do imóvel. Se ainda não souber, a opção \"Incerto\" está disponível na lista.";
    }

    if (Object.values(novosErros).some(Boolean)) {
      setErros(novosErros);
      return;
    }

    navigate("/dashboard/imoveis/novo/etapa-4");
  };

  const sel = (field: keyof typeof etapa3) => ({
    value: etapa3[field],
    onValueChange: (v: string) => {
      setEtapa3({ ...etapa3, [field]: v });
      if (erros[field]) setErros((prev) => ({ ...prev, [field]: "" }));
    },
  });

  return (
    <WizardLayout currentStep={3} onNext={handleNext}>
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Classificação e Uso</h3>
          <p className="text-sm text-gray-600 mt-1">Tipo, tipologia e uso atual do imóvel</p>
        </div>

        <AlertBox variant="info">
          Campos marcados com <span className="text-red-500 font-medium">*</span> são obrigatórios
          para avançar. Se ainda não souber o tipo exato, a opção <strong>Incerto</strong> está
          disponível na lista.
        </AlertBox>

        <div className="grid gap-6">

          {/* ── Tipo de Imóvel — OBRIGATÓRIO ──────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              Tipo de Imóvel <span className="text-red-500">*</span>
            </Label>
            <Select
              value={etapa3.tipoImovel}
              onValueChange={(v) => {
                setEtapa3({ ...etapa3, tipoImovel: v });
                if (erros.tipoImovel) setErros((prev) => ({ ...prev, tipoImovel: "" }));
              }}
              disabled={carregandoTipos}
            >
              <SelectTrigger className={erros.tipoImovel ? "border-red-400" : ""}>
                <SelectValue placeholder={carregandoTipos ? "Carregando..." : "Selecione o tipo"} />
              </SelectTrigger>
              <SelectContent>
                {tiposImovel.map((tipo) => (
                  <SelectItem key={tipo.id} value={String(tipo.id)}>{tipo.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erros.tipoImovel && (
              <p className="text-xs text-red-500">{erros.tipoImovel}</p>
            )}
          </div>

          {/* ── Tipologia ─────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>Tipologia</Label>
            <Select {...sel("tipologia")}>
              <SelectTrigger><SelectValue placeholder="Selecione a tipologia" /></SelectTrigger>
              <SelectContent>
                {["Administrativo","Educação","Saúde","Cultura","Esporte e Lazer",
                  "Segurança Pública","Assistência Social","Infraestrutura","Terreno",
                  "Residencial","Outro"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Destinação atual ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>Destinação Atual</Label>
            <Select {...sel("destinacaoAtual")}>
              <SelectTrigger><SelectValue placeholder="Selecione a destinação" /></SelectTrigger>
              <SelectContent>
                {["Uso próprio","Cedido a terceiros","Imóvel locado","Sem uso definido","Em obras","Desativado"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Descrição do uso ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>Descrição do Uso Atual</Label>
            <Textarea
              value={etapa3.descricaoUso}
              onChange={(e) => setEtapa3({ ...etapa3, descricaoUso: e.target.value.slice(0, 500) })}
              placeholder="Descreva o uso atual do imóvel, atividades realizadas e finalidade..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Máximo de 500 caracteres ({etapa3.descricaoUso.length}/500).
            </p>
          </div>
        </div>
      </div>
    </WizardLayout>
  );
}