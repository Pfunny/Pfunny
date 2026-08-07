import { FormEvent, ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import './auth.css';

type Mode = 'login' | 'register' | 'reset';

export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return <main className="auth-shell"><section className="auth-card setup-card"><span className="auth-kicker">CH.FANDRICH STUDIO 2.0</span><h1>Supabase Auth einrichten</h1><p>Die Anmeldung ist implementiert, aber noch nicht mit einem Supabase-Projekt verbunden.</p><ol><li>In Supabase ein Projekt anlegen.</li><li><code>VITE_SUPABASE_URL</code> und <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code> eintragen.</li><li>Die App neu starten.</li></ol><p className="auth-note">Der öffentliche Anon-Key darf im Browser verwendet werden. Der Service-Role-Key gehört niemals ins Frontend.</p></section></main>;
  }

  if (loading) return <main className="auth-shell"><section className="auth-card"><h1>Sitzung wird geprüft …</h1></section></main>;

  if (session) {
    return <><div className="account-bar"><span>Angemeldet als <b>{session.user.user_metadata?.full_name || session.user.email}</b></span><button onClick={() => supabase?.auth.signOut()}>Abmelden</button></div>{children}</>;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!supabase) return;
    if (mode === 'register' && password !== confirmPassword) {
      setMessage('Die Passwörter stimmen nicht überein.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        setMessage('Registrierung erfolgreich. Bitte bestätige gegebenenfalls deine E-Mail-Adresse.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMessage('E-Mail zum Zurücksetzen wurde versendet.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-shell"><section className="auth-card"><span className="auth-kicker">CH.FANDRICH STUDIO 2.0</span><h1>{mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Konto erstellen' : 'Passwort zurücksetzen'}</h1><p>{mode === 'login' ? 'Öffne deine persönlichen Buchprojekte.' : mode === 'register' ? 'Erstelle dein persönliches Studio-Konto.' : 'Wir senden dir einen sicheren Rücksetzlink.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Name<input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>}<label>E-Mail<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>{mode !== 'reset' && <label>Passwort<input required minLength={8} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>}{mode === 'register' && <label>Passwort bestätigen<input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></label>}<button className="auth-primary" disabled={busy}>{busy ? 'Bitte warten …' : mode === 'login' ? 'Anmelden' : mode === 'register' ? 'Registrieren' : 'Link senden'}</button></form>{message && <p className="auth-message" role="status">{message}</p>}<div className="auth-links">{mode !== 'login' && <button onClick={() => setMode('login')}>Zur Anmeldung</button>}{mode !== 'register' && <button onClick={() => setMode('register')}>Konto erstellen</button>}{mode === 'login' && <button onClick={() => setMode('reset')}>Passwort vergessen</button>}</div></section></main>;
}
