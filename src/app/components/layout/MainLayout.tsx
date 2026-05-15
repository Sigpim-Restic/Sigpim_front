import React, { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useIdleTimer } from "../../hooks/useIdleTimer";
import { configuracoesSistemaApi } from "../../api/configuracoes-sistema";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "../ui/alert-dialog";
import {
  LayoutDashboard, Building2, Users, Map, FileText,
  ClipboardList, ClipboardCheck, Wrench, History, Menu, X, Bell, RefreshCw,
  ChevronRight, LogOut, User, Settings,
  BookOpen, List, FolderOpen, PanelLeftClose, PanelLeftOpen, Shield,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../api/client";
import { pendenciasApi } from "../../api/pendencias";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Perfil =
  | "ADMINISTRADOR_SISTEMA"
  | "ADMINISTRADOR_PATRIMONIAL"
  | "CADASTRADOR_SETORIAL"
  | "VALIDADOR_DOCUMENTAL"
  | "VISTORIADOR"
  | "PLANEJAMENTO"
  | "AUDITOR";

interface SubItem {
  path: string;
  label: string;
  icon: React.ElementType;
  perfisPermitidos?: Perfil[];
  permissaoBanco?: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  perfisPermitidos?: Perfil[];
  permissaoBanco?: string;
  submenu?: SubItem[];
}

const ADMINS: Perfil[] = ["ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL"];

const menuItems: MenuItem[] = [
  {
    path:  "/dashboard",
    label: "Painel Geral",
    icon:  LayoutDashboard,
  },
  {
    path:  "/dashboard/imoveis",
    label: "Imóveis",
    icon:  Building2,
    submenu: [
      { path: "/dashboard/imoveis",          label: "Listagem",  icon: List },
      { path: "/dashboard/imoveis/catalogos", label: "Catálogos", icon: BookOpen, perfisPermitidos: ADMINS },
    ],
  },
  {
    path:  "/dashboard/ocupacoes",
    label: "Ocupações",
    icon:  ClipboardList,
  },
  {
    path:  "/dashboard/vistorias",
    label: "Vistorias",
    icon:  ClipboardCheck,
    perfisPermitidos: [
      "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL",
      "VALIDADOR_DOCUMENTAL", "VISTORIADOR", "PLANEJAMENTO", "AUDITOR",
    ] as Perfil[],
  },
  {
    path:  "/dashboard/intervencoes",
    label: "Intervenções",
    icon:  Wrench,
    perfisPermitidos: [
      "ADMINISTRADOR_PATRIMONIAL", "CADASTRADOR_SETORIAL",
      "VALIDADOR_DOCUMENTAL", "VISTORIADOR", "PLANEJAMENTO", "AUDITOR",
    ] as Perfil[],
  },
  {
    path:  "/dashboard/pendencias",
    label: "Pendências",
    icon:  AlertTriangle,
  },
  {
    path:  "/dashboard/documentos",
    label: "Documentos",
    icon:  FolderOpen,
  },
  {
    path:  "/dashboard/relatorios",
    label: "Relatórios",
    icon:  FileText,
    perfisPermitidos: [
      "ADMINISTRADOR_SISTEMA", "ADMINISTRADOR_PATRIMONIAL",
      "CADASTRADOR_SETORIAL", "PLANEJAMENTO", "AUDITOR",
    ],
    permissaoBanco: "relatorios:visualizar",
  },
  {
    path:  "/dashboard/auditoria",
    label: "Auditoria",
    icon:  History,
    perfisPermitidos: ["ADMINISTRADOR_SISTEMA", "AUDITOR"],
    permissaoBanco: "auditoria:visualizar",
  },
  {
    path:  "/dashboard/mapa",
    label: "Mapa GIS",
    icon:  Map,
  },
  {
    path:  "/dashboard/usuarios",
    label: "Usuários e Perfis",
    icon:  Users,
    perfisPermitidos: ["ADMINISTRADOR_SISTEMA"],
    permissaoBanco: "usuarios:visualizar",
  },
  {
    path:  "/dashboard/permissoes",
    label: "Perfis e Permissões",
    icon:  Shield,
    perfisPermitidos: ["ADMINISTRADOR_SISTEMA"],
    permissaoBanco: "usuarios:visualizar",
  },
  {
    path:  "/dashboard/configuracoes",
    label: "Configurações",
    icon:  Settings,
    perfisPermitidos: ["ADMINISTRADOR_SISTEMA"],
    permissaoBanco: "configuracoes:visualizar",
  },
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

function filtrarMenu(items: MenuItem[], perfil: string, permissoesPerfil: string[] | null): MenuItem[] {
  const temNoBanco = (permissao: string | undefined) =>
    !!permissao && (permissoesPerfil?.includes(permissao) ?? false);

  const itemVisivel = (item: MenuItem | SubItem): boolean => {
    if (!item.perfisPermitidos) return true;
    if (item.perfisPermitidos.includes(perfil as Perfil)) return true;
    return temNoBanco(item.permissaoBanco);
  };

  return items
    .filter(itemVisivel)
    .map((item) => {
      if (!item.submenu) return item;
      return {
        ...item,
        submenu: item.submenu.filter(itemVisivel),
      };
    });
}
// ── Componente principal ───────────────────────────────────────────────────────

export function MainLayout() {
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [sidebarCollapsed,  setSidebarCollapsed]  = useState(false);
  const [alertas,           setAlertas]           = useState<AlertaItem[]>([]);
  const [totalNaoLidos,     setTotalNaoLidos]     = useState(0);
  const [painelAberto,      setPainelAberto]      = useState(false);
  const [carregandoAlertas, setCarregandoAlertas] = useState(false);
  const [pendenciasCount,   setPendenciasCount]   = useState(0);

  // 25002500 Idle timer 250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500250025002500
  const [idleTimeoutMs,  setIdleTimeoutMs]  = useState(30 * 60 * 1000); // default 30 min
  const [idleWarningMs,  setIdleWarningMs]  = useState(5  * 60 * 1000); // default 5 min
  const [idleWarning,    setIdleWarning]    = useState(false);
  const [idleCountdown,  setIdleCountdown]  = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const perfil         = usuario?.perfil ?? "";
  const permissoesPerfil = usuario?.permissoesPerfil ?? null;
  const itensFiltrados = filtrarMenu(menuItems, perfil, permissoesPerfil);

  const handleLogout = () => { logout(); navigate("/login"); };

  const carregarAlertas = useCallback(async () => {
    setCarregandoAlertas(true);
    try {
      const dados = await api.get<AlertaItem[]>("/alertas");
      setAlertas(dados);
      setTotalNaoLidos(dados.filter((a) => !a.lido).length);
    } catch { /* silencia */ } finally {
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

  useEffect(() => { carregarAlertas(); }, [carregarAlertas, location.pathname]);

  // Carrega configurações de inatividade do servidor
  useEffect(() => {
    configuracoesSistemaApi.getSessionIdle()
      .then((cfg) => {
        if (cfg.timeoutMinutes > 0) {
          setIdleTimeoutMs(cfg.timeoutMinutes  * 60 * 1000);
          setIdleWarningMs(cfg.warningMinutes  * 60 * 1000);
        } else {
          setIdleTimeoutMs(0); // desativado pelo admin
        }
      })
      .catch(() => {}); // usa o default local em caso de erro
  }, []);

  const handleIdleExpire = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIdleWarning(false);
    localStorage.removeItem("sigpim_token");
    localStorage.removeItem("sigpim_usuario");
    window.dispatchEvent(new CustomEvent("sigpim:sessao-expirada", {
      detail: { returnTo: window.location.pathname + window.location.search },
    }));
  }, []);

  const handleIdleWarn = useCallback(() => {
    const warnSecs = Math.floor(idleWarningMs / 1000);
    setIdleCountdown(warnSecs);
    setIdleWarning(true);
    countdownRef.current = setInterval(() => {
      setIdleCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [idleWarningMs]);

  const handleIdleReset = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIdleWarning(false);
  }, []);

  useIdleTimer({
    timeoutMs: idleTimeoutMs,
    warningMs: idleWarningMs,
    onWarn:    handleIdleWarn,
    onReset:   handleIdleReset,
    onExpire:  handleIdleExpire,
    enabled:   idleTimeoutMs > 0,
  });

  // Busca contagem de pendências críticas para o badge do sidebar
  useEffect(() => {
    pendenciasApi.listarMinhas("ABERTA", 0, 100)
      .then((res) => {
        const criticas = res.content.filter((p) => p.prioridade === "CRITICA").length;
        setPendenciasCount(criticas);
      })
      .catch(() => {});
  }, [location.pathname]);

  const sidebarW  = sidebarCollapsed ? "w-[68px]" : "w-60";
  const contentPl = sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-60";

  // ── Nav items ───────────────────────────────────────────────────────────────

  function NavItems({ collapsed = false, onNavClick }: { collapsed?: boolean; onNavClick?: () => void }) {
    return (
      <>
        {itensFiltrados.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <div key={item.path}>
              <Link
                to={item.submenu ? item.submenu[0].path : item.path}
                title={collapsed ? item.label : undefined}
                onClick={onNavClick}
                className={`flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                  collapsed ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-[#1351B4]/10 text-[#1351B4]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1351B4]" : "text-slate-400"}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 overflow-hidden whitespace-nowrap">{item.label}</span>
                    {item.path === "/dashboard/pendencias" && pendenciasCount > 0 && (
                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {pendenciasCount > 9 ? "9+" : pendenciasCount}
                      </span>
                    )}
                  </>
                )}
                {!collapsed && isActive && item.submenu && (
                  <ChevronRight className="h-3.5 w-3.5 text-[#1351B4]/60" />
                )}
              </Link>

              {/* Submenu */}
              {!collapsed && item.submenu && isActive && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l-2 border-[#1351B4]/15 pl-3">
                  {item.submenu.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={onNavClick}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                          isSubActive
                            ? "bg-[#1351B4]/10 text-[#1351B4]"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
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
      </>
    );
  }

  const breadcrumbs = getBreadcrumbs(location.pathname);

  // Título dinâmico da aba — último breadcrumb ou "SIGPIM"
  useEffect(() => {
    const ultimo = breadcrumbs[breadcrumbs.length - 1];
    document.title = ultimo && ultimo.label !== "Início"
      ? `${ultimo.label} · SIGPIM`
      : "SIGPIM";
  }, [breadcrumbs]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col border-r border-slate-200 bg-white transition-all duration-300 ${sidebarW}`}
      >
        <div className="flex h-full flex-col">

          {/* Logo */}
          {/* Item 10/11: referências a "São Luís" e "SIGPIM-SLZ" removidas */}
          <div className={`flex h-16 items-center border-b border-slate-100 transition-all duration-300 ${
            sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"
          }`}>
            {sidebarCollapsed ? (
              /* Brasão — substituir pelo ativo institucional definitivo quando disponível */
              /* <img src="/assets/logo-sigpim.png" alt="SIGPIM" className="h-8 w-8 object-contain" /> */
              <img src="/assets/logo-sigpim.png" alt="SIGPIM" className="h-8 w-8 object-contain" />
            ) : (
              <>
                {/* <img src="/assets/logo-sigpim.png" alt="Brasão" className="h-9 w-auto object-contain shrink-0" /> */}
                <img src="/assets/logo-sigpim.png" alt="Brasão" className="h-9 w-auto object-contain shrink-0" />
                <div className="leading-tight overflow-hidden">
                  <p className="text-[14px] font-bold tracking-tight text-[#1351B4] whitespace-nowrap">SIGPIM</p>
                  {/* Subtítulo institucional — preencher quando definido */}
                  {/* <p className="text-[11px] text-slate-400 whitespace-nowrap">Prefeitura de São Luís</p> */}
                </div>
              </>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
            <NavItems collapsed={sidebarCollapsed} />
          </nav>

          {/* Rodapé */}
          {!sidebarCollapsed && (
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {/* Item 10/11: "Prefeitura Municipal de São Luís" e "SIGPIM-SLZ" removidos */}
                {/* Prefeitura Municipal de São Luís */}
                SIGPIM · v2.0 · 2026
              </p>
            </div>
          )}
        </div>

        {/* Botão recolher */}
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-3 top-[4.25rem] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm text-slate-400 hover:text-[#1351B4] hover:border-[#1351B4]/40 transition-colors z-10"
        >
          {sidebarCollapsed
            ? <PanelLeftOpen  className="h-3.5 w-3.5" />
            : <PanelLeftClose className="h-3.5 w-3.5" />
          }
        </button>
      </aside>

      {/* ── Mobile overlay ──────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-60 flex flex-col border-r border-slate-200 bg-white shadow-xl lg:hidden">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-3">
                {/* <img src="/assets/logo-sigpim.png" alt="Brasão" className="h-9 w-auto object-contain" /> */}
                <img src="/assets/logo-sigpim.png" alt="Brasão" className="h-9 w-auto object-contain" />
                <div className="leading-tight">
                  <p className="text-[14px] font-bold tracking-tight text-[#1351B4]">SIGPIM</p>
                  {/* <p className="text-[11px] text-slate-400">Prefeitura de São Luís</p> */}
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
              <NavItems onNavClick={() => setSidebarOpen(false)} />
            </nav>
            <div className="border-t border-slate-100 px-4 py-3">
              <p className="text-[10px] text-slate-400">
                {/* Prefeitura Municipal de São Luís · SIGPIM-SLZ · v2.0 · 2026 */}
                SIGPIM · v2.0 · 2026
              </p>
            </div>
          </aside>
        </>
      )}

      {/* ── Conteúdo principal ──────────────────────────────────────────────── */}
      <div className={`transition-all duration-300 ${contentPl}`}>

        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-slate-700 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-between gap-4">

            {/* Breadcrumb */}
            <nav className="hidden items-center gap-1 text-sm text-slate-500 md:flex">
              {breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-slate-900">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-slate-700 transition-colors">{crumb.label}</Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Notificações + usuário */}
            <div className="flex items-center gap-1.5">

              {/* Sino */}
              <DropdownMenu open={painelAberto} onOpenChange={(v) => { setPainelAberto(v); if (v) carregarAlertas(); }}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
                    <Bell className="h-[18px] w-[18px]" />
                    {totalNaoLidos > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {totalNaoLidos > 9 ? "9+" : totalNaoLidos}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border-slate-200 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Notificações</p>
                      {totalNaoLidos > 0 && (
                        <p className="text-xs text-slate-500">{totalNaoLidos} não lida(s)</p>
                      )}
                    </div>
                    {totalNaoLidos > 0 && (
                      <button onClick={marcarTodosLidos} className="text-xs text-[#1351B4] hover:underline">
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {carregandoAlertas && (
                      <div className="flex items-center justify-center py-8 text-slate-400">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-xs">Carregando...</span>
                      </div>
                    )}
                    {!carregandoAlertas && alertas.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400">
                        <Bell className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                        Nenhuma notificação.
                      </div>
                    )}
                    {!carregandoAlertas && alertas.map((alerta) => (
                      <div
                        key={alerta.id}
                        onClick={() => { if (!alerta.lido) marcarComoLido(alerta.id); }}
                        className={`flex gap-3 border-b border-slate-100 px-4 py-3 cursor-pointer transition-colors ${
                          alerta.lido ? "bg-white hover:bg-slate-50" : "bg-blue-50/60 hover:bg-blue-50"
                        }`}
                      >
                        <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${alerta.lido ? "bg-transparent" : "bg-[#1351B4]"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${alerta.lido ? "text-slate-600" : "text-slate-900"}`}>
                            {alerta.titulo}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alerta.descricao}</p>
                          {alerta.codigoSigpim && (
                            <p className="text-xs text-[#1351B4] font-mono mt-0.5">{alerta.codigoSigpim}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(alerta.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {alertas.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-2 text-center">
                      <p className="text-xs text-slate-400">{alertas.length} notificação(ões) no total</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hover:bg-slate-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1351B4]/10 text-[#1351B4] ring-2 ring-[#1351B4]/20 overflow-hidden">
                      {usuario?.fotoPerfil ? (
                        <img
                          src={usuario.fotoPerfil}
                          alt={usuario.nomeCompleto ?? "Foto"}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-semibold leading-tight text-slate-900">
                        {usuario?.nomeCompleto ?? usuario?.email ?? "—"}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {PERFIL_LABEL[usuario?.perfil ?? ""] ?? usuario?.perfil ?? "—"}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-200 shadow-lg">
                  <DropdownMenuLabel className="text-xs text-slate-500">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => navigate("/dashboard/meu-perfil")} className="gap-2">
                    <User className="h-4 w-4" />Meu Perfil
                  </DropdownMenuItem>
                  {perfil === "ADMINISTRADOR_SISTEMA" && (
                    <DropdownMenuItem onClick={() => navigate("/dashboard/configuracoes")} className="gap-2">
                      <Settings className="h-4 w-4" />Configurações
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />Sair do Sistema
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

      {/* ── Modal de aviso de inatividade ────────────────────────────────────── */}
      <AlertDialog open={idleWarning}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Sessão prestes a expirar</AlertDialogTitle>
            <AlertDialogDescription>
              Você está inativo há algum tempo. Sua sessão será encerrada em{" "}
              <span className="font-semibold text-slate-900">{idleCountdown}s</span>.
              Clique em "Continuar" para permanecer conectado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
              Sair agora
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleIdleReset}
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs   = [{ path: "/dashboard", label: "Início" }];
  const labels: Record<string, string> = {
    imoveis: "Imóveis", novo: "Novo", ocupacoes: "Ocupações",
    pendencias: "Pendências",
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