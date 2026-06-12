import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("Supabase credentials missing on server. Running server in mock/offline mode.");
    
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === "auth") {
          return {
            getUser: async () => ({ data: { user: null }, error: null }),
            exchangeCodeForSession: async () => ({ data: { session: null }, error: null })
          };
        }
        
        return () => {
          const queryBuilder: any = {
            select: () => queryBuilder,
            insert: () => queryBuilder,
            update: () => queryBuilder,
            delete: () => queryBuilder,
            eq: () => queryBuilder,
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null }),
            order: () => queryBuilder,
            then: (resolve: any) => resolve({ data: null, error: null })
          };
          return queryBuilder;
        };
      }
    });
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if handled by proxy/middleware
        }
      },
    },
  });
}
