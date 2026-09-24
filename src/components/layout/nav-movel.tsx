"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { LigacoesNavegacao } from "./ligacoes-navegacao";

export function NavMovel() {
  const [aberto, setAberto] = useState(false);

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>Operações DSIC</SheetTitle>
        </SheetHeader>
        <nav aria-label="Navegação principal" className="p-3">
          <LigacoesNavegacao aoNavegar={() => setAberto(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
