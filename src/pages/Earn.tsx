import { useState, useEffect } from 'react';
import { Copy, Users, Gift, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Earn() {
  const [stats, setStats] = useState({ referred: 0, earned: 0 });
  const [referralCode, setReferralCode] = useState('...');
  const referralLink = `https://visatk.us/auth?ref=${referralCode}`;
  
  useEffect(() => {
    fetch('/api/user/earn')
      .then(r => r.json())
      .then(d => {
        if (d.referralCode) setReferralCode(d.referralCode);
        setStats({ referred: d.totalReferrals || 0, earned: d.pointsEarned || 0 });
      });
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-in slide-in-from-left-4 duration-500">
      
      <div className="text-center mt-4 mb-2">
        <div className="inline-flex p-3 bg-purple-500/10 rounded-full mb-3">
          <Gift size={32} className="text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Refer & Earn Points</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
          Invite friends to BINMarket. When they make their first deposit, you instantly receive <strong className="text-purple-400">10%</strong> of their deposit amount in Points!
        </p>
      </div>

      {/* The Link */}
      <section className="bg-[#1e2330] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl pointer-events-none" />
        
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Your Unique Invite Link</label>
        <div className="flex items-center gap-2 bg-[#13151c] p-2 pl-4 rounded-xl border border-slate-700">
          <span className="flex-1 text-sm font-mono text-purple-300 truncate">
            {referralLink}
          </span>
          <Button onClick={copyLink} className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg">
            <Copy size={16} className="mr-2" /> Copy
          </Button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center">
          <Users size={24} className="text-blue-400 mb-2" />
          <span className="text-3xl font-black text-white">{stats.referred}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase mt-1">Total Referrals</span>
        </div>
        
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center">
          <TrendingUp size={24} className="text-green-400 mb-2" />
          <span className="text-3xl font-black text-white">{stats.earned}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase mt-1">Points Earned</span>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-xs text-slate-600">Referral points are credited automatically upon successful topup by the invitee.</p>
      </div>
    </div>
  );
}
