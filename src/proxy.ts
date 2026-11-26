import { destinoLancamento, bloqueioPersonalizador } from "@/lib/personalizador-lancamento";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { viaGoogle } from "@/lib/owners";
import { COOKIE_ACESSO, acessoValido, preVendaAtiva, rotaLivre } from "@/lib/pre-venda";

// 1. Pre-sale lock: while PRE_VENDA is on, a visitor without the access cookie (given on /pre-venda to the people
//    on the list) sees "Coming soon" on every page (same address, the content is swapped for /em-breve).
// 2. On the routes that read the session (/admin, /conta, /pre-venda, /meus-pedidos): keeps the Supabase session fresh (rotating its cookies, which pages can't do)
//    and turns away anyone not signed in with Google before /admin renders. The admin page checks the administrator.
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const agora = Date.now();
  const destino = destinoLancamento(path, agora);
  if (destino === "api") return bloqueioPersonalizador(agora)!;
  if (destino === "redirecionar") {
    const espera = NextResponse.redirect(new URL("/personalizar-estampa", request.url), 307);
    espera.headers.set("Cache-Control", "private, no-store, max-age=0");
    return espera;
  }
  if (destino === "pagina") return NextResponse.next();
  // These routes used to be outside the matcher; keep their existing handler/asset behavior after launch.
  if (path.startsWith("/api/") || path === "/personalizador" || path.startsWith("/personalizador/")) return NextResponse.next();

  if (preVendaAtiva() && !rotaLivre(path) && !(await acessoValido(request.cookies.get(COOKIE_ACESSO)?.value))) {
    const trancado = NextResponse.rewrite(new URL("/em-breve", request.url));
    trancado.headers.set("x-robots-tag", "noindex");
    return trancado;
  }

  if (!["/admin", "/conta", "/pre-venda", "/meus-pedidos"].some((rota) => path.startsWith(rota))) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();

  if (path.startsWith("/admin")) {
    const email = data?.claims.email;
    if (!email || !viaGoogle(data?.claims.amr)) {
      const redirect = NextResponse.redirect(new URL(email ? "/conta" : "/conta?next=/admin", request.url));
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }
  }
  return response;
}

// Store pages for the existing pre-sale lock, plus editor entries and creation APIs for the scheduled launch.
// Next assets and unrelated APIs/static files keep their prior behavior.
export const config = { matcher: ["/personalizador/:path*", "/api/personalizador/:path*", "/api/estampa/envio", "/api/estampa/registrar", "/((?!api/|_next/|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"] };
