import { describe, expect, it } from "vitest";

import { seccaoAtiva } from "@/components/layout/navegacao";

describe("seccaoAtiva", () => {
  it("o dashboard só está ativo na raiz", () => {
    expect(seccaoAtiva("/", "/")).toBe(true);
    expect(seccaoAtiva("/inventario", "/")).toBe(false);
  });

  it("uma secção está ativa nas suas subpáginas, mas não em prefixos parecidos", () => {
    expect(seccaoAtiva("/intervencoes", "/intervencoes")).toBe(true);
    expect(seccaoAtiva("/intervencoes/INT-2026-0042", "/intervencoes")).toBe(true);
    expect(seccaoAtiva("/intervencoes-antigas", "/intervencoes")).toBe(false);
  });
});
