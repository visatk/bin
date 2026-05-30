import { useState, useEffect } from 'react';
import { Landmark, ArrowRight, Clock, CheckCircle2, XCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function Withdraw() {
  const { user, refreshUser } = useAuth();
  const [address, setAddress] = useState('');
  const [amountPts, setAmountPts] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const amountUsdt = amountPts ? (Number(amountPts) / 100).toFixed(2) : '0.00';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/withdraw');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to load withdrawal history", e);
    } finally {
      setFetching(false);
    }
  };

  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amountPts) < 100) {
      toast.error("Minimum withdrawal is 100 PTS");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      toast.error("Invalid BEP20 address format");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amountPts: Number(amountPts) })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Withdrawal submitted');
        setAddress('');
        setAmountPts('');
        fetchHistory();
        if (refreshUser) refreshUser(); // Refresh user balance
      } else {
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (e) {
      toast.error('Network error during submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
      <header className="flex flex-col gap-1 focus-visible:outline-none" tabIndex={-1}>
        <h1 className="text-3xl font-black text-white tracking-tight">Withdraw Funds</h1>
        <p className="text-slate-300 text-sm">Exchange your points for USDT directly to your wallet.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Section */}
        <section className="bg-[#11141d] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-bl-full blur-[60px] pointer-events-none" aria-hidden="true" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Landmark size={28} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create Request</h2>
                  <p className="text-sm text-slate-400">1 PTS = 1 USDT</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Available</p>
                <p className="text-2xl font-black text-white">{user?.credits?.toLocaleString() || 0} <span className="text-emerald-400 text-base">PTS</span></p>
              </div>
            </div>

            <form onSubmit={submitWithdrawal} className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-black text-slate-400 uppercase tracking-widest">USDT (BEP20) Address</Label>
                <div className="relative">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount (PTS)</Label>
                <div className="flex gap-4">
                  <input
                    id="amount"
                    type="number"
                    min="100"
                    step="1"
                    value={amountPts}
                    onChange={(e) => setAmountPts(e.target.value)}
                    placeholder="Min. 100"
                    className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setAmountPts(String(user?.credits || 0))}
                    className="h-auto bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-300 font-bold px-6 rounded-xl"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-emerald-100">You will receive:</span>
                <span className="text-xl font-black text-emerald-400">${amountUsdt} USDT</span>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !amountPts || !address}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-14 mt-2 shadow-[0_5px_20px_rgba(16,185,129,0.2)] transition-transform active:scale-[0.98]"
              >
                {loading ? 'Processing...' : 'Submit Request'}
                {!loading && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </form>
          </div>
        </section>

        {/* History Section */}
        <section className="bg-[#11141d] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/50">
            <h2 className="text-lg font-bold text-white">Recent Withdrawals</h2>
            <Badge variant="outline" className="bg-black/50 text-slate-400 border-slate-700">
              {history.length} Records
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px] flex flex-col gap-3">
            {fetching ? (
              <p className="text-center text-slate-500 py-8 animate-pulse font-medium">Loading history...</p>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Clock size={40} className="mb-3 opacity-20" />
                <p className="font-medium">No withdrawal history found.</p>
              </div>
            ) : (
              history.map((record) => (
                <div key={record.id} className="bg-black/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {record.status === 'approved' && <CheckCircle2 size={16} className="text-emerald-500" />}
                      {record.status === 'rejected' && <XCircle size={16} className="text-red-500" />}
                      {record.status === 'pending' && <Clock size={16} className="text-amber-500" />}
                      <span className="font-bold text-white">${record.amountUsdt.toFixed(2)} USDT</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase font-black tracking-wider ${
                      record.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      record.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {record.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end mt-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Destination</span>
                      <span className="text-xs text-slate-400 font-mono truncate max-w-[150px] sm:max-w-[200px]" title={record.address}>
                        {record.address}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
