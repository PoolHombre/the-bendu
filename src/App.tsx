import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { ScoreDisplay } from './components/ScoreDisplay';
import { DetailPage } from './components/DetailPage';
import { Magnifier } from './components/Magnifier';
import { BenduMark } from './components/Logo';
import type { Session } from '@supabase/supabase-js';
import './App.css';

type Page = 'home' | 'detail' | 'magnifier';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('home');
  const [mirrorClaim, setMirrorClaim] = useState('');

  function openMirror(claim = '') {
    setMirrorClaim(claim);
    setPage('magnifier');
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  const userId = session.user.id;

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1
          className="topbar-title topbar-brand"
          onClick={() => setPage('home')}
        >
          <BenduMark size={22} />
          The Bendu
        </h1>
        <div className="topbar-right">
          <span className="topbar-email">{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-ghost"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="main-content">
        {page === 'home' && (
          <ScoreDisplay
            userId={userId}
            onNavigateDetail={() => setPage('detail')}
            onOpenMirror={openMirror}
          />
        )}
        {page === 'detail' && (
          <DetailPage
            userId={userId}
            onBack={() => setPage('home')}
            onMagnifier={openMirror}
          />
        )}
        {page === 'magnifier' && (
          <Magnifier
            userId={userId}
            initialClaim={mirrorClaim}
            onBack={() => setPage('home')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
