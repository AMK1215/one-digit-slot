import React from 'react';
import Header from '../components/Header';

const ads = [
  { title: 'Big Jackpot Winner!', desc: 'Congratulations to our latest jackpot winner!', image: null },
  { title: 'New Game Release', desc: 'Try our newest slot game now!', image: null },
  { title: 'Special Event', desc: 'Join our special event for exclusive rewards.', image: null },
];

function Ads() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <Header />
      <div className="max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">Advertisements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ads.map((ad, idx) => (
            <div key={idx} className="bg-black/80 rounded-2xl shadow-2xl p-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-yellow-400 rounded-full flex items-center justify-center text-3xl text-white mb-4">
                📢
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{ad.title}</h3>
              <p className="text-gray-300 text-center mb-2">{ad.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Ads; 