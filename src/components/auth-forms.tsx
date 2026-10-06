"use client";

import { useId, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Only paths on this site, never another domain.
const safeNext = (next?: string) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/conta");

// Supabase's error codes, in words a customer can act on.
function messageFor(error: { code?: string; message?: string }) {
  switch (error.code) {
    case "invalid_credentials": return "E-mail ou senha incorretos.";
    case "email_not_confirmed": return "Falta confirmar seu e-mail: abra o link que enviamos para ele.";
    case "user_already_exists":
    case "email_exists": return "Já existe uma conta com esse e-mail. É só entrar com ele.";
    case "weak_password": return "Senha fraca: use pelo menos 8 caracteres, misturando letras e números.";
    case "email_address_invalid":
    case "validation_failed": return "Confira o e-mail digitado.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit": return "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.";
    case "email_address_not_authorized": return "Ainda não conseguimos enviar o e-mail de confirmação. Por enquanto, entre com o Google.";
    case "signup_disabled":
    case "email_provider_disabled": return "Cadastro com e-mail indisponível no momento. Entre com o Google.";
    default: return "Algo deu errado. Tente de novo em instantes.";
  }
}

const FIELD = "h-12 w-full border border-[var(--ink)]/20 bg-white px-4 text-[15px] outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--ink)]";

function Field({ label, hint, ...input }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return <div className="text-left">
    <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">{label}</label>
    <input id={id} className={FIELD} {...input} />
    {hint && <p className="mt-1 text-[12px] text-[var(--muted)]">{hint}</p>}
  </div>;
}

function PasswordField({ label, hint, value, onChange, autoComplete }: { label: string; hint?: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return <div className="text-left">
    <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">{label}</label>
    <div className="relative">
      <input id={id} type={shown ? "text" : "password"} required minLength={8} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} className={`${FIELD} pr-12`} />
      <button type="button" onClick={() => setShown((value) => !value)} aria-label={shown ? "Esconder senha" : "Mostrar senha"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--muted)] hover:text-[var(--ink)]">
        {shown ? <EyeOff size={17} strokeWidth={1.6} /> : <Eye size={17} strokeWidth={1.6} />}
      </button>
    </div>
    {hint && <p className="mt-1 text-[12px] text-[var(--muted)]">{hint}</p>}
  </div>;
}

const SUBMIT = "label h-12 w-full bg-[var(--ink)] text-[13px] text-[var(--creme)] disabled:opacity-60";
const ALERT = "rounded-xl bg-[#8a3a2c]/10 px-4 py-3 text-left text-[13px] text-[#8a3a2c]";

// E-mail and password, for an account that already exists.
export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(messageFor(error));
      setBusy(false);
      return;
    }
    router.push(safeNext(next));
    router.refresh();
  }

  return <form onSubmit={submit} className="space-y-4">
    <Field label="E-mail" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
    <PasswordField label="Senha" autoComplete="current-password" value={password} onChange={setPassword} />
    {error && <p role="alert" className={ALERT}>{error}</p>}
    <button type="submit" disabled={busy} className={SUBMIT}>{busy ? "Entrando…" : "Entrar"}</button>
  </form>;
}

// "(11) 98765-4321" as the customer types; only digits are kept.
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// A new account with e-mail and password. When the project asks for e-mail confirmation, the customer gets a link
// first; otherwise they are signed in right away.
export function SignUpForm({ next }: { next?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const fullName = name.trim().replace(/\s+/g, " ");
    const digits = phone.replace(/\D/g, "");
    if (fullName.split(" ").length < 2) return setError("Escreva seu nome e sobrenome.");
    if (digits && digits.length < 10) return setError("Confira o telefone: com DDD, são 10 ou 11 números.");
    setBusy(true);
    const { data, error } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName, ...(digits ? { phone: digits } : {}) },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
      },
    });
    setBusy(false);
    if (error) return setError(messageFor(error));
    if (data.session) {
      router.push(safeNext(next));
      router.refresh();
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) return <div className="space-y-2 text-center">
    <p className="display text-2xl">Confirme seu e-mail</p>
    <p className="text-[15px] text-[var(--ink)]/80">Enviamos um link para <strong>{sentTo}</strong>. Abra o e-mail neste aparelho e toque no link para ativar sua conta.</p>
  </div>;

  return <form onSubmit={submit} className="space-y-4">
    <Field label="Nome e sobrenome" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
    <Field label="E-mail" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
    <PasswordField label="Senha" hint="Pelo menos 8 caracteres." autoComplete="new-password" value={password} onChange={setPassword} />
    <Field label="Telefone (opcional)" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="(11) 98765-4321" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} />
    {error && <p role="alert" className={ALERT}>{error}</p>}
    <button type="submit" disabled={busy} className={SUBMIT}>{busy ? "Criando sua conta…" : "Criar conta"}</button>
  </form>;
}
