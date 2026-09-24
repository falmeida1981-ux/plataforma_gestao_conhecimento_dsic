"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Criação rápida acessível de qualquer página (RNF23): botão no cabeçalho e atalhos "c" e Ctrl/⌘+K.
// As opções ficam ativas à medida que os marcos as entregam.
const OPCOES = [
  { titulo: "Registo de atividade", marco: "M5" },
  { titulo: "Intervenção", marco: "M5" },
  { titulo: "Ocorrência", marco: "M5" },
  { titulo: "Procedimento", marco: "M5" },
];

function estaAEscrever(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  return alvo.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName);
}

export function BotaoCriacaoRapida() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    function aoPremirTecla(evento: KeyboardEvent) {
      const ctrlK = evento.key.toLowerCase() === "k" && (evento.ctrlKey || evento.metaKey);
      const teclaC =
        evento.key.toLowerCase() === "c" &&
        !evento.ctrlKey &&
        !evento.metaKey &&
        !evento.altKey &&
        !estaAEscrever(evento.target);
      if (ctrlK || teclaC) {
        evento.preventDefault();
        setAberto(true);
      }
    }
    window.addEventListener("keydown", aoPremirTecla);
    return () => window.removeEventListener("keydown", aoPremirTecla);
  }, []);

  return (
    <DropdownMenu open={aberto} onOpenChange={setAberto}>
      <DropdownMenuTrigger asChild>
        <Button aria-keyshortcuts="c Control+K">
          <Plus aria-hidden />
          Criar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Criação rápida</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPCOES.map((opcao) => (
          <DropdownMenuItem key={opcao.titulo} disabled>
            {opcao.titulo}
            <span className="ml-auto text-xs text-muted-foreground">{opcao.marco}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
