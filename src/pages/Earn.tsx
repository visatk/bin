import { useState, useEffect, useMemo } from 'react';
import { Copy, Users, Gift, TrendingUp, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Earn() {
  const [stats, setStats] = useState({ referred: 0, earned: 0 });
  const [referralCode, setReferralCode] = useState('...');
  const [loading, setLoading] = useState(true);
  
  const referralLink = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://visatk.us';
    // Prevents making an API call with "..." while loading
    if (referralCode === '...') return '';
    return `${origin}/auth?ref=${referralCode}`;
  }, [referralCode]);
  
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/user/earn', { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.json();
      })
      .then(d => {
        if (d.referralCode) setReferralCode(d.referralCode);
        setStats({ referred: d.totalReferrals || 0, earned: d.pointsEarned || 0 });
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          toast.error("Failed to sync reward metrics");
        }
      })
      .finally(() => setLoading(false));
      
    return () => controller.abort();
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Affiliate link recorded to memory buffer.');
    } catch (err) {
      toast.error('Clipboard access denied.');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in slide-in-from-left-4 duration-500 max-w-3xl mx-auto w-full">
      <header className="text-center mt-6 md:mt-10 mb-4">
        <div className="inline-flex p-4 bg-purple-500/10 border border-purple-500/20 rounded-3xl mb-5 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
          <Gift size={36} className="text-purple-400" aria-hidden="true" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Affiliate Program</h1>
        <p className="text-slate-400 text-sm md:text-base mt-3 max-w-md mx-auto font-medium leading-relaxed">
          Earn up to $3000 for every successful referral <strong className="text-purple-400 font-black">10%</strong> of their provision value in Points.
        </p>
      </header>

      <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-bl-full blur-[50px] pointer-events-none" aria-hidden="true" />
        
        <div className="relative z-10 flex-1 w-full">
          <Label htmlFor="referral-link" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Unique Access Key (URL)</Label>
          <div className="flex items-center gap-3 bg-[#0a0c10] p-2 pl-5 rounded-2xl border border-slate-700 shadow-inner focus-within:border-purple-500/50 transition-colors">
            <span id="referral-link" className={`flex-1 text-sm md:text-base font-mono truncate transition-opacity ${loading ? 'opacity-50 blur-[2px]' : 'text-purple-300'}`}>
              {referralLink || 'Initializing...'}
            </span>
            <Button 
              onClick={copyLink} 
              disabled={loading || !referralLink}
              aria-label="Copy referral link"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl h-12 px-6 shadow-[0_5px_15px_rgba(147,51,234,0.2)] active:scale-95 transition-transform shrink-0"
            >
              <Copy size={18} className="md:mr-2" aria-hidden="true" /> <span className="hidden md:inline">Copy</span>
            </Button>
          </div>
          <div className="mt-4 flex items-start gap-3 text-purple-400/90 bg-purple-500/10 p-4 rounded-xl text-xs font-bold border border-purple-500/20">
            <Gift size={16} className="shrink-0 mt-0.5" />
            <p>Share this link or QR code. You'll receive 10% of your invitee's first topup automatically.</p>
          </div>
        </div>

        {/* API Based Native QR Image */}
        <div className="relative z-10 flex flex-col items-center justify-center bg-white p-3 rounded-2xl shadow-inner shrink-0 w-[150px] h-[150px]">
          {!loading && referralLink ? (
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(referralLink)}&bgcolor=ffffff&color=000000`}
               alt="Referral Link QR Code"
               className="w-[125px] h-[125px] object-contain rounded-md"
               loading="lazy"
             />
          ) : (
             <div className="absolute inset-0 flex items-center justify-center">
                <QrCode className="text-slate-300 animate-pulse" size={32} />
             </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
        <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-lg hover:border-blue-500/30 transition-colors">
          <div className="p-3 bg-blue-500/10 rounded-2xl mb-4">
            <Users size={28} className="text-blue-400" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1" aria-label={`Total network recruits: ${stats.referred}`}>
            <span className="text-4xl font-black text-white tracking-tight">{stats.referred}</span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Network Recruits</span>
          </div>
        </section>
        
        <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-lg hover:border-emerald-500/30 transition-colors">
          <div className="p-3 bg-emerald-500/10 rounded-2xl mb-4">
            <TrendingUp size={28} className="text-emerald-400" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1" aria-label={`Total provisions acquired: ${stats.earned}`}>
            <span className="text-4xl font-black text-white tracking-tight">{stats.earned}</span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Provisions Acquired (PTS)</span>
          </div>
        </section>
      </div>
      
      <footer className="text-center mt-8 px-4">
        <p className="text-xs text-slate-600 font-medium">
          Recruitment points are credited algorithmically upon successful verification of the invitee's deposit.
        </p>
      </footer>
    </div>
  );
}
