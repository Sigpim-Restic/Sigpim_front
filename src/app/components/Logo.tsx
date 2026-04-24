import React from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  variant?: "icon-only" | "with-text";
  className?: string;
}

const sizeMap = {
  small: "h-10 w-10",
  medium: "h-16 w-16",
  large: "h-24 w-24",
};

export function Logo({ size = "medium", variant = "icon-only", className = "" }: LogoProps) {
  const sizeClass = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex shrink-0 items-center justify-center rounded-xl ${sizeClass} bg-white/10 backdrop-blur-sm`}>
        <img
          src="/assets/logo.svg"
          alt="SIGPIM Logo"
          className="h-full w-full object-contain p-1"
          onError={(e) => {
            // Fallback em caso de imagem não encontrada
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      {variant === "with-text" && (
        <div className="overflow-hidden">
          <h1 className="text-lg font-semibold text-white whitespace-nowrap">SIGPIM-SLZ</h1>
          <p className="text-xs text-white/60 whitespace-nowrap">Fase 2</p>
        </div>
      )}
    </div>
  );
}
