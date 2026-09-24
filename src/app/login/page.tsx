import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaLogin() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Operações DSIC <Badge variant="secondary">M2</Badge>
          </CardTitle>
          <CardDescription>
            A autenticação (Active Directory e contas locais com MFA) fica disponível no marco M2.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
