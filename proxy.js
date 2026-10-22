import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Runs before /admin and /api/admin: only a signed-in administrator gets through. Signed-out
// visitors go to the sign-in page (and come back after), signed-in customers get "sin
// permiso"; the API answers 401/403 instead. It also refreshes the session cookies.
export async function proxy(request) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isApi) return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
    const signIn = new URL("/cuenta", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    if (isApi) return NextResponse.json({ error: "No tenés permiso de administrador." }, { status: 403 });
    return NextResponse.rewrite(new URL("/sin-permiso", request.url), { status: 403 });
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
