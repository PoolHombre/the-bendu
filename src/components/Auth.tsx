import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 20 }}>
      <h1 style={{ marginBottom: 4 }}>The Bendu</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Personal clarity evaluation
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />
        {error && <p style={{ color: '#EF4444', fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? '...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        style={{
          background: 'none',
          border: 'none',
          color: '#3B82F6',
          cursor: 'pointer',
          marginTop: 12,
        }}
      >
        {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  marginBottom: 12,
  border: '1px solid #ddd',
  borderRadius: 4,
  fontSize: 14,
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px',
  background: '#3B82F6',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  fontSize: 14,
  cursor: 'pointer',
};
