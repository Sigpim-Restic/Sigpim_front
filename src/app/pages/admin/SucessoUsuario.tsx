import React from "react";
import { Link } from "react-router";
import { Building2, UserPlus } from "lucide-react";
import { SuccessState } from "../../components/layout/States";
import { Button } from "../../components/ui/button";

export function SucessoUsuario() {
  return (
    <div className="mx-auto max-w-2xl">
      <SuccessState
        title="Usuário cadastrado com sucesso"
        description="O usuário foi cadastrado no sistema e receberá um e-mail com as instruções de acesso. As permissões definidas já estão ativas."
        actions={
          <>
            <Link to="/imoveis/novo/etapa-1">
              <Button className="bg-[#1351B4] hover:bg-[#0c3b8d]">
                <Building2 className="mr-2 h-4 w-4" />
                Cadastrar Imóvel
              </Button>
            </Link>
            <Link to="/usuarios/novo">
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Novo Usuário
              </Button>
            </Link>
            <Link to="/usuarios">
              <Button variant="ghost">Voltar para Lista</Button>
            </Link>
          </>
        }
      />
    </div>
  );
}
