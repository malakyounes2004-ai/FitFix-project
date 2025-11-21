import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiOutlineCash, HiOutlineLightningBolt, HiOutlineChatAlt2 } from 'react-icons/hi';
import { FiSend } from 'react-icons/fi';
import { useNotification } from '../../hooks/useNotification';

const methodCards = [
  {
    value: 'cash',
    title: 'Pay in Cash',
    description: 'Settle your plan at the club reception.',
    icon: HiOutlineCash,
    accent: 'from-emerald-500/80 to-teal-500/70'
  },
  {
    value: 'omt',
    title: 'OMT Transfer',
    description: 'Send via OMT and upload the receipt.',
    icon: HiOutlineLightningBolt,
    accent: 'from-amber-500/80 to-orange-500/70'
  },
  {
    value: 'whatsapp',
    title: 'WhatsApp Confirmation',
    description: 'Share your proof directly with the coach.',
    icon: HiOutlineChatAlt2,
    accent: 'from-purple-500/80 to-pink-500/70'
  }
];

const UserPaymentPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse user', error);
      return null;
    }
  }, []);

  const assignedEmployeeId = user?.assignedEmployeeId;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!assignedEmployeeId) {
      showNotification({ type: 'error', message: 'No coach assigned to your account yet.' });
      return;
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      showNotification({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/payments/create',
        {
          amount: numericAmount,
          method,
          employeeId: assignedEmployeeId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShowCelebration(true);
      showNotification({ type: 'success', message: 'Payment submitted! Awaiting coach approval.' });
      setTimeout(() => {
        navigate('/payments/success', { state: { amount: numericAmount, method } });
      }, 1200);
    } catch (error) {
      console.error('Payment submission error:', error);
      const message = error.response?.data?.message || 'Unable to submit payment. Please try again.';
      showNotification({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 -right-10 w-64 h-64 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-10 -left-10 w-72 h-72 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse delay-300" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <p className="uppercase tracking-[0.5em] text-xs text-emerald-400 mb-3">Payments</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Fuel Your Fitness Journey
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto mt-4">
            Submit your offline payment and let your coach verify it. Every transaction is logged, auditable, and secure.
          </p>
        </header>

        {!assignedEmployeeId ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center backdrop-blur">
            <h2 className="text-2xl font-semibold mb-2">Coach Assignment Needed</h2>
            <p className="text-slate-400">
              Please contact support so we can assign a coach to your account before submitting payments.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-10">
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen">
                <div className="w-48 h-48 border border-emerald-500/40 rounded-full absolute -right-10 -top-10 animate-spin-slow" />
                <div className="w-32 h-32 border border-indigo-500/40 rounded-full absolute right-6 top-12 animate-spin-slower" />
              </div>

              <div className="relative z-10 space-y-6">
                <div>
                  <label className="text-sm uppercase tracking-[0.3em] text-slate-400">Amount</label>
                  <div className="mt-2 bg-black/40 border border-slate-800 rounded-2xl flex items-center px-5">
                    <span className="text-slate-400 text-lg">$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent px-3 py-4 text-3xl font-semibold focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Enter the exact amount you transferred.</p>
                </div>

                <div>
                  <label className="text-sm uppercase tracking-[0.3em] text-slate-400">Method</label>
                  <div className="grid sm:grid-cols-3 gap-4 mt-3">
                    {methodCards.map(({ value, title, description, icon: Icon, accent }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMethod(value)}
                        className={`group relative rounded-2xl border p-4 text-left transition-all duration-300 ${
                          method === value
                            ? 'border-transparent bg-gradient-to-br ' + accent + ' shadow-lg shadow-emerald-500/30'
                            : 'border-slate-800 bg-black/30 hover:border-emerald-400/40'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${method === value ? 'bg-black/20' : 'bg-slate-900/60'}`}>
                          <Icon className="text-2xl" />
                        </div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-slate-300">{description}</p>
                        {method === value && (
                          <span className="absolute top-4 right-4 text-xs uppercase tracking-[0.3em]">Selected</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-semibold rounded-2xl py-4 flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/40 hover:scale-[1.01] transition-all disabled:opacity-60"
                >
                  <FiSend className="text-xl" />
                  {isSubmitting ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.4em] text-emerald-400 mb-3">Coach</p>
                <h3 className="text-2xl font-semibold">{user?.assignedEmployeeName || 'Your Coach'}</h3>
                <p className="text-slate-300 mt-2">
                  Payments go directly to your assigned coach for a quick verification workflow.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-400">
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="text-white font-semibold">Awaiting submission</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Next step</p>
                    <p className="text-white font-semibold">Coach approval</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-800 p-8">
                <h4 className="text-xl font-semibold mb-3">How it works</h4>
                <ul className="space-y-4 text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-semibold">1</span>
                    Submit your payment details above.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-semibold">2</span>
                    Your coach approves it after checking the proof.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-semibold">3</span>
                    Admin finalizes the record and your plan unlocks.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
          <div className="bg-slate-900 border border-emerald-400 rounded-3xl p-10 text-center animate-pop">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full opacity-40 blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full border-4 border-emerald-400 flex items-center justify-center">
                <FiSend className="text-3xl text-emerald-300 animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Payment Sent!</h3>
            <p className="text-slate-300">Redirecting you to the success page...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPaymentPage;

