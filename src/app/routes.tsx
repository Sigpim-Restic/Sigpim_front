import React from "react";
import { createBrowserRouter, Outlet } from "react-router";
import { MainLayout } from "./components/layout/MainLayout";
import { Login } from "./pages/auth/Login";
import { RecuperarSenha } from "./pages/auth/RecuperarSenha";
import { CriarConta } from "./pages/auth/CriarConta";
import { Dashboard } from "./pages/Dashboard";
import { ListaUsuarios } from "./pages/admin/ListaUsuarios";
import { CadastroUsuario } from "./pages/admin/CadastroUsuario";
import { Permissoes } from "./pages/admin/Permissoes";
import { SucessoUsuario } from "./pages/admin/SucessoUsuario";
import { ListaImoveis } from "./pages/imoveis/ListaImoveis";
import { SucessoImovel } from "./pages/imoveis/SucessoImovel";
import { CadastroImovelStep1 } from "./pages/imoveis/wizard/Step1Identificacao";
import { CadastroImovelStep2 } from "./pages/imoveis/wizard/Step2Localizacao";
import { CadastroImovelStep3 } from "./pages/imoveis/wizard/Step3Classificacao";
import { CadastroImovelStep4 } from "./pages/imoveis/wizard/Step4DadosFisicos";
import { CadastroImovelStep5 } from "./pages/imoveis/wizard/Step5Ocupacao";
import { CadastroImovelStep6 } from "./pages/imoveis/wizard/Step6Anexos";
import { ListaOcupacoes } from "./pages/ocupacoes/ListaOcupacoes";
import { ListaDocumentos } from "./pages/documentos/ListaDocumentos";
import { Relatorios } from "./pages/relatorios/Relatorios";
import { Auditoria } from "./pages/auditoria/Auditoria";
import { MapaGIS } from "./pages/MapaGIS";
import { Catalogos } from "./pages/Catalogos";
import { Configuracoes } from "./pages/Configuracoes";
import { ProtectedRoute } from "./contexts/ProtectedRoute";
import { CadastroImovelProvider } from "./contexts/CadastroImovelContext";

// Provider do wizard — usa Outlet para renderizar as etapas filhas
function WizardLayout() {
  return (
    <CadastroImovelProvider>
      <Outlet />
    </CadastroImovelProvider>
  );
}

export const router = createBrowserRouter([
  { path: "/login",                Component: Login },
  { path: "/auth/recuperar-senha", Component: RecuperarSenha },
  { path: "/auth/criar-conta",     Component: CriarConta },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,                         Component: Dashboard },
      { path: "imoveis",                     Component: ListaImoveis },
      { path: "imoveis/catalogos",           Component: Catalogos },
      { path: "imoveis/sucesso",             Component: SucessoImovel },
      {
        path: "imoveis/novo",
        Component: WizardLayout,
        children: [
          { path: "etapa-1", Component: CadastroImovelStep1 },
          { path: "etapa-2", Component: CadastroImovelStep2 },
          { path: "etapa-3", Component: CadastroImovelStep3 },
          { path: "etapa-4", Component: CadastroImovelStep4 },
          { path: "etapa-5", Component: CadastroImovelStep5 },
          { path: "etapa-6", Component: CadastroImovelStep6 },
        ],
      },
      { path: "ocupacoes",                   Component: ListaOcupacoes },
      { path: "documentos",                  Component: ListaDocumentos },
      { path: "relatorios",                  Component: Relatorios },
      { path: "auditoria",                   Component: Auditoria },
      { path: "mapa",                        Component: MapaGIS },
      { path: "usuarios",                    Component: ListaUsuarios },
      { path: "usuarios/novo",               Component: CadastroUsuario },
      { path: "usuarios/:id/permissoes",     Component: Permissoes },
      { path: "usuarios/sucesso",            Component: SucessoUsuario },
      { path: "configuracoes",               Component: Configuracoes },
    ],
  },
]);
