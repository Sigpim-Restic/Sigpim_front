import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Building2, MapPin, Shield, FileText, Users, TrendingUp,
  Menu, X, ChevronRight, CheckCircle, Mail, Phone, ExternalLink,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../components/ui/card";

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
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#1351B4;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────────────────────

export function Home() {
  const navigate = useNavigate();
  const [menuMobileAberto,  setMenuMobileAberto]  = useState(false);
  const [imoveis,           setImoveis]           = useState<ImovelPublico[]>([]);

  useEffect(() => {
    fetchImoveisPublicos().then(setImoveis);
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1351B4]">
              <img src="/assets/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1351B4]">SIGPIM</h1>
              <p className="text-xs text-gray-600">São Luís - MA</p>
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-[#1351B4]"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              className="bg-[#1351B4] hover:bg-[#0c3b8d]"
              onClick={() => navigate("/auth/criar-conta")}
            >
              Criar Conta
            </Button>
          </div>

          <button
            onClick={() => setMenuMobileAberto(!menuMobileAberto)}
            className="text-gray-700 md:hidden"
          >
            {menuMobileAberto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {menuMobileAberto && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700"
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

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#1351B4] via-[#155bcb] to-[#0c3b8d] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Shield className="h-4 w-4" />
                <span>Sistema Oficial da Prefeitura de São Luís</span>
              </div>
              <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Sistema Integrado de Gestão do Patrimônio Imobiliário
              </h2>
              <p className="text-lg text-blue-100 sm:text-xl">
                Plataforma digital para cadastro, gestão e fiscalização de imóveis
                públicos municipais com transparência, segurança e eficiência.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-white text-[#1351B4] hover:bg-gray-100 sm:w-auto"
                  onClick={() => navigate("/auth/criar-conta")}
                >
                  Começar Agora
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                  onClick={() => navigate("/login")}
                >
                  Acessar Sistema
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white/10 p-8 backdrop-blur">
                <div className="flex h-full items-center justify-center">
                  <Building2 className="h-64 w-64 text-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── O que é o SIGPIM ────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">O que é o SIGPIM?</h3>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              O SIGPIM-SLZ é a plataforma oficial da Prefeitura Municipal de São Luís
              para gerenciamento centralizado de todo o patrimônio imobiliário público.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { color: "#1351B4", icon: FileText, titulo: "Cadastro Centralizado",
                desc: "Registro completo de todos os imóveis públicos municipais em uma base única, padronizada e integrada." },
              { color: "#168821", icon: MapPin, titulo: "Georreferenciamento",
                desc: "Localização precisa com coordenadas geográficas e visualização em mapas interativos para gestão territorial." },
              { color: "#1351B4", icon: Shield, titulo: "Transparência Pública",
                desc: "Acesso controlado à informação com rastreabilidade completa de alterações e conformidade com a Lei de Acesso à Informação." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.titulo} style={{ borderLeftColor: item.color }} className="border-l-4">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.color}1A` }}>
                      <Icon className="h-6 w-6" style={{ color: item.color }} />
                    </div>
                    <CardTitle>{item.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent><CardDescription>{item.desc}</CardDescription></CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── O que o Sistema Faz ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">O que o Sistema Faz?</h3>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              Funcionalidades completas para gestão eficiente do patrimônio imobiliário municipal
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              { icon: Building2, titulo: "Cadastro de Imóveis", descricao: "Wizard guiado em etapas para registro detalhado de imóveis com validação de dados e anexo de documentos." },
              { icon: Users, titulo: "Gestão de Usuários", descricao: "Controle de acesso por perfis e permissões granulares para secretarias e departamentos municipais." },
              { icon: MapPin, titulo: "Mapeamento GIS", descricao: "Visualização georreferenciada de imóveis com camadas temáticas e análises territoriais integradas." },
              { icon: FileText, titulo: "Relatórios e Auditorias", descricao: "Geração de relatórios gerenciais, estatísticas e trilhas de auditoria para conformidade legal." },
              { icon: TrendingUp, titulo: "Planejamento Territorial", descricao: "Ferramentas para apoio à tomada de decisões estratégicas sobre uso e destinação de imóveis públicos." },
              { icon: CheckCircle, titulo: "Fiscalização", descricao: "Registro de vistorias, ocorrências e manutenções com histórico completo por imóvel." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.titulo} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#1351B4]/10">
                    <Icon className="h-6 w-6 text-[#1351B4]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{item.titulo}</h4>
                    <p className="mt-2 text-sm text-gray-600">{item.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mapa de Imóveis Públicos Validados ──────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 sm:text-4xl">Mapa de Imóveis Públicos</h3>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
              Visualize a localização dos imóveis públicos <strong>validados</strong> de São Luís
            </p>
          </div>

          <div className="mt-12">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative rounded-lg overflow-hidden" style={{ height: "450px" }}>
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
            <p className="mt-4 text-center text-sm text-gray-500">
              <Shield className="mr-1 inline h-4 w-4" />
              Informações detalhadas disponíveis apenas para usuários autenticados
            </p>
          </div>
        </div>
      </section>

      {/* ── Objetivos ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold sm:text-4xl">Principais Objetivos</h3>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-300">
              Modernização da gestão patrimonial pública com eficiência e transparência
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { numero: "01", titulo: "Centralização", descricao: "Unificar informações de imóveis dispersas em diferentes secretarias" },
              { numero: "02", titulo: "Rastreabilidade", descricao: "Garantir histórico completo e auditável de todas as operações" },
              { numero: "03", titulo: "Eficiência", descricao: "Automatizar processos e reduzir tempo de gestão patrimonial" },
              { numero: "04", titulo: "Transparência", descricao: "Facilitar acesso público à informação dentro dos limites legais" },
            ].map((objetivo) => (
              <div key={objetivo.numero} className="relative">
                <div className="text-6xl font-bold text-white/10">{objetivo.numero}</div>
                <h4 className="mt-4 text-xl font-semibold">{objetivo.titulo}</h4>
                <p className="mt-2 text-sm text-gray-300">{objetivo.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1351B4]">
                  <img src="/assets/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
                </div>
                <h4 className="font-semibold text-gray-900">SIGPIM-SLZ</h4>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Sistema Integrado de Gestão do Patrimônio Imobiliário Municipal de São Luís do Maranhão.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Links Úteis</h4>
              <ul className="mt-4 space-y-2 text-sm">
                {["Termos de Uso", "Política de Privacidade", "Lei de Acesso à Informação", "Portal da Transparência"].map((l) => (
                  <li key={l}><a href="#" className="text-gray-600 transition-colors hover:text-[#1351B4]">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Contato</h4>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" /><span>sin.semadslz@gmail.com</span></li>
                <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" /><span>(98) 98410-6091</span></li>
                <li className="flex items-start gap-2"><Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1351B4]" /><span>SEMAD — Av. Sen. Vitorino Freire, s/n — Centro, São Luís/MA</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Institucional</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="https://www.saoluis.ma.gov.br" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gray-600 transition-colors hover:text-[#1351B4]">
                    Portal da Prefeitura <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                {["SEMAD", "Ouvidoria"].map((l) => (
                  <li key={l}><a href="#" className="text-gray-600 transition-colors hover:text-[#1351B4]">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Prefeitura Municipal de São Luís. Todos os direitos reservados.</p>
            <p className="mt-1 text-xs text-gray-500">SIGPIM-SLZ v1.0.0 | Desenvolvido pela SEMAD/SIN</p>
          </div>
        </div>
      </footer>
    </div>
  );
}