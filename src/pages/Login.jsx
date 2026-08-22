import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  // OAuth handlers
  const handleOAuth = (provider) => {
    window.location.href = `http://localhost:3001/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4">
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Sign In</h1>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#999] text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#4a9eff] transition-colors"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#999] text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#4a9eff] transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a9eff] text-white py-2 rounded-lg hover:bg-[#3a8aee] transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3a3a3a]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#252525] text-[#666]">Or continue with</span>
          </div>
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          {/* Google */}
          <button
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a] border border-[#3a3a3a] text-white py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          {/* GitHub */}
          <button
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a] border border-[#3a3a3a] text-white py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </button>

          {/* Microsoft */}
          <button
            onClick={() => handleOAuth('microsoft')}
            className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a] border border-[#3a3a3a] text-white py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z"/>
              <path fill="#7fba00" d="M1 13h10v10H1z"/>
              <path fill="#00a4ef" d="M13 1h10v10H13z"/>
              <path fill="#ffb900" d="M13 13h10v10H13z"/>
            </svg>
            Microsoft
          </button>
        </div>

        <p className="text-center text-[#666] text-sm mt-4">
          Don't have an account? <Link to="/register" className="text-[#4a9eff] hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}