import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Building2, Users, Map, FileText,
  ClipboardList, History, Menu, X, Bell,
  ChevronRight, LogOut, User, Settings, ShieldCheck,
  BookOpen, List, FolderOpen, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  { path: "/",              label: "Painel Geral",     icon: LayoutDashboard },
  {
    path: "/imoveis",
    label: "Imóveis",
    icon: Building2,
    submenu: [
      { path: "/imoveis",           label: "Listagem",  icon: List },
      { path: "/imoveis/catalogos", label: "Catálogos", icon: BookOpen },
    ],
  },
  { path: "/ocupacoes",     label: "Ocupações",        icon: ClipboardList },
  { path: "/documentos",   label: "Documentos",        icon: FolderOpen },
  { path: "/relatorios",   label: "Relatórios",        icon: FileText },
  { path: "/auditoria",    label: "Auditoria",         icon: History },
  { path: "/mapa",         label: "Mapa GIS",          icon: Map },
  { path: "/usuarios",     label: "Usuários e Perfis", icon: Users },
  { path: "/configuracoes",label: "Configurações",     icon: Settings },
];

const PERFIL_LABEL: Record<string, string> = {
  ADMINISTRADOR_SISTEMA:     "Adm. Sistema",
  ADMINISTRADOR_PATRIMONIAL: "Adm. Patrimonial",
  CADASTRADOR_SETORIAL:      "Cadastrador Setorial",
  VALIDADOR_DOCUMENTAL:      "Validador Documental",
  VISTORIADOR:               "Vistoriador",
  PLANEJAMENTO:              "Planejamento",
  AUDITOR:                   "Auditor",
};

export function MainLayout() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);  // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);  // desktop toggle

  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  // Largura da sidebar desktop
  const sidebarW = sidebarCollapsed ? "w-16" : "w-64";
  const contentPl = sidebarCollapsed ? "lg:pl-16" : "lg:pl-64";

  // ── Sidebar desktop ─────────────────────────────────────────────────────────
  const DesktopSidebar = () => (
    <div className="flex h-full flex-col">

      {/* Logo / título */}
      <div className={`flex h-20 items-center border-b border-white/10 transition-all duration-300 ${
        sidebarCollapsed ? "justify-center px-0" : "gap-3 px-6"
      }`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-semibold text-white whitespace-nowrap">SIGPIM-SLZ</h1>
            <p className="text-xs text-white/60 whitespace-nowrap">Fase 1 — MVP</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon  = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <div key={item.path}>
              <Link
                to={item.submenu ? item.submenu[0].path : item.path}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all ${
                  sidebarCollapsed ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && (
                  <span className="flex-1 overflow-hidden whitespace-nowrap">{item.label}</span>
                )}
              </Link>

              {/* Submenu — só quando expandido */}
              {!sidebarCollapsed && item.submenu && isActive && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l border-white/15 pl-3">
                  {item.submenu.map((sub) => {
                    const SubIcon    = sub.icon;
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-all ${
                          isSubActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                        }`}
                      >
                        <SubIcon className="h-3.5 w-3.5" />
                        {sub.label}
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
      {!sidebarCollapsed && (
        <div className="border-t border-white/10 p-4">
          <p className="text-center text-xs text-white/40">
            Prefeitura Municipal de São Luís
            <br />
            SIGPIM-SLZ • v1.0 • 2026
          </p>
        </div>
      )}
    </div>
  );

  // ── Sidebar mobile ───────────────────────────────────────────────────────────
  const MobileSidebar = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">SIGPIM-SLZ</h1>
          <p className="text-xs text-white/60">Fase 1 — MVP</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <div key={item.path}>
              <Link
                to={item.submenu ? item.submenu[0].path : item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
              {item.submenu && isActive && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l border-white/15 pl-3">
                  {item.submenu.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-all ${
                          location.pathname === sub.path ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                        }`}
                      >
                        <SubIcon className="h-3.5 w-3.5" />
                        {sub.label}
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
        <p className="text-center text-xs text-white/40">
          Prefeitura Municipal de São Luís<br />SIGPIM-SLZ • v1.0 • 2026
        </p>
      </div>
    </div>
  );

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col lg:bg-[#1351B4] lg:shadow-xl transition-all duration-300 ${sidebarW}`}
      >
        <DesktopSidebar />

        {/* Botão de recolher — fixado na borda direita da sidebar */}
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-3 top-[4.5rem] flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md text-gray-500 hover:text-[#1351B4] hover:border-[#1351B4] transition-colors z-10"
        >
          {sidebarCollapsed
            ? <PanelLeftOpen  className="h-3.5 w-3.5" />
            : <PanelLeftClose className="h-3.5 w-3.5" />
          }
        </button>
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto bg-[#1351B4] shadow-xl lg:hidden">
            <div className="absolute right-3 top-5">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MobileSidebar />
          </aside>
        </>
      )}

      {/* ── Conteúdo principal ── */}
      <div className={`transition-all duration-300 ${contentPl}`}>

        {/* Header */}
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          {/* Hambúrguer mobile */}
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-between gap-4">
            {/* Breadcrumb */}
            <nav className="hidden items-center gap-1.5 text-sm text-gray-500 md:flex">
              {breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-gray-900">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-gray-900">{crumb.label}</Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Notificações + usuário */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1351B4] text-white">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-semibold leading-tight">
                        {usuario?.nomeCompleto ?? usuario?.email ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">
                        {PERFIL_LABEL[usuario?.perfil ?? ""] ?? usuario?.perfil ?? "—"}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs text-gray-500">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <User className="mr-2 h-4 w-4" />Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                    <Settings className="mr-2 h-4 w-4" />Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />Sair do Sistema
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs   = [{ path: "/", label: "Início" }];
  const labels: Record<string, string> = {
    imoveis: "Imóveis", novo: "Novo", ocupacoes: "Ocupações",
    documentos: "Documentos", relatorios: "Relatórios",
    auditoria: "Auditoria", mapa: "Mapa GIS",
    usuarios: "Usuários", configuracoes: "Configurações",
    catalogos: "Catálogos", sucesso: "Cadastro Concluído",
    editar: "Editar",
  };
  let cur = "";
  for (const seg of segments) {
    cur += `/${seg}`;
    if (labels[seg])
      crumbs.push({ path: cur, label: labels[seg] });
    else if (seg.startsWith("etapa-"))
      crumbs.push({ path: cur, label: `Etapa ${seg.split("-")[1]}` });
  }
  return crumbs;
}