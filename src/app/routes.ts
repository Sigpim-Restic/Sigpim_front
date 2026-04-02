import { createBrowserRouter } from "react-router";
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
import { Catalogo } from "./pages/imoveis/Catalogo";
import { CadastroImovelCompleto } from "./pages/imoveis/CadastroImovelCompleto";
import { RedirectToStep1 } from "./pages/imoveis/RedirectToStep1";
import { CadastroImovelStep1 } from "./pages/imoveis/wizard/Step1Identificacao";
import { CadastroImovelStep2 } from "./pages/imoveis/wizard/Step2Localizacao";
import { CadastroImovelStep3 } from "./pages/imoveis/wizard/Step3Classificacao";
import { CadastroImovelStep4 } from "./pages/imoveis/wizard/Step4DadosFisicos";
import { CadastroImovelStep5 } from "./pages/imoveis/wizard/Step5Ocupacao";
import { CadastroImovelStep6 } from "./pages/imoveis/wizard/Step6Instrumentos";
import { CadastroImovelStep7 } from "./pages/imoveis/wizard/Step7Dominial";
import { CadastroImovelStep8 } from "./pages/imoveis/wizard/Step8Vistorias";
import { CadastroImovelStep9 } from "./pages/imoveis/wizard/Step9Patrimonio";
import { CadastroImovelStep10 } from "./pages/imoveis/wizard/Step10Anexos";
import { SucessoImovel } from "./pages/imoveis/SucessoImovel";
import { Pendencias } from "./pages/Pendencias";
import { MapaGIS } from "./pages/MapaGIS";
import { Relatorios } from "./pages/Relatorios";
import { Configuracoes } from "./pages/Configuracoes";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/auth/recuperar-senha",
    Component: RecuperarSenha,
  },
  {
    path: "/auth/criar-conta",
    Component: CriarConta,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "usuarios", Component: ListaUsuarios },
      { path: "usuarios/novo", Component: CadastroUsuario },
      { path: "usuarios/:id/permissoes", Component: Permissoes },
      { path: "usuarios/sucesso", Component: SucessoUsuario },
      { path: "imoveis", Component: ListaImoveis },
      { path: "imoveis/catalogo", Component: Catalogo },
      { path: "imoveis/novo/completo", Component: CadastroImovelCompleto },
      { path: "imoveis/novo/etapa-1", Component: CadastroImovelStep1 },
      { path: "imoveis/novo/etapa-2", Component: CadastroImovelStep2 },
      { path: "imoveis/novo/etapa-3", Component: CadastroImovelStep3 },
      { path: "imoveis/novo/etapa-4", Component: CadastroImovelStep4 },
      { path: "imoveis/novo/etapa-5", Component: CadastroImovelStep5 },
      { path: "imoveis/novo/etapa-6", Component: CadastroImovelStep6 },
      { path: "imoveis/novo/etapa-7", Component: CadastroImovelStep7 },
      { path: "imoveis/novo/etapa-8", Component: CadastroImovelStep8 },
      { path: "imoveis/novo/etapa-9", Component: CadastroImovelStep9 },
      { path: "imoveis/novo/etapa-10", Component: CadastroImovelStep10 },
      { path: "imoveis/novo", Component: RedirectToStep1 },
      { path: "imoveis/sucesso", Component: SucessoImovel },
      { path: "pendencias", Component: Pendencias },
      { path: "mapa-gis", Component: MapaGIS },
      { path: "relatorios", Component: Relatorios },
      { path: "configuracoes", Component: Configuracoes },
    ],
  },
]);