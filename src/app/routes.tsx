import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Login } from "./pages/auth/Login";
import { RecuperarSenha } from "./pages/auth/RecuperarSenha";
import { CriarConta } from "./pages/auth/CriarConta";
import { Dashboard } from "./pages/Dashboard";
import { ListaUsuarios } from "./pages/admin/ListaUsuarios";
import { CadastroUsuario } from "./pages/admin/CadastroUsuario";
import { Permissoes } from "./pages/admin/Permissoes";
import { SucessoUsuario } from "./pages/admin/SucessoUsuario";
import { ListaImoveis } from "./pages/imoveis/ListaImoveis";
import { DetalhesImovel } from "./pages/imoveis/DetalhesImovel";
import { EditarImovel } from "./pages/imoveis/EditarImovel";
import { SucessoImovel } from "./pages/imoveis/SucessoImovel";

// Wizard de criação
import { CadastroImovelStep1 } from "./pages/imoveis/wizard/Step1Identificacao";
import { CadastroImovelStep2 } from "./pages/imoveis/wizard/Step2Localizacao";
import { CadastroImovelStep3 } from "./pages/imoveis/wizard/Step3Classificacao";
import { CadastroImovelStep4 } from "./pages/imoveis/wizard/Step4DadosFisicos";
import { CadastroImovelStep5 } from "./pages/imoveis/wizard/Step5Ocupacao";
import { CadastroImovelStep6 } from "./pages/imoveis/wizard/Step6Instrumentos";
import { CadastroImovelStep7 } from "./pages/imoveis/wizard/Step7Dominial";
import { CadastroImovelStep8 } from "./pages/imoveis/wizard/Step8PatrimonioHistorico";
import { CadastroImovelStep9 } from "./pages/imoveis/wizard/Step9Anexos";

// Wizard de edição — 9 etapas espelhando o cadastro
import { EditarStep1 } from "./pages/imoveis/wizard-editar/EditarStep1";
import { EditarStep2 } from "./pages/imoveis/wizard-editar/EditarStep2";
import { EditarStep3 } from "./pages/imoveis/wizard-editar/EditarStep3";
import { EditarStep4 } from "./pages/imoveis/wizard-editar/EditarStep4";
import { EditarStep5 } from "./pages/imoveis/wizard-editar/EditarStep5";
import { EditarStep6 } from "./pages/imoveis/wizard-editar/EditarStep6";  // Instrumentos (nova)
import { EditarStep7 } from "./pages/imoveis/wizard-editar/EditarStep7";  // Dominial (era Step6)
import { EditarStep8 } from "./pages/imoveis/wizard-editar/EditarStep8";  // Patrimônio (nova)
import { EditarStep9 } from "./pages/imoveis/wizard-editar/EditarStep9";  // Documentos (nova)

import { ListaOcupacoes } from "./pages/ocupacoes/ListaOcupacoes";
import { ListaVistorias } from "./pages/vistorias/ListaVistorias";
import { ListaIntervencoes } from "./pages/intervencoes/ListaIntervencoes";
import { ListaDocumentos } from "./pages/documentos/ListaDocumentos";
import { Relatorios } from "./pages/relatorios/Relatorios";
import { VerificarMfa } from "./pages/auth/VerificarMfa";
import { Auditoria } from "./pages/auditoria/Auditoria";
import { Pendencias } from "./pages/pendencias/Pendencias";
import { MapaGIS } from "./pages/MapaGIS";
import { Catalogos } from "./pages/Catalogos";
import { Configuracoes } from "./pages/Configuracoes";
import { MeuPerfil } from "./pages/auth/MeuPerfil";
import { VerificarDocumento } from "./pages/relatorios/VerificarDocumento";
import { GerenciarTiposImovel } from "./pages/admin/GerenciarTiposImovel";
import { GerenciarSituacoesDominiais } from "./pages/admin/GerenciarSituacoesDominiais";
import { GerenciarOrigensCadastro } from "./pages/admin/GerenciarOrigensCadastro";
import { GerenciarNiveisOcupacao } from "./pages/admin/GerenciarNiveisOcupacao";
import { ProtectedRoute } from "./contexts/ProtectedRoute";
import { CadastroImovelProvider } from "./contexts/CadastroImovelContext";
import { RedefinirSenha } from "./pages/auth/RedefinirSenha";

