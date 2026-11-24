import { createSecretClient } from "@/lib/supabase/publico";
import type { Conta } from "./contas-admin";

// Every account on the site, last access first (Supabase Auth, read with the secret key). Server only: imported by
// the panel page.
export async function carregarContas(): Promise<Conta[] | null> {
  const supabase = createSecretClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error("carregarContas failed:", error.message);
    return null;
  }
  const agora = Date.now();
  const contas = data.users.map((user) => {
    const provedores: string[] = user.app_metadata?.providers ?? (user.app_metadata?.provider ? [user.app_metadata.provider] : []);
    const meta = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? null,
      nome: (meta.full_name || meta.name || meta.nome || null) as string | null,
      google: provedores.includes("google"),
      senha: provedores.includes("email"),
      criado_em: user.created_at,
      ultimo_acesso: user.last_sign_in_at ?? null,
      semana: !!user.last_sign_in_at && agora - Date.parse(user.last_sign_in_at) < 7 * 864e5,
    };
  });
  return contas.sort((a, b) => Date.parse(b.ultimo_acesso ?? b.criado_em) - Date.parse(a.ultimo_acesso ?? a.criado_em));
}
