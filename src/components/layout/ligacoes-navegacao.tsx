"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { SECCOES, seccaoAtiva } from "./navegacao";

export function LigacoesNavegacao({ aoNavegar }: { aoNavegar?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {SECCOES.map(({ href, titulo, icone: Icone }) => {
        const ativa = seccaoAtiva(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={aoNavegar}
              aria-current={ativa ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                ativa && "bg-accent text-accent-foreground",
              )}
            >
              <Icone className="size-4" aria-hidden />
              {titulo}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
