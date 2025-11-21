import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name;
  const plan = location.state?.plan;
  const amount = location.state?.amount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-3xl w-full bg-slate-900/80 border border-slate-800 rounded-[36px] p-12 text-center backdrop-blur overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 blur-3xl opacity-60" />
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-28 h-28 mx-auto rounded-full border-4 border-emerald-400 flex items-center justify-center"
          >
            <FiCheckCircle className="text-4xl text-emerald-300" />
          </motion.div>
          <p className="uppercase text-xs tracking-[0.5em] text-emerald-400">Payment Received</p>
          <h1 className="text-4xl font-black">Welcome to the FitFix Team!</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Your payment has been recorded. The admin team will verify your details and send your dashboard credentials
            shortly.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-left">
            <div className="bg-black/40 border border-slate-800 rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Coach</p>
              <p className="text-xl font-semibold mt-2">{name || 'Pending'}</p>
            </div>
            <div className="bg-black/40 border border-slate-800 rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Plan</p>
              <p className="text-xl font-semibold mt-2">{plan || '—'}</p>
            </div>
            <div className="bg-black/40 border border-slate-800 rounded-3xl p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Amount</p>
              <p className="text-xl font-semibold mt-2">
                {typeof amount === 'number' ? `$${amount.toFixed(2)}` : amount ? `$${amount}` : '$—'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-slate-400">
            <p>Next steps:</p>
            <p>1. Admin reviews your submission.</p>
            <p>2. Admin creates your employee account manually.</p>
            <p>3. Admin sends you an email with your login details.</p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-semibold shadow-lg"
            >
              Back to Login
            </button>
            <button
              onClick={() => navigate('/contact-admin')}
              className="px-6 py-3 rounded-2xl border border-slate-700 hover:border-emerald-400 transition"
            >
              Submit another request
            </button>
          </div>

          <p className="text-sm text-slate-500">
            Need help? Email <span className="text-emerald-300">support@fitfix.com</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

