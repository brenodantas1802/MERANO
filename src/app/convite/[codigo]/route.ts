import { NextResponse, type NextRequest } from "next/server";
import { createSecretClient } from "@/lib/supabase/publico";
import { COOKIE_CONVITE, COOKIE_ENTRADA, DIAS_CONVITE, assinarConvite, codigoValido, preVendaAtiva } from "@/lib/pre-venda";

// An invite link made in /admin: counts one use, lets this browser in for 90 days and opens the home page with the
// padlock animation. A switched-off, used-up or unknown invite goes to the locked page with a note.
export async function GET(request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  if (!preVendaAtiva()) return NextResponse.redirect(new URL("/", request.url));
  const codigo = (await params).codigo.trim().toLowerCase();
  const invalido = NextResponse.redirect(new URL("/em-breve?convite=invalido", request.url));
  if (!codigoValido(codigo)) return invalido;

  const supabase = createSecretClient();
  if (!supabase) {
    console.error("Pre-sale invite: SUPABASE_SECRET_KEY is missing");
    return invalido;
  }
  const { data: id, error } = await supabase.rpc("usar_convite_pre_venda", { p_codigo: codigo });
  if (error) console.error("usar_convite_pre_venda failed:", error.message);
  if (!id) return invalido;

  const response = NextResponse.redirect(new URL("/", request.url));
  const secure = request.nextUrl.protocol === "https:";
  response.cookies.set(COOKIE_CONVITE, await assinarConvite(id), { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: DIAS_CONVITE * 86400 });
  response.cookies.set(COOKIE_ENTRADA, "1", { secure, sameSite: "lax", path: "/", maxAge: 120 });
  return response;
}
