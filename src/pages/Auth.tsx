import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Store, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { username, password } : { username, password, referralCode };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      if (isLogin) {
        await refreshUser();
        navigate('/');
      } else {
        toast.success('Registration successful. Please login.');
        setIsLogin(true);
      }
    } else {
      toast.error(isLogin ? 'Invalid credentials' : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#13151c] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1e2330] rounded-2xl p-6 shadow-2xl border border-slate-800">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">TheBinStore</h1>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Welcome back to the vault.' : 'Create your secure account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input 
              type="text" 
              placeholder="Username" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 bg-[#13151c] border-slate-800 text-white placeholder:text-slate-600 h-11 rounded-lg" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-[#13151c] border-slate-800 text-white placeholder:text-slate-600 h-11 rounded-lg" 
            />
          </div>
          
          {!isLogin && (
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input 
                type="text" 
                placeholder="Referral Code (Optional)" 
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="pl-10 bg-[#13151c] border-slate-800 text-white placeholder:text-slate-600 h-11 rounded-lg" 
              />
            </div>
          )}
          
          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg mt-2">
            {isLogin ? 'Secure Login' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
