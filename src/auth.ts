import { supabase, isSupabaseConfigured } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

const DEMO_SESSION_KEY = 'para-ela-session';

// Altere para true quando quiser que o login seja estritamente obrigatório para ver a lista
export const REQUIRE_AUTH = true;

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) {
    const isDemo = localStorage.getItem(DEMO_SESSION_KEY) === 'ok';
    if (!isDemo) return null;
    return {
      access_token: 'demo-token',
      token_type: 'bearer',
      user: {
        id: 'demo-user',
        email: 'demo@nossoespaco.com',
        app_metadata: {},
        user_metadata: { name: 'Visitante' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    } as unknown as Session;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function loginWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) {
    localStorage.setItem(DEMO_SESSION_KEY, 'ok');
    return {
      data: {
        user: { id: 'demo-user', email } as unknown as User,
        session: { access_token: 'demo-token', user: { id: 'demo-user', email } } as unknown as Session,
      },
      error: null,
    };
  }

  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) {
    localStorage.setItem(DEMO_SESSION_KEY, 'ok');
    return {
      data: {
        user: { id: 'demo-user', email } as unknown as User,
        session: { access_token: 'demo-token', user: { id: 'demo-user', email } } as unknown as Session,
      },
      error: null,
    };
  }

  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/index.html`,
    },
  });
}

export async function loginWithGoogle() {
  if (!isSupabaseConfigured) {
    localStorage.setItem(DEMO_SESSION_KEY, 'ok');
    window.location.href = 'index.html';
    return { data: null, error: null };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/index.html`,
    },
  });
}

export async function logout(): Promise<void> {
  localStorage.removeItem(DEMO_SESSION_KEY);
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured) {
    const isDemo = localStorage.getItem(DEMO_SESSION_KEY) === 'ok';
    callback(isDemo ? ({ email: 'demo@nossoespaco.com' } as User) : null);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
}

export async function checkAuth(requireAuth = REQUIRE_AUTH): Promise<void> {
  const logged = await isLoggedIn();
  const isLoginPage = window.location.pathname.endsWith('entrar.html');

  if (requireAuth && !logged && !isLoginPage) {
    window.location.href = 'entrar.html';
  } else if (logged && isLoginPage) {
    window.location.href = 'index.html';
  }
}
