import React, { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Building2, Users, Map, FileText,
  ClipboardList, History, Menu, X, Bell, RefreshCw,
  ChevronRight, LogOut, User, Settings,
  BookOpen, List, FolderOpen, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { Logo } from "../Logo";
import { Button } from "../ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/client";

const menuItems = [
  { path: "/dashboard",              label: "Painel Geral",     icon: LayoutDashboard },
  {
    path: "/dashboard/imoveis",
    label: "Imóveis",
    icon: Building2,
    submenu: [
      { path: "/dashboard/imoveis",           label: "Listagem",  icon: List },
      { path: "/dashboard/imoveis/catalogos", label: "Catálogos", icon: BookOpen },
    ],
  },
  { path: "/dashboard/ocupacoes",     label: "Ocupações",        icon: ClipboardList },
  { path: "/dashboard/documentos",   label: "Documentos",        icon: FolderOpen },
  { path: "/dashboard/relatorios",   label: "Relatórios",        icon: FileText },
  { path: "/dashboard/auditoria",    label: "Auditoria",         icon: History },
  { path: "/dashboard/mapa",         label: "Mapa GIS",          icon: Map },
  { path: "/dashboard/usuarios",     label: "Usuários e Perfis", icon: Users },
  { path: "/dashboard/configuracoes",label: "Configurações",     icon: Settings },
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

interface AlertaItem {
  id: number;
  titulo: string;
  descricao: string;
  lido: boolean;
  criadoEm: string;
  codigoSigpim?: string;
  nomeImovel?: string;
}

export function MainLayout() {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alertas,          setAlertas]          = useState<AlertaItem[]>([]);
  const [totalNaoLidos,    setTotalNaoLidos]    = useState(0);
  const [painelAberto,     setPainelAberto]     = useState(false);
  const [carregandoAlertas, setCarregandoAlertas] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  const carregarAlertas = useCallback(async () => {
    setCarregandoAlertas(true);
    try {
      const dados = await api.get<AlertaItem[]>("/alertas");
      setAlertas(dados);
      setTotalNaoLidos(dados.filter((a) => !a.lido).length);
    } catch {
      // silencia — alertas são secundários
    } finally {
      setCarregandoAlertas(false);
    }
  }, []);

  const marcarComoLido = async (id: number) => {
    try {
      await api.patch(`/alertas/${id}/lido`);
      setAlertas((prev) => prev.map((a) => a.id === id ? { ...a, lido: true } : a));
      setTotalNaoLidos((n) => Math.max(0, n - 1));
    } catch { /* silencia */ }
  };

  const marcarTodosLidos = async () => {
    try {
      await api.patch("/alertas/marcar-todos-lidos");
      setAlertas((prev) => prev.map((a) => ({ ...a, lido: true })));
      setTotalNaoLidos(0);
    } catch { /* silencia */ }
  };

  // Carrega alertas ao montar e a cada troca de página
  useEffect(() => { carregarAlertas(); }, [carregarAlertas, location.pathname]);

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
        <Logo size="small" variant={sidebarCollapsed ? "icon-only" : "with-text"} />
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
            SIGPIM-SLZ • v2.0 • 2026
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
          <p className="text-xs text-white/60">Fase 2</p>
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
          Prefeitura Municipal de São Luís<br />SIGPIM-SLZ • v2.0 • 2026
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
              <DropdownMenu open={painelAberto} onOpenChange={(v) => { setPainelAberto(v); if (v) carregarAlertas(); }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4.5 w-4.5" />
                    {totalNaoLidos > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {totalNaoLidos > 9 ? "9+" : totalNaoLidos}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Notificações</p>
                      {totalNaoLidos > 0 && (
                        <p className="text-xs text-gray-500">{totalNaoLidos} não lida(s)</p>
                      )}
                    </div>
                    {totalNaoLidos > 0 && (
                      <button
                        onClick={marcarTodosLidos}
                        className="text-xs text-[#1351B4] hover:underline"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  {/* Lista de alertas */}
                  <div className="max-h-80 overflow-y-auto">
                    {carregandoAlertas && (
                      <div className="flex items-center justify-center py-8 text-gray-400">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-xs">Carregando...</span>
                      </div>
                    )}
                    {!carregandoAlertas && alertas.length === 0 && (
                      <div className="py-8 text-center text-xs text-gray-400">
                        <Bell className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                        Nenhuma notificação.
                      </div>
                    )}
                    {!carregandoAlertas && alertas.map((alerta) => (
                      <div
                        key={alerta.id}
                        onClick={() => { if (!alerta.lido) marcarComoLido(alerta.id); }}
                        className={`flex gap-3 border-b px-4 py-3 cursor-pointer transition-colors ${
                          alerta.lido
                            ? "bg-white hover:bg-gray-50"
                            : "bg-blue-50 hover:bg-blue-100"
                        }`}
                      >
                        <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${alerta.lido ? "bg-transparent" : "bg-[#1351B4]"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${alerta.lido ? "text-gray-700" : "text-gray-900"}`}>
                            {alerta.titulo}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{alerta.descricao}</p>
                          {alerta.codigoSigpim && (
                            <p className="text-xs text-[#1351B4] font-mono mt-0.5">{alerta.codigoSigpim}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(alerta.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rodapé */}
                  {alertas.length > 0 && (
                    <div className="border-t px-4 py-2 text-center">
                      <p className="text-xs text-gray-400">{alertas.length} notificação(ões) no total</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

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
                  <DropdownMenuItem onClick={() => navigate("/dashboard/meu-perfil")}>
                    <User className="mr-2 h-4 w-4" />Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/configuracoes")}>
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
  const crumbs   = [{ path: "/dashboard", label: "Início" }];
  const labels: Record<string, string> = {
    imoveis: "Imóveis", novo: "Novo", ocupacoes: "Ocupações",
    documentos: "Documentos", relatorios: "Relatórios",
    auditoria: "Auditoria", mapa: "Mapa GIS",
    usuarios: "Usuários", configuracoes: "Configurações",
    catalogos: "Catálogos", sucesso: "Cadastro Concluído",
    editar: "Editar", vistorias: "Vistorias", intervencoes: "Intervenções",
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