import { NextResponse, type NextRequest } from "next/server";

// Content Security Policy com nonce por pedido (RNF01, RNF03).
// O Next aplica o nonce aos seus scripts; por isso todas as páginas têm de ser dinâmicas
// (o layout raiz chama connection()). A partir do M2 este proxy também valida a sessão.
export function proxy(pedido: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const desenvolvimento = process.env.NODE_ENV === "development";
  const https = pedido.nextUrl.protocol === "https:" || process.env.APP_URL?.startsWith("https:");

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${desenvolvimento ? " 'unsafe-eval'" : ""}`,
    // Os componentes (Radix, sonner) usam atributos style; os scripts continuam restritos ao nonce.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const cabecalhosPedido = new Headers(pedido.headers);
  cabecalhosPedido.set("x-nonce", nonce);
  cabecalhosPedido.set("Content-Security-Policy", csp);

  const resposta = NextResponse.next({ request: { headers: cabecalhosPedido } });
  resposta.headers.set("Content-Security-Policy", csp);
  return resposta;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
