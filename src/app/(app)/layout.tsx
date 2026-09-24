import { BarraLateral } from "@/components/layout/barra-lateral";
import { Cabecalho } from "@/components/layout/cabecalho";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar para o conteúdo
      </a>
      <div className="flex min-h-svh">
        <BarraLateral />
        <div className="flex min-w-0 flex-1 flex-col">
          <Cabecalho />
          <main id="conteudo" tabIndex={-1} className="flex-1 p-4 outline-none md:p-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
