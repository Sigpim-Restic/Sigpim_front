import * as React from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface HierarchicalUnit {
  value: string;
  label: string;
}

export interface HierarchicalGroup {
  secretaria: string;
  sigla: string;
  unidades: HierarchicalUnit[];
}

interface HierarchicalComboboxProps {
  groups: HierarchicalGroup[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function HierarchicalCombobox({
  groups,
  value,
  onValueChange,
  placeholder = "Selecione uma unidade...",
  searchPlaceholder = "Buscar unidade ou secretaria...",
  emptyText = "Nenhuma unidade encontrada.",
  className,
}: HierarchicalComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Encontrar a unidade e secretaria selecionadas
  const getSelectedDisplay = () => {
    for (const group of groups) {
      const unit = group.unidades.find((u) => u.value === value);
      if (unit) {
        return `${unit.label} – ${group.sigla}`;
      }
    }
    return null;
  };

  // Filtrar grupos e unidades baseado na busca
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery) return groups;

    const query = searchQuery.toLowerCase();
    return groups
      .map((group) => {
        // Verificar se a secretaria corresponde à busca
        const secretariaMatches =
          group.secretaria.toLowerCase().includes(query) ||
          group.sigla.toLowerCase().includes(query);

        // Filtrar unidades que correspondem à busca
        const filteredUnits = group.unidades.filter((unit) =>
          unit.label.toLowerCase().includes(query)
        );

        // Se a secretaria corresponde, mostrar todas as unidades
        // Se não, mostrar apenas as unidades filtradas
        if (secretariaMatches) {
          return { ...group, unidades: group.unidades };
        } else if (filteredUnits.length > 0) {
          return { ...group, unidades: filteredUnits };
        }

        return null;
      })
      .filter((group): group is HierarchicalGroup => group !== null);
  }, [groups, searchQuery]);

  const selectedDisplay = getSelectedDisplay();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className={cn(!selectedDisplay && "text-gray-500")}>
              {selectedDisplay || placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {filteredGroups.map((group) => (
              <CommandGroup
                key={group.sigla}
                heading={
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Building2 className="h-4 w-4 text-[#1351B4]" />
                    <span className="font-semibold text-[#1351B4]">
                      {group.sigla}
                    </span>
                    <span className="text-xs text-gray-500">
                      – {group.secretaria}
                    </span>
                  </div>
                }
              >
                {group.unidades.map((unit) => (
                  <CommandItem
                    key={unit.value}
                    value={unit.value}
                    onSelect={(currentValue) => {
                      onValueChange?.(
                        currentValue === value ? "" : currentValue
                      );
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="pl-8"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === unit.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{unit.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
