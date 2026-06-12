import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a dummy client structure during build/prerendering to prevent crashes
    if (typeof window === "undefined") {
      console.warn("Supabase credentials missing. Running client in mock/offline mode.");
    }
    
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === "auth") {
          return {
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signOut: async () => ({ error: null }),
            signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase URL/Key missing") }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Supabase URL/Key missing") })
          };
        }
        
        // Return a chainable dummy function for query builders
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

  return createBrowserClient(url, anonKey);
}
