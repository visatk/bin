import { useState, useEffect } from 'react';
import { LifeBuoy, Send, Clock, CheckCircle2, MessageSquare, ShieldPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Ticket {
  id: number;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  reply?: string;
  createdAt: string;
}

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
      if (res.ok) {
        setTickets(await res.json());
      }
    } catch (e) {
      toast.error('Failed to load support history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error('Please fill out all fields.');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Support ticket submitted successfully. We will review it shortly.');
        setSubject('');
        setMessage('');
        await fetchTickets();
      } else {
        toast.error(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl shadow-inner">
            <LifeBuoy className="text-blue-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Support Center</h1>
            <p className="text-sm text-slate-400 font-medium">Need help? Submit a ticket and our team will assist you.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Ticket Submission Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6">
              <MessageSquare size={22} className="text-blue-500" /> New Ticket
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-bold text-slate-300">Subject</Label>
                <Input 
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E.g., Issue with Topup"
                  className="bg-[#0a0c10] border-slate-700 text-white focus-visible:ring-blue-500 h-12 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-bold text-slate-300">Message</Label>
                <textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-[#0a0c10] border border-slate-700 rounded-xl p-4 text-sm h-40 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none custom-scrollbar"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-base h-12 rounded-xl shadow-[0_5px_20px_rgba(37,99,235,0.3)] transition-transform active:scale-95"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"/> Submitting...</span>
                ) : (
                  <span className="flex items-center gap-2"><Send size={18} /> Submit Ticket</span>
                )}
              </Button>
            </form>
          </section>
        </div>

        {/* Ticket History */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="bg-[#11141d] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg flex-1 min-h-[500px] flex flex-col">
            <h2 className="text-xl font-bold text-white flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <Clock size={22} className="text-slate-400" /> Ticket History
              </div>
              <Badge variant="outline" className="bg-slate-900 text-slate-400 border-slate-700">
                {tickets.length} Tickets
              </Badge>
            </h2>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {loading ? (
                 <div className="flex justify-center py-20 text-blue-500"><div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" /></div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#0a0c10]/50 h-full">
                  <LifeBuoy size={48} className="text-slate-700 mb-4 opacity-50" />
                  <p className="text-slate-400 font-medium text-lg">No support tickets found.</p>
                  <p className="text-slate-500 text-sm mt-1">If you need help, submit a new ticket on the left.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <article key={ticket.id} className="bg-[#171a23] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-white font-bold text-base">{ticket.subject}</h3>
                        <p className="text-xs text-slate-500 mt-1">{new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                      {ticket.status === 'resolved' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold shrink-0">
                          <CheckCircle2 size={12} className="mr-1" /> Resolved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold shrink-0">
                          <Clock size={12} className="mr-1" /> Open
                        </Badge>
                      )}
                    </div>
                    
                    <div className="bg-[#0a0c10] border border-slate-800 rounded-xl p-4">
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                    </div>

                    {ticket.status === 'resolved' && ticket.reply && (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mt-2">
                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                          <ShieldPlus size={14} /> Admin Reply
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.reply}</p>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
