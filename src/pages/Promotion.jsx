import React from 'react';

const promotions = [
  { title: 'Welcome Bonus', desc: 'Get 100% bonus on your first deposit!', image: null },
  { title: 'Daily Cashback', desc: 'Receive up to 10% cashback every day.', image: null },
  { title: 'Refer a Friend', desc: 'Invite friends and earn rewards.', image: null },
];

function Promotion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions.map((promo, idx) => (
            <div key={idx} className="bg-black/80 rounded-2xl shadow-2xl p-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-3xl text-white mb-4">
                🎁
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{promo.title}</h3>
              <p className="text-gray-300 text-center mb-2">{promo.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Promotion; 