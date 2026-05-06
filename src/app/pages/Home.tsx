import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Building2, MapPin, Shield, FileText, Users, TrendingUp,
  Menu, X, ArrowRight, Check, CheckCircle, Mail, Phone, ExternalLink,
  Lock, Info, Layers, History, Zap, Eye, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card, CardContent,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

// ── Leaflet ──────────────────────────────────────────────────────────────────
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl       from "leaflet/dist/images/marker-icon.png";
import shadowUrl     from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default icon bug with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const markerIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#1351B4;border:2px solid white;box-shadow:0 2px 8px rgba(8,38,110,.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const SLZ: [number, number] = [-2.5297, -44.3028];

// ── Public API — no auth required ────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

interface ImovelPublico {
  id: number;
  nomeReferencia: string | null;
  nomeTipoImovel: string | null;
  latitude: number;
  longitude: number;
}

async function fetchImoveisPublicos(): Promise<ImovelPublico[]> {
  try {
    const res = await fetch(`${BASE_URL}/imoveis/publico`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Home() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [menuMobileAberto,  setMenuMobileAberto]  = useState(false);
  const [imoveis,           setImoveis]           = useState<ImovelPublico[]>([]);
  const [identificador,     setIdentificador]     = useState("");
  const [senha,             setSenha]             = useState("");
  const [erro,              setErro]              = useState<string | null>(null);

  useEffect(() => {
    fetchImoveisPublicos().then(setImoveis);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    try {
      const resultado = await login({ identificador, senha });
      if (resultado.mfaRequired && resultado.mfaToken) {
        navigate("/mfa", { state: { mfaToken: resultado.mfaToken } });
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao servidor."
      );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased font-sans">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-sigpim.png" alt="SIGPIM" className="h-11 w-auto object-contain" />
            <div className="leading-tight">
              <h1 className="text-[15px] font-bold tracking-tight text-[#1351B4]">SIGPIM</h1>
              <p className="text-[11px] font-medium text-slate-500">SEMAD/SIN</p>
            </div>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <a href="#sobre" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Sobre</a>
            <a href="#funcionalidades" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Funcionalidades</a>
            <a href="#mapa" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Mapa Público</a>
            <a href="#objetivos" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#1351B4]">Objetivos</a>
            <div className="mx-2 h-6 w-px bg-slate-200" />
            <Button
              variant="ghost"
              className="text-slate-700 hover:text-[#1351B4]"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              className="ml-1 gap-1.5 bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={() => navigate("/auth/criar-conta")}
            >
              Criar Conta
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <button
            onClick={() => setMenuMobileAberto(!menuMobileAberto)}
            className="text-slate-700 md:hidden"
            aria-label="menu"
          >
            {menuMobileAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {menuMobileAberto && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              <a href="#sobre"            className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Sobre</a>
              <a href="#funcionalidades"  className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Funcionalidades</a>
              <a href="#mapa"             className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Mapa Público</a>
              <a href="#objetivos"        className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => setMenuMobileAberto(false)}>Objetivos</a>
              <div className="my-2 h-px bg-slate-200" />
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-700"
                onClick={() => { navigate("/login"); setMenuMobileAberto(false); }}
              >
                Login
              </Button>
              <Button
                className="w-full bg-[#1351B4] hover:bg-[#0c3b8d]"
                onClick={() => { navigate("/auth/criar-conta"); setMenuMobileAberto(false); }}
              >
                Criar Conta
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero — Login Card ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1351B4] text-white">
        {/* grid pattern */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-cyan-300/[0.08] blur-3xl" />
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-white/[0.05] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              v1.0.0 · em produção
            </span>

            <h2 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[58px]">
              Bem-vindo,<br/>
              <span className="text-cyan-200">servidor público</span>.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
              O sistema oficial de gestão do patrimônio imobiliário municipal — cadastre, atualize e fiscalize imóveis públicos com segurança e rastreabilidade.
            </p>

            <ul className="mt-8 grid max-w-md gap-3 sm:grid-cols-2">
              {[
                "Wizard de cadastro guiado",
                "Mapeamento GIS integrado",
                "Trilhas de auditoria",
                "Relatórios gerenciais",
              ].map((l) => (
                <li key={l} className="flex items-center gap-2 text-sm text-blue-50">
                  <Check className="h-4 w-4 text-cyan-200" />
                  {l}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-2 text-xs text-blue-100/80">
              <Info className="h-4 w-4" />
              <span>Cidadão? <a href="#mapa" className="font-semibold text-white underline-offset-4 hover:underline">Consulte o mapa público de imóveis →</a></span>
            </div>
          </div>

          {/* Login card */}
          <div className="lg:col-span-5">
            <div
              className="relative rounded-2xl border border-slate-200 bg-white p-7 text-slate-900"
              style={{ boxShadow: "0 30px 60px -20px rgba(8, 38, 110, 0.45), 0 12px 24px -12px rgba(8, 38, 110, 0.30)" }}
            >
              <div className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Acesso de servidor
              </div>

              <h3 className="text-xl font-bold tracking-tight">Acessar o sistema</h3>
              <p className="mt-1 text-sm text-slate-500">Entre com seu CPF ou e-mail e senha institucional.</p>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">

                {erro && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{erro}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700">CPF ou E-mail</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <input
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="CPF (só dígitos) ou e-mail institucional"
                      autoComplete="username"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="text-xs font-semibold text-slate-700">Senha</label>
                    <Link to="/auth/recuperar-senha" className="text-[11px] font-medium text-[#1351B4] hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5 focus-within:border-[#1351B4] focus-within:ring-2 focus-within:ring-[#1351B4]/20">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#1351B4] py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0c3b8d] disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="pt-1 text-center text-xs text-slate-500">
                  Ainda não tem conta?{" "}
                  <Link to="/auth/criar-conta" className="font-semibold text-[#1351B4] hover:underline">
                    Solicitar acesso
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── O que é o SIGPIM ────────────────────────────────────────────────── */}
      <section id="sobre" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1351B4]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1351B4]">
              <span className="h-1 w-1 rounded-full bg-[#1351B4]" />
              Sobre o sistema
            </span>
            <h3 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">O que é o SIGPIM?</h3>
            <p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              Plataforma oficial para gerenciamento centralizado de todo o patrimônio imobiliário público municipal.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { color: "#1351B4", icon: FileText, titulo: "Cadastro Centralizado",
                desc: "Registro completo de todos os imóveis públicos municipais em uma base única, padronizada e integrada." },
              { color: "#168821", icon: MapPin,   titulo: "Georreferenciamento",
                desc: "Localização precisa com coordenadas geográficas e visualização em mapas interativos para gestão territorial." },
              { color: "#1351B4", icon: Shield,   titulo: "Transparência Pública",
                desc: "Acesso controlado à informação com rastreabilidade completa e conformidade com a Lei de Acesso à Informação." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.titulo}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <span className="absolute left-0 top-0 h-full w-[3px]" style={{ backgroundColor: item.color }} />
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.color}14`, color: item.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">{item.titulo}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── O que o Sistema Faz ─────────────────────────────────────────────── */}
      <section id="funcionalidades" className="bg-slate-50/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1351B4]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1351B4]">
              <span className="h-1 w-1 rounded-full bg-[#1351B4]" />
              Funcionalidades
            </span>
            <h3 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">O que o Sistema Faz?</h3>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              Funcionalidades completas para gestão eficiente do patrimônio imobiliário municipal.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {[
              { icon: Building2,   titulo: "Cadastro de Imóveis",      descricao: "Wizard guiado em etapas para registro detalhado de imóveis com validação de dados e anexo de documentos." },
              { icon: Users,       titulo: "Gestão de Usuários",       descricao: "Controle de acesso por perfis e permissões granulares para secretarias e departamentos municipais." },
              { icon: MapPin,      titulo: "Mapeamento GIS",           descricao: "Visualização georreferenciada de imóveis com camadas temáticas e análises territoriais integradas." },
              { icon: FileText,    titulo: "Relatórios e Auditorias",  descricao: "Geração de relatórios gerenciais, estatísticas e trilhas de auditoria para conformidade legal." },
              { icon: TrendingUp,  titulo: "Planejamento Territorial", descricao: "Ferramentas para apoio à tomada de decisões estratégicas sobre uso e destinação de imóveis públicos." },
              { icon: CheckCircle, titulo: "Fiscalização",             descricao: "Registro de vistorias, ocorrências e manutenções com histórico completo por imóvel." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titulo} className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-[#1351B4]/30 hover:shadow-md hover:shadow-slate-200/60">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#1351B4]/10 text-[#1351B4] transition group-hover:bg-[#1351B4] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[15px] font-semibold tracking-tight text-slate-900">{item.titulo}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mapa de Imóveis Públicos Validados ──────────────────────────────── */}
      <section id="mapa" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1351B4]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1351B4]">
              <span className="h-1 w-1 rounded-full bg-[#1351B4]" />
              Consulta pública
            </span>
            <h3 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Mapa de Imóveis Públicos</h3>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              Visualize a localização dos imóveis públicos <strong className="text-slate-900">validados</strong> do município.
            </p>
          </div>

          <div className="mt-12">
            <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1351B4]" />
                      Imóvel validado
                    </span>
                    <span className="hidden h-3 w-px bg-slate-300 sm:inline-block" />
                    <span className="hidden text-slate-500 sm:inline">{imoveis.length} pontos exibidos</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Dados sensíveis ocultos</span>
                  </div>
                </div>

                <div className="relative" style={{ height: "460px" }}>
                  <MapContainer
                    center={SLZ}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                    zoomControl
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Markers — only name shown on click, no sensitive data */}
                    {imoveis.map((imovel) => (
                      <Marker
                        key={imovel.id}
                        position={[imovel.latitude, imovel.longitude]}
                        icon={markerIcon}
                      >
                        <Popup>
                          <div className="text-sm space-y-1 min-w-[160px]">
                            <p className="font-semibold text-gray-900">
                              {imovel.nomeReferencia ?? "Imóvel Público"}
                            </p>
                            {imovel.nomeTipoImovel && (
                              <p className="text-xs text-gray-500">{imovel.nomeTipoImovel} · Validado</p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm text-slate-500">
              <Shield className="h-4 w-4" />
              Informações detalhadas disponíveis apenas para usuários autenticados.
            </p>
          </div>
        </div>
      </section>

      {/* ── Objetivos ───────────────────────────────────────────────────────── */}
      <section id="objetivos" className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[#1351B4]/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
              <span className="h-1 w-1 rounded-full bg-cyan-300" />
              Objetivos
            </span>
            <h3 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">Principais Objetivos</h3>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              Modernização da gestão patrimonial pública com eficiência e transparência.
            </p>
          </div>

          <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { numero: "01", icon: Layers,  titulo: "Centralização",   descricao: "Unificar informações de imóveis dispersas em diferentes secretarias." },
              { numero: "02", icon: History, titulo: "Rastreabilidade", descricao: "Garantir histórico completo e auditável de todas as operações." },
              { numero: "03", icon: Zap,     titulo: "Eficiência",      descricao: "Automatizar processos e reduzir tempo de gestão patrimonial." },
              { numero: "04", icon: Eye,     titulo: "Transparência",   descricao: "Facilitar acesso público à informação dentro dos limites legais." },
            ].map((o) => {
              const Icon = o.icon;
              return (
                <div key={o.numero} className="relative">
                  <div className="flex items-center justify-between">
                    <div
                      className="text-[64px] font-extrabold leading-none tracking-tight"
                      style={{
                        WebkitTextStroke: "1.5px rgba(255,255,255,0.18)",
                        color: "transparent",
                      }}
                    >
                      {o.numero}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-5 h-px w-10 bg-cyan-300/60" />
                  <h4 className="mt-4 text-lg font-semibold tracking-tight">{o.titulo}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{o.descricao}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <img src="/assets/logo-sigpim.png" alt="SIGPIM" className="h-11 w-auto object-contain" />
                <div className="leading-tight">
                  <h4 className="text-sm font-bold tracking-tight text-[#1351B4]">SIGPIM</h4>
                  <p className="text-[11px] font-medium text-slate-500">SEMAD/SIN</p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                Sistema Integrado de Gestão do Patrimônio Imobiliário Municipal.
              </p>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Links Úteis</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Termos de Uso", "Política de Privacidade", "Lei de Acesso à Informação", "Portal da Transparência"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-700 transition-colors hover:text-[#1351B4]">{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contato</h4>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" />
                  <span>sin.semadslz@gmail.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" />
                  <span>(98) 98410-6091</span>
                </li>
                <li className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" />
                  <span>SEMAD — Av. Sen. Vitorino Freire, s/n — Centro</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Institucional</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a
                    href="https://www.saoluis.ma.gov.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-700 transition-colors hover:text-[#1351B4]"
                  >
                    Portal da Prefeitura <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                {["SEMAD", "Ouvidoria"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-700 transition-colors hover:text-[#1351B4]">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SEMAD/SIN. Todos os direitos reservados.
            </p>
            <p className="text-xs text-slate-400">SIGPIM v1.0.0 · Desenvolvido pela SEMAD/SIN</p>
          </div>
        </div>
      </footer>
    </div>
  );
}