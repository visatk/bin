import { useState } from 'react';
import { 
  Wallet, ShieldCheck, CheckCircle2, Copy, 
  ArrowRight, Smartphone, Banknote, History, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PACKAGES = [
  { id: 'starter', points: 500, price: 5, popular: false },
  { id: 'pro', points: 1500, price: 12, popular: true, bonus: '+20% Extra' },
  { id: 'elite', points: 5000, price: 35, popular: false, bonus: 'Best Value' },
];

const METHODS = [
  { id: 'bkash', name: 'bKash (Personal)', number: '01XXXXXXXXX', icon: Smartphone, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', activeRing: 'ring-pink-500' },
  { id: 'nagad', name: 'Nagad (Personal)', number: '01XXXXXXXXX', icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', activeRing: 'ring-orange-500' },
  { id: 'crypto', name: 'USDT (TRC20)', number: 'TX...WALLET...ADDRESS', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', activeRing: 'ring-emerald-500' },
];

export default function Topup() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPkg, setSelectedPkg] = useState<number | null>(1500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('bkash');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeAmount = customAmount ? parseInt(customAmount) || 0 : selectedPkg || 0;
  const activeMethodData = METHODS.find(m => m.id === selectedMethod);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAmount || activeAmount < 100) {
      toast.error("Minimum topup amount is 100 PTS.");
      return;
    }
    if (!trxId || trxId.length < 6) {
      toast.error("Please enter a valid Transaction ID.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/topup/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeAmount,
          method: selectedMethod,
          trxId: trxId.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Deposit request submitted successfully! Pending approval.");
        setTrxId('');
        navigate('/dashboard');
      } else {
        toast.error(data.error || "Failed to submit deposit request.");
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
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-900/80 via-[#131b2f] to-[#0d1017] border border-blue-500/30 p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.25)] flex items-center justify-between group">
        <div className="relative z-10">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-3 uppercase tracking-widest text-[10px] font-black">
            Secure Gateway
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            Add Funds <Wallet className="text-blue-400" size={28} />
          </h1>
          <p className="text-slate-300 mt-2 text-sm md:text-base font-medium">
            Top up your account balance instantly. Current Balance: <span className="text-white font-bold">{user?.credits || 0} PTS</span>
          </p>
        </div>
        
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 p-8 opacity-10 transition-transform duration-700 group-hover:scale-110 pointer-events-none">
          <Banknote size={140} className="text-blue-300 transform -rotate-12" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Topup Flow (Bento Grid) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Step 1: Amount Selection */}
            <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">1</div>
                <h2 className="text-xl font-bold text-white">Select Package</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => { setSelectedPkg(pkg.points); setCustomAmount(''); }}
                    className={`relative flex flex-col p-5 rounded-2xl border text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
                    <span className="text-sm font-bold text-slate-400">${pkg.price}</span>
                    {pkg.bonus && <span className="mt-3 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md w-fit">{pkg.bonus}</span>}
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#131722] text-xs font-bold text-slate-500 uppercase tracking-widest">Or enter custom</span>
                </div>
              </div>

              <div className="mt-6 relative">
                <Input
                  type="number"
                  placeholder="Enter amount (Min 100)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedPkg(null);
                  }}
                  className="h-14 bg-black/40 border-slate-700/80 text-white rounded-xl pl-6 text-lg focus-visible:ring-blue-500 transition-all placeholder:text-slate-600"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">PTS</span>
              </div>
            </section>

            {/* Step 2: Payment Method */}
            <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">2</div>
                <h2 className="text-xl font-bold text-white">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 outline-none ${
                        isSelected 
                          ? `${method.bg} border-${method.activeRing.split('-')[1]}-500 shadow-md ring-1 ${method.activeRing}` 
                          : 'bg-black/20 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`p-3 rounded-xl bg-[#0d1017] border border-slate-800 ${isSelected ? method.color : 'text-slate-400'}`}>
                        <Icon size={24} />
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Transaction Details */}
            <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">3</div>
                <h2 className="text-xl font-bold text-white">Complete Payment</h2>
              </div>
              
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-6">
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Please send the exact equivalent amount to the following {activeMethodData?.name} account, then enter your Transaction ID below.
                </p>
                <div className="flex items-center justify-between bg-black/50 border border-slate-700/80 rounded-xl p-4 group">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Official Address / Number</span>
                    <span className={`text-lg font-mono font-bold ${activeMethodData?.color}`}>{activeMethodData?.number}</span>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleCopy(activeMethodData?.number || '', 'Address')}
                    className="h-10 w-10 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="trxId" className="text-sm font-bold text-slate-300 ml-1">Transaction ID / Hash</label>
                <Input
                  id="trxId"
                  placeholder="e.g. 9X2A8BCD OR 0xabc123..."
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="h-14 bg-black/40 border-slate-700/80 text-white rounded-xl pl-5 text-base focus-visible:ring-blue-500 transition-all font-mono placeholder:font-sans"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !activeAmount || !trxId}
                className="w-full h-14 mt-8 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</span>
                ) : (
                  <span className="flex items-center gap-2">Confirm Deposit <ArrowRight size={20} /></span>
                )}
              </Button>
            </section>
          </form>
        </div>

        {/* RIGHT COLUMN: Info & Security */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-gradient-to-b from-slate-900 to-[#131722] border border-slate-800/80 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck size={100} />
            </div>
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800/80 pb-4 relative z-10">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><ShieldCheck size={20} className="text-emerald-400" /></div>
              <h3 className="text-lg font-bold text-white">Safe & Secure</h3>
            </div>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">All transactions are encrypted and processed securely.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">Deposits are typically verified within 1-5 minutes by our automated system.</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">No hidden fees. You get exactly the points you pay for.</p>
              </li>
            </ul>
          </section>

          <section className="bg-[#131722]/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-6 shadow-xl h-full">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800/80 pb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"><History size={20} className="text-purple-400" /></div>
              <h3 className="text-lg font-bold text-white">Deposit Info</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
              <History size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Your recent topups will appear in your dashboard history.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
