import React from 'react';

const BannerText = ({ text }) => (
  <div className="relative w-full overflow-hidden h-10 mb-6">
    <div className="absolute whitespace-nowrap animate-marquee text-lg font-bold text-yellow-300 flex items-center h-10">
      {text}
    </div>
    <style>{`
      @keyframes marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      .animate-marquee {
        animation: marquee 18s linear infinite;
      }
    `}</style>
  </div>
);

export default BannerText; 