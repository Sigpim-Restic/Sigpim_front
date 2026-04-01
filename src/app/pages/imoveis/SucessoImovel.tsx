import React from "react";
import { Link } from "react-router";
import { Building2, FileText, List } from "lucide-react";
import { SuccessState } from "../../components/layout/States";
import { Button } from "../../components/ui/button";

export function SucessoImovel() {
  return (
    <div className="mx-auto max-w-2xl">
      <SuccessState
        title="Imóvel cadastrado com sucesso!"
        description="O cadastro do imóvel foi concluído e registrado no sistema. O código de identificação IMO-2026-0048 foi gerado automaticamente. Todas as informações foram validadas e armazenadas com segurança."
        actions={
          <>
            <Link to="/imoveis/novo/etapa-1">
              <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Building2 className="mr-2 h-4 w-4" />
                Cadastrar Novo Imóvel
              </Button>
            </Link>
            <Link to="/imoveis">
              <Button variant="outline">
                <List className="mr-2 h-4 w-4" />
                Ver Lista de Imóveis
              </Button>
            </Link>
            <Link to="/relatorios">
              <Button variant="ghost">
                <FileText className="mr-2 h-4 w-4" />
                Gerar Ficha do Imóvel
              </Button>
            </Link>
          </>
        }
      />
    </div>
  );
}
