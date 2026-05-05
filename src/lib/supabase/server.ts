import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
}

export async function requireSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("UNAUTHORIZED");
  return { supabase, user: data.user };
}

export async function requireProfile() {
  const { supabase, user } = await requireSession();
  const { data: profile } = await supabase
    .from("users_profiles")
    .select("id,organization_id,role_key,email,full_name")
    .eq("id", user.id)
    .single();
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  return { supabase, user, profile };
}
