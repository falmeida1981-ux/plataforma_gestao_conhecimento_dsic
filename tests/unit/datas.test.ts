import { describe, expect, it } from "vitest";

import { formatarData, formatarDataHora, formatarHora } from "@/lib/datas";

describe("formatação de datas em hora de Lisboa", () => {
  it("no inverno (WET) a hora de Lisboa coincide com UTC", () => {
    expect(formatarDataHora("2026-01-15T09:05:00Z")).toBe("15/01/2026, 09:05");
  });

  it("no verão (WEST) soma uma hora a UTC", () => {
    expect(formatarDataHora("2026-07-15T09:05:00Z")).toBe("15/07/2026, 10:05");
  });

  it("muda de dia quando UTC ainda está no dia anterior", () => {
    expect(formatarData("2026-07-15T23:30:00Z")).toBe("16/07/2026");
  });

  it("trata a mudança para a hora de verão (29/03/2026, 01:00 UTC)", () => {
    expect(formatarHora("2026-03-29T00:30:00Z")).toBe("00:30");
    expect(formatarHora("2026-03-29T01:30:00Z")).toBe("02:30");
  });

  it("trata a mudança para a hora de inverno (25/10/2026, 01:00 UTC)", () => {
    expect(formatarHora("2026-10-25T00:30:00Z")).toBe("01:30");
    expect(formatarHora("2026-10-25T01:30:00Z")).toBe("01:30");
  });

  it("aceita Date e milissegundos", () => {
    const instante = Date.UTC(2026, 8, 24, 12, 0);
    expect(formatarDataHora(instante)).toBe("24/09/2026, 13:00");
    expect(formatarDataHora(new Date(instante))).toBe("24/09/2026, 13:00");
  });

  it("rejeita datas inválidas", () => {
    expect(() => formatarData("não é uma data")).toThrow(RangeError);
  });
});
