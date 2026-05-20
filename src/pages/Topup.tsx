import { useState, useEffect } from 'react';
import { Wallet, Copy, ArrowRight, Clock, CheckCircle2, XCircle, History, ShieldAlert, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  txHash: string;
  currency: string;
  creditsToAdd: number;
  status: 'pending' | 'paid' | 'rejected';
  createdAt: string;
}

// Configured with live production wallet addresses
const WALLETS: Record<string, string> = {
  'LTC': 'LS4tMyzN5pzovB3iJtmo1cWoo8gHdNcjxy',
  'ETH': '0x32717e9d5e81ca1cb22335c412421e6f83b69d83',
  'USDT (TRX)': 'TGxhyDRrU8EfzozZqM7sK6bztSK348Ue9Y'
};

export default function Topup() {
  const [history, setHistory] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [currency, setCurrency] = useState<keyof typeof WALLETS>('LTC');
  const [txHash, setTxHash] = useState('');
  const [credits, setCredits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/topup/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim() || !credits) return toast.error('Please fill all fields');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/topup/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Parse the base currency name for the backend if needed (e.g., "USDT (TRX)" -> "USDT")
        body: JSON.stringify({ txHash, currency: currency.split(' ')[0], creditsToAdd: Number(credits) })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Transaction submitted successfully!');
        setTxHash('');
        setCredits('');
        await fetchHistory();
      } else {
        toast.error(data.error || 'Failed to submit transaction');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-0.5"><CheckCircle2 size={12} className="mr-1.5"/> Approved</Badge>;
      case 'rejected': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-2 py-0.5"><XCircle size={12} className="mr-1.5"/> Rejected</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2 py-0.5"><Clock size={12} className="mr-1.5"/> Pending</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-[#13151c] border border-slate-800 p-6 md:p-8 shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Wallet className="text-blue-400" size={28} />
            </div>
            Add Funds
          </h1>
          <p className="text-slate-400 mt-2 max-w-md text-sm">
            Deposit crypto securely. Automated verify transactions on-chain. 1 USD = 1 CR.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Topup Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ArrowRight size={20} className="text-blue-500" /> Secure Deposit
            </h2>
            
            {/* Step 1: Currency Selection */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">1. Select Network</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(WALLETS).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c as keyof typeof WALLETS)}
                    className={`py-2.5 px-1 rounded-lg text-[13px] font-bold transition-all border ${
                      currency === c 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Transfer Funds */}
            <div className="mb-8 p-4 bg-[#13151c] rounded-xl border border-slate-800 shadow-inner">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">2. Send {currency.split(' ')[0]} To Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/40 text-slate-300 text-sm px-3 py-2.5 rounded-lg border border-slate-800 break-all">
                  {WALLETS[currency]}
                </code>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => copyToClipboard(WALLETS[currency])}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white shrink-0"
                >
                  <Copy size={16} />
                </Button>
              </div>
              <div className="mt-3 flex items-start gap-2 text-amber-500/80 bg-amber-500/10 p-2.5 rounded-lg text-xs font-medium border border-amber-500/20">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <p>Only send {currency} via its native network. Other assets will be permanently lost.</p>
              </div>
            </div>

            {/* Step 3: Verification Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-t border-slate-800 pt-6">
                3. Verify Transaction
              </label>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Transaction Hash (TXID)</label>
                <Input 
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="e.g. 0xabc123..."
                  className="bg-[#13151c] border-slate-700 text-white focus-visible:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Credits Expected (Amount Sent)</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <Input 
                    type="number"
                    min="1"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    placeholder="100"
                    className="pl-9 bg-[#13151c] border-slate-700 text-white focus-visible:ring-blue-500"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">CR</div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Processing...</span>
                ) : (
                  'Submit for Verification'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Ledger History */}
        <div className="lg:col-span-7">
          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-6 h-full shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History size={20} className="text-slate-400" /> Transactions
              </h2>
              <Badge variant="outline" className="bg-slate-800/50 text-slate-400 border-slate-700">
                {history.length} Records
              </Badge>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-[#13151c] rounded-xl animate-pulse border border-slate-800/50" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-[#13151c]/50">
                <Wallet size={48} className="text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-400">No transactions yet</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-[250px]">
                  Your deposit history will appear here once you submit a transaction.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#13151c]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5 font-bold">Details</th>
                      <th className="px-4 py-3.5 font-bold text-right">Amount</th>
                      <th className="px-4 py-3.5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {history.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">{inv.currency}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(inv.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <code className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[200px]" title={inv.txHash}>
                              {inv.txHash.substring(0, 16)}...
                            </code>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-black text-white">{inv.creditsToAdd}</span>
                          <span className="text-xs text-blue-500 font-bold ml-1">CR</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {getStatusBadge(inv.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
