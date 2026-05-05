import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSupabaseEnv() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://dyrziqrihznxzudxvsue.supabase.co";
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "sb_publishable_46nzUdaiNXYIeu002LieVw_GwgIm-3s";
  return { url, anon };
}

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const env = getSupabaseEnv();

  const supabase = createServerClient(env.url, env.anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (c) => c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    },
  });

  const { data } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  const protectedPaths = ["/dashboard", "/users", "/courses", "/paths", "/assessments"];
  const mustProtect = protectedPaths.some((p) => path === p || path.startsWith(`${p}/`));
  if (!data.user && mustProtect) return NextResponse.redirect(new URL("/login", req.url));
  return res;
}

export const config = { matcher: ["/dashboard/:path*", "/users/:path*", "/courses/:path*", "/paths/:path*", "/assessments/:path*"] };
