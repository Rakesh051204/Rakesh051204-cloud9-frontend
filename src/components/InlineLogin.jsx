import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function InlineLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      onSuccess && onSuccess();
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-full w-full py-20">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-white text-center mb-1">Sign in to Stoic</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Curiosity first, answers second.</p>

        <button
          type="button"
          onClick={() => handleOAuth('google')}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black font-medium py-2.5 rounded-lg transition-colors mb-3"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth('github')}
          className="w-full flex items-center justify-center gap-2 bg-[#24292f] hover:bg-[#2f363d] text-white font-medium py-2.5 rounded-lg transition-colors mb-6"
        >
          Continue with GitHub
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-[#2a2a2a] flex-1" />
          <span className="text-xs text-gray-500">or</span>
          <div className="h-px bg-[#2a2a2a] flex-1" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-[#2a2a2a] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#2a2a2a] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
