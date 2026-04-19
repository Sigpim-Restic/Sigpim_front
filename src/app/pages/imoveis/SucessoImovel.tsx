import React from "react";
import { Link } from "react-router";
import { CheckCircle2, Building2, Plus, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export function SucessoImovel() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Imóvel Cadastrado!</h2>
        <p className="mt-2 text-sm text-gray-500">
          O pré-cadastro foi salvo. O imóvel passará pelo processo de validação pela equipe responsável.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/dashboard/imoveis/novo/etapa-1">
            <Button className="w-full bg-[#1351B4] hover:bg-[#0c3b8d]">
              <Plus className="mr-2 h-4 w-4" />Cadastrar Outro Imóvel
            </Button>
          </Link>
          <Link to="/dashboard/imoveis">
            <Button variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />Ver Lista de Imóveis
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}