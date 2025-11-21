import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const UserPaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const amount = location.state?.amount;
  const method = location.state?.method;
  const formattedAmount =
    typeof amount === 'number'
      ? amount.toFixed(2)
      : amount
      ? Number(amount).toFixed(2)
      : '—';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-4 py-12">
      <div className="relative max-w-3xl w-full bg-slate-900/80 border border-slate-800 rounded-[36px] p-10 text-center backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-60 blur-3xl rounded-[36px] pointer-events-none" />
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto rounded-full border-4 border-emerald-400 flex items-center justify-center mb-6 animate-pop">
            <FiCheckCircle className="text-3xl text-emerald-300" />
          </div>
          <p className="uppercase text-xs tracking-[0.5em] text-emerald-400 mb-4">Payment Logged</p>
          <h1 className="text-4xl font-black mb-4">You&apos;re All Set!</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Your payment is now awaiting verification. We&apos;ll notify you once your coach and admin finish the checks.
          </p>

          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            <div className="bg-black/30 border border-slate-800 rounded-3xl p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Amount</p>
              <p className="text-3xl font-semibold mt-2">${formattedAmount}</p>
            </div>
            <div className="bg-black/30 border border-slate-800 rounded-3xl p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Method</p>
              <p className="text-2xl font-semibold mt-2 capitalize">{method || 'Pending'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold shadow-lg"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/payments/user')}
              className="px-6 py-3 rounded-2xl border border-slate-700 hover:border-emerald-400 transition"
            >
              Submit another payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPaymentSuccess;

