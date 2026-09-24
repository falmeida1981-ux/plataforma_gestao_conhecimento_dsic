import type { Metadata } from "next";

import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata: Metadata = { title: "Administração" };

export default function Pagina() {
  return <EmConstrucao href="/administracao" />;
}
