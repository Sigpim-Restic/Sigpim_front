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
import { CadastroImovelStep1 } from "./pages/imoveis/wizard/Step1Identificacao";
import { CadastroImovelStep2 } from "./pages/imoveis/wizard/Step2Localizacao";
import { CadastroImovelStep3 } from "./pages/imoveis/wizard/Step3Classificacao";
import { CadastroImovelStep4 } from "./pages/imoveis/wizard/Step4DadosFisicos";
import { CadastroImovelStep5 } from "./pages/imoveis/wizard/Step5Ocupacao";
import { CadastroImovelStep6 } from "./pages/imoveis/wizard/Step6Anexos";
import { EditarStep1 } from "./pages/imoveis/wizard-editar/EditarStep1";
import { EditarStep2 } from "./pages/imoveis/wizard-editar/EditarStep2";
import { EditarStep3 } from "./pages/imoveis/wizard-editar/EditarStep3";
import { EditarStep4 } from "./pages/imoveis/wizard-editar/EditarStep4";
import { EditarStep5 } from "./pages/imoveis/wizard-editar/EditarStep5";
import { ListaOcupacoes } from "./pages/ocupacoes/ListaOcupacoes";
import { ListaDocumentos } from "./pages/documentos/ListaDocumentos";
import { Relatorios } from "./pages/relatorios/Relatorios";
import { Auditoria } from "./pages/auditoria/Auditoria";
import { MapaGIS } from "./pages/MapaGIS";
import { Catalogos } from "./pages/Catalogos";
import { Configuracoes } from "./pages/Configuracoes";
import { MeuPerfil } from "./pages/auth/MeuPerfil";
import { VerificarDocumento } from "./pages/relatorios/VerificarDocumento";
import { GerenciarTiposImovel } from "./pages/admin/GerenciarTiposImovel";
import { GerenciarSituacoesDominiais } from "./pages/admin/GerenciarSituacoesDominiais";
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

      // ── Perfil do usuário logado ─────────────────────────────────────────
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
        ],
      },

      // Rotas dinâmicas — APÓS as estáticas
      { path: "imoveis/:id", Component: DetalhesImovel },

      // Wizard de EDIÇÃO — aninhado sob EditarImovel (que provê o contexto)
      {
        path: "imoveis/:id/editar",
        Component: EditarImovel,
        children: [
          // Redireciona /imoveis/:id/editar → etapa-1
          { index: true, element: <Navigate to="etapa-1" replace /> },
          { path: "etapa-1", Component: EditarStep1 },
          { path: "etapa-2", Component: EditarStep2 },
          { path: "etapa-3", Component: EditarStep3 },
          { path: "etapa-4", Component: EditarStep4 },
          { path: "etapa-5", Component: EditarStep5 },
        ],
      },

      // ── Resto do sistema ────────────────────────────────────────────────────
      { path: "ocupacoes",               Component: ListaOcupacoes },
      { path: "documentos",              Component: ListaDocumentos },
      { path: "relatorios",              Component: Relatorios },
      { path: "auditoria",               Component: Auditoria },
      { path: "mapa",                    Component: MapaGIS },
      { path: "usuarios",                Component: ListaUsuarios },
      { path: "usuarios/novo",           Component: CadastroUsuario },
      { path: "usuarios/:id/permissoes", Component: Permissoes },
      { path: "usuarios/sucesso",        Component: SucessoUsuario },
      { path: "configuracoes",                    Component: Configuracoes },
      { path: "configuracoes/tipos-imovel",        Component: GerenciarTiposImovel },
      { path: "configuracoes/situacoes-dominiais", Component: GerenciarSituacoesDominiais },
    ],
  },
]);