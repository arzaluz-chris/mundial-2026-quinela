"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = getString(formData, "next") || "/dashboard";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const displayName = getString(formData, "display_name");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      }
    }
  });

  if (error) redirect(`/auth/register?error=${encodeURIComponent(error.message)}`);
  redirect("/auth/login?message=Revisa tu correo si tu proyecto requiere confirmacion.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = getString(formData, "email");
  const origin = getString(formData, "origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/dashboard`
  });

  if (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/login?message=Te enviamos instrucciones para restablecer tu password.");
}
