import type { Metadata } from "next";

import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata: Metadata = { title: "Calendário" };

export default function Pagina() {
  return <EmConstrucao href="/calendario" />;
}
