import type { Metadata } from "next";

import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata: Metadata = { title: "Relatórios" };

export default function Pagina() {
  return <EmConstrucao href="/relatorios" />;
}
