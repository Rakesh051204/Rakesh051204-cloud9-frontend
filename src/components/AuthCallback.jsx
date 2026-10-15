import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function AuthCallback({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setError('Sign-in failed, please try again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const user = data.session.user;
      const email = user.email;
      const name = user.user_metadata?.full_name || user.user_metadata?.name || email;

      try {
        const res = await fetch('http://localhost:3001/auth/oauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, provider: user.app_metadata?.provider }),
        });
        const backendData = await res.json();
        if (!res.ok) throw new Error(backendData.error || 'Backend login failed');

        localStorage.setItem('stoic_token', backendData.token);
        localStorage.setItem('stoic_user', JSON.stringify(backendData.user));
        onLogin(backendData.user, backendData.token);
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    };
    run();
  }, [navigate, onLogin]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-gray-400">
      {error || 'Signing you in...'}
    </div>
  );
}
