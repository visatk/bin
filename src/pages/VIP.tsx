import { Crown, CheckCircle2, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function VIP() {
  const { refreshUser, user } = useAuth();
  
  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/vip/purchase', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Clearance elevated to Lifetime VIP.');
        await refreshUser();
      } else {
        toast.error(data.error || 'Clearance elevation failed');
      }
    } catch (err) {
      toast.error('Network integrity error');
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-8 pb-24 animate-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto w-full">
      
      <header className="text-center mb-12 mt-6 md:mt-10 relative">
        <div className="inline-flex items-center justify-center p-5 bg-amber-500/10 border border-amber-500/20 rounded-3xl mb-6 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
          <Crown size={56} className="text-amber-400 drop-shadow-xl" aria-hidden="true" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Upgrade <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 bg-clip-text text-transparent">VIP</span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-lg mx-auto text-sm md:text-base font-medium leading-relaxed">
          Access All VIP Benefit
        </p>
      </header>

      <main className="max-w-md mx-auto w-full">
        <section 
          className="relative bg-[#0d0a06] border border-amber-500/30 rounded-3xl p-8 flex flex-col shadow-[0_20px_50px_-15px_rgba(245,158,11,0.2)] overflow-hidden"
          aria-labelledby="vip-tier-name"
        >
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-amber-500/10 blur-[60px] pointer-events-none" aria-hidden="true" />
          
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-yellow-200/50">
            <Gem size={12} aria-hidden="true" /> PERMANENT CLEARANCE
          </div>
          
          <h2 id="vip-tier-name" className="text-3xl font-black text-amber-400 mb-2 mt-4 text-center tracking-tight">Elite Master</h2>
          <div className="flex items-baseline justify-center gap-2 mb-10" aria-label="Cost is 100 Points for a Lifetime duration">
            <span className="text-6xl font-black text-white drop-shadow-md">100</span>
            <span className="text-sm text-amber-500/80 font-bold uppercase tracking-widest" aria-hidden="true">PTS / LIFETIME</span>
          </div>
          
          <ul className="flex flex-col gap-5 mb-10 flex-1 relative z-10" aria-label="VIP Features">
            <FeatureItem text="Unrestricted Lifetime Access All VIP Products" />
            <FeatureItem text="Priority Authorization to VIP-Only Assets" />
            <FeatureItem text="15% Procurement Discount across all categories" />
            <FeatureItem text="Direct Secure-Channel access to Admins" />
            <FeatureItem text="Automated Procurement Script API Access" />
          </ul>
          
          <Button 
            onClick={handleUpgrade} 
            disabled={user?.isVip}
            aria-disabled={user?.isVip}
            className={`w-full font-black text-lg h-14 rounded-xl transition-all shadow-[0_5px_20px_rgba(245,158,11,0.3)] active:scale-95 ${
              user?.isVip 
                ? 'bg-slate-900 border border-amber-500/20 text-amber-500/50 opacity-100 shadow-none cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black'
            }`}
          >
            {user?.isVip ? 'Clearance Established' : 'Initiate Protocol'}
          </Button>
        </section>
      </main>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3.5">
      <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
      <span className="font-semibold text-sm text-amber-100/90 leading-snug">{text}</span>
    </li>
  );
}
