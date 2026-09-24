import type { Route } from "next";
import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  Server,
  Settings,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface SeccaoNavegacao {
  href: Route;
  titulo: string;
  icone: LucideIcon;
  /** Marco do plano de implementação em que a secção fica disponível. */
  marco: string;
  descricao: string;
}

export const SECCOES: SeccaoNavegacao[] = [
  {
    href: "/",
    titulo: "Dashboard",
    icone: LayoutDashboard,
    marco: "M8",
    descricao: "Intervenções próximas e em curso, ocorrências abertas, pendentes e indicadores.",
  },
  {
    href: "/calendario",
    titulo: "Calendário",
    icone: CalendarDays,
    marco: "M8",
    descricao: "Intervenções agendadas, janelas protegidas e sobreposições.",
  },
  {
    href: "/intervencoes",
    titulo: "Intervenções",
    icone: Wrench,
    marco: "M5",
    descricao: "Intervenções planeadas e de emergência, com diário de execução.",
  },
  {
    href: "/ocorrencias",
    titulo: "Ocorrências",
    icone: TriangleAlert,
    marco: "M5",
    descricao: "Ocorrências, a sua resolução e a ligação às intervenções.",
  },
  {
    href: "/atividade",
    titulo: "Atividade",
    icone: NotebookPen,
    marco: "M5",
    descricao: "Registos de atividade rápidos para trabalho sem workflow.",
  },
  {
    href: "/procedimentos",
    titulo: "Procedimentos",
    icone: ListChecks,
    marco: "M5",
    descricao: "Procedimentos versionados, usados como modelo de intervenções.",
  },
  {
    href: "/conhecimento",
    titulo: "Conhecimento",
    icone: BookOpen,
    marco: "M7",
    descricao: "Artigos de conhecimento gerados a partir das intervenções concluídas.",
  },
  {
    href: "/inventario",
    titulo: "Inventário",
    icone: Server,
    marco: "M4",
    descricao: "Ativos, serviços, dependências, destinatários e salvaguardas.",
  },
  {
    href: "/relatorios",
    titulo: "Relatórios",
    icone: ChartColumn,
    marco: "M8",
    descricao: "Relatórios e indicadores exportáveis em PDF e Excel.",
  },
  {
    href: "/administracao",
    titulo: "Administração",
    icone: Settings,
    marco: "M2",
    descricao: "Utilizadores, perfis, áreas e parâmetros da plataforma.",
  },
];

export function seccaoAtiva(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
