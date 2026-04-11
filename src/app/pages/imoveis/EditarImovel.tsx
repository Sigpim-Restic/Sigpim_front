import React from "react";
import { useParams, Outlet, Navigate } from "react-router";
import { RefreshCw, AlertCircle } from "lucide-react";
import { EditarImovelProvider, useEditarImovel } from "../../contexts/EditarImovelContext";

// Tela de loading/erro enquanto o contexto carrega o imóvel
function EditarImovelInner() {
  const { carregando, erroCarregamento } = useEditarImovel();

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (erroCarregamento) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{erroCarregamento}</p>
      </div>
    );
  }

  return <Outlet />;
}

// Componente de rota — envolve com o provider e redireciona para etapa-1
export function EditarImovel() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);

  if (!id || isNaN(numId)) {
    return <Navigate to="/imoveis" replace />;
  }

  return (
    <EditarImovelProvider idImovel={numId}>
      <EditarImovelInner />
    </EditarImovelProvider>
  );
}