function WizardCriarLayout() {
  return (
    <CadastroImovelProvider>
      <Outlet />
    </CadastroImovelProvider>
  );
}

export const router = createBrowserRouter([
  { path: "/",                     Component: Home },
  { path: "/login",                Component: Login },
  { path: "/mfa",                  Component: VerificarMfa },
  { path: "/auth/recuperar-senha", Component: RecuperarSenha },
  { path: "/auth/criar-conta",     Component: CriarConta },
  { path: "/auth/redefinir-senha", Component: RedefinirSenha },
  // Rota pública — verificação de documento via QR Code (sem autenticação)
  { path: "/relatorios/verificar/:token", Component: VerificarDocumento },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },

      // ── Perfil ──────────────────────────────────────────────────────────────
      { path: "meu-perfil", Component: MeuPerfil },

      // ── Imóveis ─────────────────────────────────────────────────────────────
      { path: "imoveis",           Component: ListaImoveis },
      { path: "imoveis/catalogos", Component: Catalogos },
      { path: "imoveis/sucesso",   Component: SucessoImovel },

      // Wizard de CRIAÇÃO — rotas estáticas antes das dinâmicas
      {
        path: "imoveis/novo",
        Component: WizardCriarLayout,
        children: [
          { path: "etapa-1", Component: CadastroImovelStep1 },
          { path: "etapa-2", Component: CadastroImovelStep2 },
          { path: "etapa-3", Component: CadastroImovelStep3 },
          { path: "etapa-4", Component: CadastroImovelStep4 },
          { path: "etapa-5", Component: CadastroImovelStep5 },
          { path: "etapa-6", Component: CadastroImovelStep6 },
          { path: "etapa-7", Component: CadastroImovelStep7 },
          { path: "etapa-8", Component: CadastroImovelStep8 },
          { path: "etapa-9", Component: CadastroImovelStep9 },
        ],
      },

      // Rotas dinâmicas — APÓS as estáticas
      { path: "imoveis/:id", Component: DetalhesImovel },

      // Wizard de EDIÇÃO — 9 etapas espelhando o cadastro
      {
        path: "imoveis/:id/editar",
        Component: EditarImovel,
        children: [
          { index: true, element: <Navigate to="etapa-1" replace /> },
          { path: "etapa-1", Component: EditarStep1 },  // Identificação
          { path: "etapa-2", Component: EditarStep2 },  // Localização
          { path: "etapa-3", Component: EditarStep3 },  // Classificação
          { path: "etapa-4", Component: EditarStep4 },  // Dados Físicos
          { path: "etapa-5", Component: EditarStep5 },  // Ocupação
          { path: "etapa-6", Component: EditarStep6 },  // Instrumentos (nova)
          { path: "etapa-7", Component: EditarStep7 },  // Dominial (era etapa-6)
          { path: "etapa-8", Component: EditarStep8 },  // Patrimônio (nova)
          { path: "etapa-9", Component: EditarStep9 },  // Documentos (nova)
        ],
      },

      // ── Resto do sistema ────────────────────────────────────────────────────
      { path: "ocupacoes",               Component: ListaOcupacoes },
      { path: "vistorias",               Component: ListaVistorias },
      { path: "intervencoes",            Component: ListaIntervencoes },
      { path: "pendencias",              Component: Pendencias },
      { path: "documentos",              Component: ListaDocumentos },
      { path: "relatorios",              Component: Relatorios },
      { path: "auditoria",               Component: Auditoria },
      { path: "mapa",                    Component: MapaGIS },
      { path: "usuarios",                Component: ListaUsuarios },
      { path: "usuarios/novo",           Component: CadastroUsuario },
      { path: "usuarios/:id/permissoes", Component: Permissoes },
      { path: "usuarios/sucesso",        Component: SucessoUsuario },
      { path: "configuracoes",                       Component: Configuracoes },
      { path: "configuracoes/tipos-imovel",          Component: GerenciarTiposImovel },
      { path: "configuracoes/situacoes-dominiais",   Component: GerenciarSituacoesDominiais },
      { path: "configuracoes/origens-cadastro",      Component: GerenciarOrigensCadastro },
      { path: "configuracoes/niveis-ocupacao",        Component: GerenciarNiveisOcupacao },
    ],
  },
]);