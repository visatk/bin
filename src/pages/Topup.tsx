import { useState, useEffect } from 'react';
import { Wallet, Copy, ArrowRight, Clock, CheckCircle2, XCircle, History, ShieldAlert, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const WALLETS: Record<string, string> = {
  'LTC': 'LS4tMyzN5pzovB3iJtmo1cWoo8gHdNcjxy',
  'ETH': '0x32717e9d5e81ca1cb22335c412421e6f83b69d83',
  'USDT (TRX)': 'TGxhyDRrU8EfzozZqM7sK6bztSK348Ue9Y'
};

export default function Topup() {
  const [history, setHistory] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    } catch (e) {
      toast.error('Failed to sync history from edge');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address securely copied to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash.trim() || !credits) return toast.error('Incomplete payload. Please fill all fields.');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/topup/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash, currency: currency.split(' ')[0], creditsToAdd: Number(credits) })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Transaction registered for verification.');
        setTxHash('');
        setCredits('');
        await fetchHistory();
      } else {
        toast.error(data.error || 'Transaction submission failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-1 font-bold"><CheckCircle2 size={14} className="mr-1.5" aria-hidden="true" /> Approved</Badge>;
      case 'rejected': return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 px-2.5 py-1 font-bold"><XCircle size={14} className="mr-1.5" aria-hidden="true" /> Rejected</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-2.5 py-1 font-bold"><Clock size={14} className="mr-1.5" aria-hidden="true" /> Pending</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pb-24 animate-in fade-in duration-300 max-w-7xl mx-auto w-full">
      
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-[#0a0c10] border border-slate-800/80 p-8 shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-inner">
              <Wallet className="text-blue-500" size={32} aria-hidden="true" />
            </div>
            Add Funds
          </h1>
          <p className="text-slate-400 mt-3 max-w-lg text-sm md:text-base font-medium leading-relaxed">
            Execute secure on-chain deposits. Transactions are verified automatically against the distributed ledger. <strong className="text-slate-200">1 USD = 1 PTS</strong>.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none" aria-hidden="true">
          <Wallet size={200} className="transform rotate-12 -translate-y-10 translate-x-10" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Provision Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-8">
              <ArrowRight size={22} className="text-blue-500" aria-hidden="true" /> Deposit Instructions
            </h2>
            
            {/* Step 1 */}
            <fieldset className="mb-8 border-none p-0 m-0">
              <legend className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">1. Select Blockchain Network</legend>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(WALLETS).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c as keyof typeof WALLETS)}
                    aria-pressed={currency === c}
                    className={`py-3 px-1 rounded-xl text-[13px] font-bold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      currency === c 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                        : 'bg-[#0a0c10] border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Step 2 */}
            <div className="mb-10 p-5 bg-[#0a0c10] rounded-2xl border border-slate-800 shadow-inner">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">2. Send {currency.split(' ')[0]} to this address</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-[#11141d] text-slate-200 text-sm md:text-base px-4 py-3 rounded-xl border border-slate-700 break-all font-mono selection:bg-blue-500/30">
                  {WALLETS[currency]}
                </code>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => copyToClipboard(WALLETS[currency])}
                  className="bg-[#11141d] border-slate-700 hover:bg-slate-800 hover:text-white shrink-0 h-12 w-12 rounded-xl transition-colors"
                  aria-label="Copy wallet address"
                >
                  <Copy size={20} aria-hidden="true" />
                </Button>
              </div>
              <div className="mt-4 flex items-start gap-3 text-amber-500/90 bg-amber-500/10 p-4 rounded-xl text-xs font-bold border border-amber-500/20 leading-relaxed">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                <p>Only transmit {currency} via its native network protocol. Unmatched assets will result in permanent loss.</p>
              </div>
            </div>

            {/* Step 3 */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 border-t border-slate-800/80 pt-8">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">3. Finalize Verification</p>
              
              <div className="space-y-2">
                <Label htmlFor="tx-hash" className="text-sm font-bold text-slate-300">Transaction Hash (TXID)</Label>
                <Input 
                  id="tx-hash"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0xabc123..."
                  className="bg-[#0a0c10] border-slate-700 text-white focus-visible:ring-blue-500 h-12 rounded-xl font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tx-amount" className="text-sm font-bold text-slate-300">Procurement Value (PTS Expected)</Label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
                  <Input 
                    id="tx-amount"
                    type="number"
                    min="1"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    placeholder="100"
                    className="pl-11 bg-[#0a0c10] border-slate-700 text-white focus-visible:ring-blue-500 h-12 rounded-xl font-black text-lg"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500" aria-hidden="true">PTS</div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base h-14 rounded-xl shadow-[0_5px_20px_rgba(37,99,235,0.3)] transition-transform active:scale-95"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true"/> Processing Chain...</span>
                ) : (
                  'Verify Payment'
                )}
              </Button>
            </form>
          </section>
        </div>

        {/* Ledger History */}
        <div className="lg:col-span-7">
          <section aria-live="polite" className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 h-full shadow-lg flex flex-col min-h-[500px]">
            <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <History size={22} className="text-slate-400" aria-hidden="true" /> Deposit History
              </h2>
              <Badge variant="outline" className="bg-slate-900 text-slate-400 border-slate-700 px-3 py-1">
                {history.length} Records
              </Badge>
            </header>

            {loading ? (
              <div className="flex flex-col gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#0a0c10] rounded-2xl animate-pulse border border-slate-800/50" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-800/80 rounded-3xl bg-[#0a0c10]/40">
                <Wallet size={56} className="text-slate-700 mb-5 opacity-50" aria-hidden="true" />
                <h3 className="text-xl font-bold text-slate-300">No deposits recorded</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-[280px] font-medium leading-relaxed">
                  Your deposit history will appear here once submitted.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0a0c10] shadow-inner">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4 font-black tracking-wider">Network Details</th>
                      <th className="px-5 py-4 font-black tracking-wider text-right">Acquisition</th>
                      <th className="px-5 py-4 font-black tracking-wider text-right">Node Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {history.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-5 py-5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-slate-800 hover:bg-slate-800 text-slate-200 text-[10px] font-black">{inv.currency}</Badge>
                              <time className="text-xs font-medium text-slate-500" dateTime={inv.createdAt}>
                                {new Date(inv.createdAt).toLocaleDateString()}
                              </time>
                            </div>
                            <code className="text-[11px] text-slate-500 truncate max-w-[140px] sm:max-w-[220px] font-mono tracking-wider" title={inv.txHash}>
                              {inv.txHash.substring(0, 20)}...
                            </code>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-right">
                          <span className="font-black text-white text-base">{inv.creditsToAdd}</span>
                          <span className="text-xs text-blue-500 font-bold ml-1.5" aria-hidden="true">PTS</span>
                        </td>
                        <td className="px-5 py-5 text-right">
                          {getStatusBadge(inv.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}
