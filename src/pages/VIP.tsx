import { useState } from 'react';
import { Crown, CheckCircle2, Gem, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function VIP() {
  const { refreshUser, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/vip/purchase', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Successfully upgraded to VIP status.');
        await refreshUser();
      } else {
        toast.error(data.error || 'Clearance elevation failed');
      }
    } catch (err) {
      toast.error('Network integrity error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 lg:p-10 xl:p-12 pb-24 animate-in fade-in duration-300 w-full max-w-7xl mx-auto">
      
      {/* Matching the Header Style with Shop/Dashboard */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/60 to-yellow-950/40 border border-amber-500/30 p-6 md:p-8 shadow-[0_15px_40px_-15px_rgba(245,158,11,0.2)]">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Elite VIP Access <Crown className="text-amber-400 drop-shadow-lg" size={32} aria-hidden="true" />
          </h1>
          <p className="text-amber-100/70 mt-2 max-w-lg text-sm md:text-base font-medium">
            Elevate your account clearance. Unlock exclusive VIP assets, premium market discounts, and direct admin support.
          </p>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-600/20 rounded-full blur-[80px] pointer-events-none" />
      </header>

      <main className="flex justify-center w-full mt-4">
        {/* Container matches Dashboard Surface colors but retains Amber hover states */}
        <section 
          className="relative bg-[#11141d] border border-slate-800/80 rounded-3xl p-8 md:p-10 flex flex-col shadow-2xl max-w-lg w-full transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_20px_50px_-15px_rgba(245,158,11,0.15)] overflow-hidden"
          aria-labelledby="vip-tier-name"
        >
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/10 blur-[60px] pointer-events-none" aria-hidden="true" />
          
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-4 py-1.5 text-sm font-black tracking-widest uppercase flex items-center gap-2 shadow-lg">
              <Gem size={14} aria-hidden="true" /> Lifetime Access
            </Badge>
          </div>
          
          <div className="text-center mb-8">
            <h2 id="vip-tier-name" className="text-3xl font-black text-white mb-4 tracking-tight">VIP Mastery</h2>
            <div className="flex items-baseline justify-center gap-2" aria-label="Cost is 100 Points for a Lifetime duration">
              <span className="text-6xl font-black text-amber-400 drop-shadow-md tracking-tighter">100</span>
              <span className="text-lg text-slate-400 font-bold uppercase tracking-widest" aria-hidden="true">PTS</span>
            </div>
          </div>
          
          {/* Features container matches vault/feed inner cards */}
          <div className="bg-[#0a0c10] border border-slate-800 rounded-2xl p-6 mb-8 relative z-10 shadow-inner">
            <ul className="flex flex-col gap-4" aria-label="VIP Features">
              <FeatureItem text="Unrestricted access to all VIP Products" />
              <FeatureItem text="Priority access to exclusive assets" />
              <FeatureItem text="15% Base Discount across the market" />
              <FeatureItem text="Direct Secure-Channel access to Admins" />
              <FeatureItem text="Early access to new platform features" />
            </ul>
          </div>
          
          <Button 
            onClick={handleUpgrade} 
            disabled={user?.isVip || isProcessing}
            aria-disabled={user?.isVip || isProcessing}
            className={`w-full font-black text-lg h-14 rounded-xl transition-all active:scale-95 ${
              user?.isVip 
                ? 'bg-slate-900 border border-slate-700 text-amber-500/50 shadow-none cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-[0_5px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_5px_30px_rgba(245,158,11,0.5)]'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-current border-t-transparent border-black rounded-full animate-spin" aria-hidden="true"/>
                Processing...
              </span>
            ) : user?.isVip ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={20} /> Clearance Active
              </span>
            ) : (
              'Activate VIP Clearance'
            )}
          </Button>
        </section>
      </main>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      {/* Replaced standard check with glowing Star for premium feel */}
      <Star size={18} className="shrink-0 mt-0.5 text-amber-500 fill-amber-500/20" aria-hidden="true" />
      <span className="font-semibold text-sm text-slate-300 leading-snug">{text}</span>
    </li>
  );
}
