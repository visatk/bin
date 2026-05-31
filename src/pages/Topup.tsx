import { useState } from 'react';
import { 
  Wallet, ShieldCheck, CheckCircle2, Copy, 
  ArrowRight, History, Sparkles, QrCode, 
  CircleDollarSign, Hexagon, Activity 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PACKAGES = [
  { id: 'starter', points: 500, priceUsd: 5, popular: false },
  { id: 'pro', points: 1500, priceUsd: 12, popular: true, bonus: '+20% Extra' },
  { id: 'elite', points: 5000, priceUsd: 35, popular: false, bonus: 'Best Value' },
];

const METHODS = [
  { id: 'binance', name: 'Binance Pay', network: 'Binance ID / Email', address: 'your.binance@email.com', icon: QrCode, color: 'text-[#FCD535]', bg: 'bg-[#FCD535]/10', border: 'border-[#FCD535]/30', ring: 'ring-[#FCD535]' },
  { id: 'usdt_trc20', name: 'USDT', network: 'TRC20 Network Only', address: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', icon: CircleDollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', ring: 'ring-emerald-500' },
  { id: 'ltc', name: 'Litecoin', network: 'LTC Network', address: 'LXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', icon: Activity, color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30', ring: 'ring-slate-400' },
  { id: 'eth', name: 'Ethereum', network: 'ERC20 Network', address: '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', icon: Hexagon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', ring: 'ring-indigo-500' },
];

export default function Topup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPkg, setSelectedPkg] = useState<number | null>(1500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('binance');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePoints = customAmount ? parseInt(customAmount) || 0 : selectedPkg || 0;
  // Dynamic Calculation: Assuming 100 PTS = 1 USD for custom amounts, or use package price
  const activeUsdPrice = customAmount 
    ? (activePoints / 100).toFixed(2) 
    : PACKAGES.find(p => p.points === selectedPkg)?.priceUsd || 0;
    
  const activeMethodData = METHODS.find(m => m.id === selectedMethod);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePoints || activePoints < 100) {
      toast.error("Minimum topup amount is 100 PTS ($1.00).");
      return;
    }
    if (!trxId || trxId.length < 5) {
      toast.error("Please enter a valid Transaction Hash / ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/topup/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: activePoints,
          amountUsd: Number(activeUsdPrice),
          method: selectedMethod,
          trxHash: trxId.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Deposit request submitted! Awaiting network confirmation.");
        setTrxId('');
        navigate('/dashboard');
      } else {
        toast.error(data.error || "Failed to submit request.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 lg:p-10 pb-24 animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto w-full">
      
      {/* Hero Section */}
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-900/80 via-[#131b2f] to-[#0d1017] border border-blue-500/30 p-8 md:p-10 shadow-2xl flex items-center justify-between group">
        <div className="relative z-10">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-3 uppercase tracking-widest text-[10px] font-black">
            Crypto Gateway
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Add Funds <Wallet className="text-blue-400" size={28} />
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium">
            Automated crypto deposits. Current Balance: <span className="text-white font-bold">{user?.credits || 0} PTS</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Topup Flow */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Step 1: Package Selection */}
            <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30">1</div>
                <h2 className="text-xl font-bold text-white">Select Amount</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => { setSelectedPkg(pkg.points); setCustomAmount(''); }}
                    className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-300 outline-none text-left ${
                      selectedPkg === pkg.points && !customAmount
                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.15)] ring-1 ring-blue-500'
                        : 'bg-black/20 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/50'
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black border-none text-[10px] font-black uppercase shadow-lg">
                        <Sparkles size={10} className="mr-1" /> Popular
                      </Badge>
                    )}
                    <span className="text-2xl font-black text-white mb-1">{pkg.points} <span className="text-sm text-slate-400 font-medium">PTS</span></span>
                    <span className="text-sm font-bold text-emerald-400">${pkg.priceUsd} USD</span>
                    {pkg.bonus && <span className="mt-3 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md w-fit">{pkg.bonus}</span>}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center"><span className="px-4 bg-[#131722] text-xs font-bold text-slate-500 uppercase tracking-widest">Or custom amount</span></div>
              </div>

              <Input
                type="number"
                placeholder="Enter custom points (Min 100)"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedPkg(null); }}
                className="h-14 bg-black/40 border-slate-700/80 text-white rounded-xl pl-6 text-lg focus-visible:ring-blue-500"
              />
            </section>

            {/* Step 2: Payment Method */}
            <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30">2</div>
                <h2 className="text-xl font-bold text-white">Cryptocurrency</h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 outline-none ${
                        isSelected 
                          ? `${method.bg} ${method.border} shadow-lg ring-1 ${method.ring}` 
                          : 'bg-black/20 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon size={28} className={isSelected ? method.color : 'text-slate-400'} />
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Payment Execution */}
            <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30">3</div>
                <h2 className="text-xl font-bold text-white">Execute Payment</h2>
              </div>
              
              <div className="bg-black/40 border border-slate-700/50 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-800/80">
                  <div>
                    <p className="text-sm text-slate-400 font-medium mb-1">Amount to send:</p>
                    <div className="text-3xl font-black text-white tracking-tight">
                      ${activeUsdPrice} <span className="text-lg text-slate-500 font-bold">USD</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${activeMethodData?.bg} ${activeMethodData?.color} ${activeMethodData?.border} px-3 py-1 font-bold`}>
                    {activeMethodData?.network}
                  </Badge>
                </div>

                <div className="group relative">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-2">Deposit Address / ID</span>
                  <div className="flex items-center justify-between bg-[#11141d] border border-slate-700 rounded-xl p-4 transition-colors group-hover:border-slate-500">
                    <span className={`text-sm sm:text-base font-mono font-bold break-all pr-4 ${activeMethodData?.color}`}>
                      {activeMethodData?.address}
                    </span>
                    <Button 
                      type="button" variant="secondary" size="icon" 
                      onClick={() => handleCopy(activeMethodData?.address || '', 'Address')}
                      className="shrink-0 h-10 w-10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <label htmlFor="trxId" className="text-sm font-bold text-slate-300 ml-1">Transaction Hash / Order ID</label>
                <Input
                  id="trxId"
                  placeholder="Paste your TXID or Binance Order ID here..."
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="h-14 bg-black/40 border-slate-700/80 text-white rounded-xl pl-5 text-base focus-visible:ring-blue-500 font-mono placeholder:font-sans"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !activePoints || !trxId}
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Verifying...</span>
                ) : (
                  <span className="flex items-center gap-2">I have made the payment <ArrowRight size={20} /></span>
                )}
              </Button>
            </section>
          </form>
        </div>

        {/* RIGHT COLUMN: Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-gradient-to-b from-slate-900 to-[#131722] border border-slate-800/80 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800/80 pb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20"><ShieldCheck size={20} className="text-amber-400" /></div>
              <h3 className="text-lg font-bold text-white">Important Rules</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-slate-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">Always check the <strong className="text-white">Network (e.g., TRC20)</strong> before sending funds. Wrong network transfers are lost forever.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-slate-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">Crypto deposits require network confirmations and may take 2-15 minutes to reflect.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-slate-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">Ensure you send the exact equivalent amount in USD.</p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
