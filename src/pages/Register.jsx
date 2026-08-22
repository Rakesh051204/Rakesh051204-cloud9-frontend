import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4">
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Create Account</h1>
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
          <div className="mb-4">
            <label className="block text-[#999] text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#4a9eff] transition-colors"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#999] text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#4a9eff] transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a9eff] text-white py-2 rounded-lg hover:bg-[#3a8aee] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-[#666] text-sm mt-4">
          Already have an account? <Link to="/login" className="text-[#4a9eff] hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
