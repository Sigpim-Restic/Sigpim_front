import React, { useState, useEffect, useRef } from "react";
import { Search, User, Building2, Landmark, X, Loader2 } from "lucide-react";
import { pessoasApi, type PessoaResponse, type TipoPessoa, TIPO_PESSOA_LABELS } from "../../api/pessoas";

interface Props {
  value: number | null;              // id da pessoa selecionada
  valorTexto?: string;               // fallback texto livre (campo legado)
  onChange: (id: number | null, nome: string) => void;
  onTextoChange?: (texto: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

function TipoIcon({ tipo }: { tipo: TipoPessoa }) {
  if (tipo === "PF") return <User className="h-3 w-3 text-blue-400 shrink-0" />;
  if (tipo === "PJ") return <Building2 className="h-3 w-3 text-purple-400 shrink-0" />;
  return <Landmark className="h-3 w-3 text-emerald-400 shrink-0" />;
}

export function PessoaCombobox({
  value, valorTexto, onChange, onTextoChange,
  placeholder = "Buscar pessoa cadastrada...",
  disabled = false,
}: Props) {
  const [busca,       setBusca]       = useState("");
  const [aberto,      setAberto]      = useState(false);
  const [resultados,  setResultados]  = useState<PessoaResponse[]>([]);
  const [carregando,  setCarregando]  = useState(false);
  const [pessoaSel,   setPessoaSel]   = useState<PessoaResponse | null>(null);
  const [modoTexto,   setModoTexto]   = useState(!value && !!valorTexto);
  const [textoLivre,  setTextoLivre]  = useState(valorTexto ?? "");
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef  = useRef<HTMLDivElement>(null);

  // Carrega a pessoa selecionada ao montar
  useEffect(() => {
    if (value) {
      pessoasApi.buscarPorId(value)
        .then(setPessoaSel)
        .catch(() => setPessoaSel(null));
    } else {
      setPessoaSel(null);
    }
  }, [value]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Busca com debounce
  useEffect(() => {
    if (!aberto || busca.length < 2) { setResultados([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setCarregando(true);
      try {
        const res = await pessoasApi.buscar({ busca, size: 8 });
        setResultados(res.content);
      } catch { setResultados([]); }
      finally { setCarregando(false); }
    }, 300);
  }, [busca, aberto]);

  const selecionar = (p: PessoaResponse) => {
    setPessoaSel(p);
    onChange(p.id, p.nome);
    setAberto(false);
    setBusca("");
    setModoTexto(false);
  };

  const limpar = () => {
    setPessoaSel(null);
    onChange(null, "");
    setBusca("");
  };

  // Pessoa já selecionada
  if (pessoaSel && !aberto) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[#1351B4] bg-blue-50 px-3 py-2 text-sm">
        <TipoIcon tipo={pessoaSel.tipoPessoa} />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-gray-900 truncate">{pessoaSel.nome}</span>
          {pessoaSel.cpfCnpj && (
            <span className="ml-2 text-xs text-gray-400">{pessoaSel.cpfCnpj}</span>
          )}
          <span className="ml-2 text-xs text-gray-400">
            — {TIPO_PESSOA_LABELS[pessoaSel.tipoPessoa]}
          </span>
        </div>
        {!disabled && (
          <button onClick={limpar} className="text-gray-400 hover:text-red-500 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // Modo texto livre (legado)
  if (modoTexto) {
    return (
      <div className="space-y-1">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1351B4]"
            value={textoLivre}
            onChange={(e) => {
              setTextoLivre(e.target.value);
              onTextoChange?.(e.target.value);
            }}
            placeholder="Nome do locador/cessionário..."
            disabled={disabled}
          />
          <button
            onClick={() => setModoTexto(false)}
            className="text-xs text-[#1351B4] hover:underline whitespace-nowrap"
          >
            Buscar cadastrado
          </button>
        </div>
      </div>
    );
  }

  // Combobox de busca
  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 gap-2
                      focus-within:border-[#1351B4] focus-within:ring-1 focus-within:ring-[#1351B4]">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setAberto(true); }}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {carregando && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400 shrink-0" />}
      </div>

      {/* Dropdown */}
      {aberto && (busca.length >= 2 || resultados.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {carregando && resultados.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">Buscando...</div>
          )}
          {!carregando && resultados.length === 0 && busca.length >= 2 && (
            <div className="space-y-1 p-2">
              <p className="px-2 py-1.5 text-xs text-gray-400">Nenhuma pessoa encontrada.</p>
              {onTextoChange && (
                <button
                  onClick={() => { setModoTexto(true); setAberto(false); }}
                  className="w-full text-left px-2 py-1.5 text-xs text-[#1351B4] hover:bg-blue-50 rounded"
                >
                  Digitar nome manualmente →
                </button>
              )}
            </div>
          )}
          {resultados.map((p) => (
            <button key={p.id} onClick={() => selecionar(p)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors">
              <TipoIcon tipo={p.tipoPessoa} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.nome}</p>
                <p className="text-xs text-gray-400">
                  {TIPO_PESSOA_LABELS[p.tipoPessoa]}
                  {p.cpfCnpj ? ` · ${p.cpfCnpj}` : ""}
                  {p.telefone ? ` · ${p.telefone}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Link para texto livre */}
      {onTextoChange && !aberto && (
        <button onClick={() => setModoTexto(true)}
          className="mt-1 text-xs text-gray-400 hover:text-[#1351B4]">
          Digitar nome manualmente
        </button>
      )}
    </div>
  );
}