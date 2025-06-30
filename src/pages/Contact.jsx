import React, { useState } from 'react';
import Header from '../components/Header';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <Header />
      <div className="bg-black/80 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Contact Us</h2>
        {submitted ? (
          <div className="text-green-400 text-center font-semibold py-8">Thank you for contacting us!</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your Email" className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Your Message" rows={4} className="px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400" required />
            <button type="submit" className="mt-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold py-3 rounded-lg shadow hover:from-yellow-500 hover:to-pink-600 transition-all">Send Message</button>
          </form>
        )}
        <div className="mt-8 text-gray-300 text-sm text-center">
          <div>Email: support@slotrell.com</div>
          <div>Phone: +95 123 456 789</div>
          <div>Address: Yangon, Myanmar</div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 