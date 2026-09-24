import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { SECCOES } from "./navegacao";

/** Página provisória de uma secção que ainda não foi implementada. */
export function EmConstrucao({ href }: { href: string }) {
  const seccao = SECCOES.find((s) => s.href === href);
  if (!seccao) throw new Error(`Secção desconhecida: ${href}`);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{seccao.titulo}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Em construção <Badge variant="secondary">{seccao.marco}</Badge>
          </CardTitle>
          <CardDescription>{seccao.descricao}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
