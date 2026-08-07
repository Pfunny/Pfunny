import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Session } from '@supabase/supabase-js';
import AuthGate from './AuthGate';
import { isSupabaseConfigured, supabase } from './supabase';

function AuthLayer() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.authenticated = session ? 'true' : 'false';
  }, [session]);

  return <AuthGate><span /></AuthGate>;
}

const host = document.createElement('div');
host.id = 'auth-root';
document.body.appendChild(host);

const style = document.createElement('style');
style.textContent = `
  #auth-root:empty{display:none}
  html:not([data-authenticated="true"]) #root{visibility:hidden;pointer-events:none}
  html:not([data-authenticated="true"]) #auth-root{position:fixed;inset:0;z-index:99999;overflow:auto}
  html[data-authenticated="true"] #auth-root{position:relative;z-index:99999}
`;
document.head.appendChild(style);

if (!isSupabaseConfigured) document.documentElement.dataset.authenticated = 'false';
createRoot(host).render(<React.StrictMode><AuthLayer /></React.StrictMode>);
