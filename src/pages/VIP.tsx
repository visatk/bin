import { Crown, CheckCircle2, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function VIP() {
  // Pulling 'user' to verify existing VIP status
  const { refreshUser, user } = useAuth();
  
  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/vip/purchase', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Successfully upgraded to Lifetime VIP!');
        await refreshUser();
      } else {
        toast.error(data.error || 'Upgrade failed');
      }
    } catch (err) {
      toast.error('Network error occurred');
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 pb-24 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-10 mt-6 relative">
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-4 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          <Crown size={48} className="text-amber-400 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Unlock <span className="bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">Premium Access</span>
        </h1>
        <p className="text-slate-400 mt-3 max-w-md mx-auto">
          Get exclusive access to untouched, highest-quality bins before they hit the public market.
        </p>
      </div>

      <div className="max-w-md mx-auto w-full">
        <div className="relative bg-gradient-to-b from-[#2a1d0d] to-[#1e160a] border border-amber-500/30 rounded-2xl p-6 flex flex-col shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Gem size={12} /> LIFETIME DEAL
          </div>
          
          <h2 className="text-2xl font-bold text-amber-400 mb-2 mt-2 text-center">Elite Master</h2>
          <div className="flex items-baseline justify-center gap-2 mb-8">
            <span className="text-5xl font-black text-white">100</span>
            <span className="text-sm text-amber-500/70 font-bold uppercase tracking-wider">Credits / Lifetime</span>
          </div>
          
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <FeatureItem text="Unlimited Lifetime VIP Access" textClass="text-amber-100" iconClass="text-amber-400" />
            <FeatureItem text="Access to VIP-Only Bins" textClass="text-amber-100" iconClass="text-amber-400" />
            <FeatureItem text="15% Discount on all store items" textClass="text-amber-100" iconClass="text-amber-400" />
            <FeatureItem text="Direct Telegram access to Admins" textClass="text-amber-100" iconClass="text-amber-400" />
            <FeatureItem text="Auto-buy script API access" textClass="text-amber-100" iconClass="text-amber-400" />
          </ul>
          
          <Button 
            onClick={handleUpgrade} 
            disabled={user?.isVip}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-lg h-14 shadow-[0_5px_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user?.isVip ? 'Lifetime Unlocked' : 'Go Elite Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text, textClass = "text-slate-300", iconClass = "text-blue-400" }: { text: string, textClass?: string, iconClass?: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={20} className={`shrink-0 mt-0.5 ${iconClass}`} />
      <span className={`font-medium text-sm ${textClass}`}>{text}</span>
    </li>
  );
}
