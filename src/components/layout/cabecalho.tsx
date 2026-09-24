import { BotaoCriacaoRapida } from "./botao-criacao-rapida";
import { NavMovel } from "./nav-movel";

export function Cabecalho() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      <NavMovel />
      <span className="font-heading font-semibold md:hidden">Operações DSIC</span>
      <div className="ml-auto flex items-center gap-2">
        <BotaoCriacaoRapida />
      </div>
    </header>
  );
}
