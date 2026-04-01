import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Building2,
  AlertCircle,
  Map,
  FileText,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  List,
  BookOpen,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const menuItems = [
  { path: "/", label: "Painel Geral", icon: LayoutDashboard },
  {
    path: "/imoveis",
    label: "Imóveis",
    icon: Building2,
    submenu: [
      { path: "/imoveis", label: "Listagem", icon: List },
      { path: "/imoveis/catalogo", label: "Catálogo", icon: BookOpen },
    ],
  },
  { path: "/pendencias", label: "Pendências", icon: AlertCircle, badge: 12 },
  { path: "/mapa-gis", label: "Mapa GIS", icon: Map },
  { path: "/relatorios", label: "Relatórios", icon: FileText },
  { path: "/usuarios", label: "Usuários e Perfis", icon: Users },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const currentPage = menuItems.find((item) => item.path === location.pathname);
  const breadcrumbs = getBreadcrumbs(location.pathname);

  const toggleMenu = (path: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-[#1351B4] lg:shadow-xl">
        <div className="flex h-full flex-col">
          {/* Logo e Título */}
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">SIGPIM-SLZ</h1>
              <p className="text-xs text-white/70">
                Sistema Integrado de Gestão
              </p>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== "/" && location.pathname.startsWith(item.path));
              
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-yellow-500 text-gray-900 hover:bg-yellow-500">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                  {item.submenu && (
                    <div className="ml-8">
                      {item.submenu.map((subitem) => {
                        const SubIcon = subitem.icon;
                        const isSubActive = location.pathname === subitem.path || 
                          (subitem.path !== "/" && location.pathname.startsWith(subitem.path));
                        
                        return (
                          <Link
                            key={subitem.path}
                            to={subitem.path}
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                              isSubActive
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-white/80 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <SubIcon className="h-5 w-5 shrink-0" />
                            <span className="flex-1">{subitem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Rodapé */}
          <div className="border-t border-white/10 p-4">
            <p className="text-xs text-white/50 text-center">
              Prefeitura Municipal de São Luís
              <br />
              Versão 1.0.0 - 2026
            </p>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-[#1351B4] shadow-xl lg:hidden">
            <div className="flex h-full flex-col">
              <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-white">
                      SIGPIM-SLZ
                    </h1>
                    <p className="text-xs text-white/70">
                      Sistema Integrado de Gestão
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 px-3 py-6">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                    (item.path !== "/" && location.pathname.startsWith(item.path));
                  
                  return (
                    <div key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge className="bg-yellow-500 text-gray-900 hover:bg-yellow-500">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                      {item.submenu && (
                        <div className="ml-8">
                          {item.submenu.map((subitem) => {
                            const SubIcon = subitem.icon;
                            const isSubActive = location.pathname === subitem.path || 
                              (subitem.path !== "/" && location.pathname.startsWith(subitem.path));
                            
                            return (
                              <Link
                                key={subitem.path}
                                to={subitem.path}
                                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                                  isSubActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-white/80 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <SubIcon className="h-5 w-5 shrink-0" />
                                <span className="flex-1">{subitem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 p-4">
                <p className="text-xs text-white/50 text-center">
                  Prefeitura Municipal de São Luís
                  <br />
                  Versão 1.0.0 - 2026
                </p>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </button>

          <div className="flex flex-1 items-center justify-between gap-4">
            {/* Breadcrumb */}
            <div className="flex flex-col">
              <nav className="flex items-center gap-2 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="font-medium text-gray-900">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link to={crumb.path} className="hover:text-gray-900">
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
              {currentPage && (
                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                  {currentPage.label}
                </h2>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Informações do Órgão */}
              <div className="hidden items-center gap-3 border-r border-gray-200 pr-4 xl:flex">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-900">
                    Secretaria de Planejamento
                  </p>
                  <p className="text-xs text-gray-500">SEPLAN - São Luís/MA</p>
                </div>
              </div>

              {/* Notificações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="space-y-2 p-2">
                    <div className="rounded-lg bg-yellow-50 p-3 text-sm">
                      <p className="font-medium text-yellow-900">
                        12 pendências aguardando validação
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Há imóveis com documentação incompleta
                      </p>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Perfil */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1351B4] text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-medium">Maria Silva</p>
                      <p className="text-xs text-gray-500">
                        SEPLAN - Administrador
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair do Sistema
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ path: "/", label: "Início" }];

  if (segments.length === 0) return breadcrumbs;

  const routes: Record<string, string> = {
    usuarios: "Usuários e Perfis",
    novo: "Novo Cadastro",
    permissoes: "Permissões",
    sucesso: "Sucesso",
    imoveis: "Imóveis",
    catalogo: "Catálogo",
    pendencias: "Pendências",
    "mapa-gis": "Mapa GIS",
    relatorios: "Relatórios",
    configuracoes: "Configurações",
  };

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Para etapas do wizard
    if (segment.startsWith("etapa-")) {
      const stepNumber = segment.split("-")[1];
      breadcrumbs.push({
        path: currentPath,
        label: `Etapa ${stepNumber}`,
      });
    } else if (routes[segment]) {
      breadcrumbs.push({
        path: currentPath,
        label: routes[segment],
      });
    } else if (!isNaN(Number(segment))) {
      // IDs numéricos
      breadcrumbs.push({
        path: currentPath,
        label: `#${segment}`,
      });
    }
  });

  return breadcrumbs;
}