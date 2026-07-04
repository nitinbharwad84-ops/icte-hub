'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { Mail, Lock } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loginAttempts, setLoginAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    if (cooldown) {
      const timer = setTimeout(() => {
        setCooldown(false);
        setLoginAttempts(0);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 3) {
        setCooldown(true);
      }
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, must_change_password')
        .eq('id', user.id)
        .single();

      if (profile?.must_change_password) {
        router.push('/change-password');
      } else {
        router.push(`/${profile?.role || 'telecaller'}`);
      }
    }

  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-[2rem] p-8 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <IcteLogo size={48} />
            <h1 className="text-2xl font-extrabold text-slate-900 mt-4">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your dashboard</p>
          </div>

          {searchParams.get('reason') === 'deactivated' && (
            <Alert variant="error" className="mb-4">Your account has been deactivated. Contact your administrator.</Alert>
          )}
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}
          {cooldown && <Alert variant="error" className="mb-4">Too many attempts — wait 30 seconds</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />
            <Button type="submit" variant="primary" className="w-full" size="lg" loading={loading} disabled={cooldown}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
