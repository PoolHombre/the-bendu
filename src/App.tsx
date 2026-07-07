import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { ScoreDisplay } from './components/ScoreDisplay';
import { DetailPage } from './components/DetailPage';
import { Magnifier } from './components/Magnifier';
import type { Session } from '@supabase/supabase-js';

type Page = 'home' | 'detail' | 'magnifier';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>('home');

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
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  const userId = session.user.id;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{ fontSize: 18, margin: 0, cursor: 'pointer' }}
          onClick={() => setPage('home')}
        >
          The Bendu
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666' }}>
            {session.user.email}
          </span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              background: 'white',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {page === 'home' && (
        <ScoreDisplay
          userId={userId}
          onNavigateDetail={() => setPage('detail')}
        />
      )}
      {page === 'detail' && (
        <DetailPage
          userId={userId}
          onBack={() => setPage('home')}
          onMagnifier={() => setPage('magnifier')}
        />
      )}
      {page === 'magnifier' && <Magnifier onBack={() => setPage('detail')} />}
    </div>
  );
}

export default App;
