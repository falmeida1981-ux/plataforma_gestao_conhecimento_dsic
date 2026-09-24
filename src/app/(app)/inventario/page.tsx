import type { Metadata } from "next";

import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata: Metadata = { title: "Inventário" };

export default function Pagina() {
  return <EmConstrucao href="/inventario" />;
}
