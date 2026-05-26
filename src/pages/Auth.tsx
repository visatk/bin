import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();

  // Route Guard
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { username, password } : { username, password, referralCode };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        if (isLogin) {
          await refreshUser();
          navigate('/dashboard');
        } else {
          toast.success('Node initialized. Please authenticate.');
          setIsLogin(true);
          setPassword(''); // Clear password field for security
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || (isLogin ? 'Authentication failure' : 'Initialization failed'));
      }
    } catch (err) {
      toast.error('Network connection disrupted. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      
      <main className="w-full max-w-sm bg-[#11141d]/80 backdrop-blur-2xl rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-800/60 z-10 transition-all">
        
        <header className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40 border border-blue-400/30">
            <ShieldCheck size={28} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">BIN<span className="text-blue-500">SHOP</span></h1>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              {isLogin ? 'Authenticate to access network.' : 'Initialize secure node identity.'}
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="auth-username" className="sr-only">Username</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
              <Input 
                id="auth-username"
                type="text" 
                placeholder="Network Alias" 
                required 
                disabled={isSubmitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-11 bg-[#0a0c10] border-slate-800 text-slate-100 placeholder:text-slate-500 h-12 rounded-xl focus-visible:ring-blue-500 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password" className="sr-only">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
              <Input 
                id="auth-password"
                type="password" 
                placeholder="Passphrase" 
                required 
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 bg-[#0a0c10] border-slate-800 text-slate-100 placeholder:text-slate-500 h-12 rounded-xl focus-visible:ring-blue-500 transition-all" 
              />
            </div>
          </div>
          
          {!isLogin && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="auth-referral" className="sr-only">Referral Code (Optional)</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
                <Input 
                  id="auth-referral"
                  type="text" 
                  placeholder="Invite Code (Optional)" 
                  disabled={isSubmitting}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="pl-11 bg-[#0a0c10] border-slate-800 text-slate-100 placeholder:text-slate-500 h-12 rounded-xl focus-visible:ring-blue-500 transition-all" 
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2 shadow-[0_5px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_5px_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
          >
            {isSubmitting ? (
               <span className="flex items-center gap-2">
                 <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true"/>
                 Processing
               </span>
            ) : (
              isLogin ? 'Authorize Access' : 'Create Node'
            )}
          </Button>
        </form>

        <footer className="mt-8 text-center text-sm text-slate-400 font-medium">
          {isLogin ? "Require an identity? " : "Already initialized? "}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername('');
              setPassword('');
              setReferralCode('');
            }} 
            disabled={isSubmitting}
            className="text-blue-400 hover:text-blue-300 font-bold transition-colors focus-visible:outline-none focus-visible:underline disabled:opacity-50"
          >
            {isLogin ? 'Register Here' : 'Authenticate'}
          </button>
        </footer>
      </main>
    </div>
  );
}
