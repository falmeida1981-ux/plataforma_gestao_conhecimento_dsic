import Link from "next/link";

import { LigacoesNavegacao } from "./ligacoes-navegacao";

export function BarraLateral() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="font-heading text-base font-semibold tracking-tight">
          Operações DSIC
        </Link>
      </div>
      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto p-3">
        <LigacoesNavegacao />
      </nav>
    </aside>
  );
}
