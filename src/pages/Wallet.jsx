import React, { useState } from 'react';

function Wallet() {
  const [tab, setTab] = useState('deposit');
  const [form, setForm] = useState({ amount: '', note: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleTab = (t) => {
    setTab(t);
    setForm({ amount: '', note: '' });
    setSubmitted(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-black/80 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Wallet</h2>
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => handleTab('deposit')} className={`px-6 py-2 rounded-full font-semibold transition-all ${tab === 'deposit' ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-yellow-400/30'}`}>Deposit</button>
          <button onClick={() => handleTab('withdraw')} className={`px-6 py-2 rounded-full font-semibold transition-all ${tab === 'withdraw' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white hover:bg-pink-500/30'}`}>Withdraw</button>
        </div>
        {submitted ? (
          <div className="text-green-400 text-center font-semibold py-8">{tab === 'deposit' ? 'Deposit' : 'Withdraw'} request submitted!</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" required min="1" />
            <input type="text" name="note" value={form.note} onChange={handleChange} placeholder="Note (optional)" className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            <button type="submit" className="mt-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold py-3 rounded-lg shadow hover:from-yellow-500 hover:to-pink-600 transition-all">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Wallet; 