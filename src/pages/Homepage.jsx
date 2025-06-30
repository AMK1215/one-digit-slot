import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import pragmaticPlayImg from '../assets/game_logo/PragmaticPlay.png';
import pgSoftImg from '../assets/game_logo/PG_Soft.png';
import live22Img from '../assets/game_logo/live22.png';
import jiliImg from '../assets/game_logo/jili.png';
import cq9Img from '../assets/game_logo/cq_9.png';
import jdbImg from '../assets/game_logo/j_db.png';

// Footer images (sample, you can add more)
import omgImg from '../assets/img/g1.png';
import jdbLogo from '../assets/img/g2.png';
import jgLogo from '../assets/img/g3.png';
import omegaLogo from '../assets/img/g4.png';
import sLogo from '../assets/img/g5.png';
import sexyLogo from '../assets/img/g6.png';
import ppLogo from '../assets/img/g7.png';
import jiliLogo from '../assets/img/g8.png';
import fcLogo from '../assets/img/g9.png';
import infinityLogo from '../assets/img/g10.png';

const categories = [
  { icon: '🔥', label: 'Hot Games' },
  { icon: '🎰', label: 'Slot' },
  { icon: '🃏', label: 'Live Casino' },
  { icon: '⚽', label: 'Sport Book' },
  { icon: '🕹️', label: 'Virtual Sport' },
  { icon: '🎟️', label: 'Lottery' },
  { icon: '🎣', label: 'Fishing' },
];

const games = [
  {
    id: 'pragmatic_play',
    name: 'pragmatic_play',
    provider: 'Pragmatic Play',
    image: pragmaticPlayImg,
  },
  {
    id: 'pg_soft',
    name: 'pg_soft',
    provider: 'PG SLOT',
    image: pgSoftImg,
  },
  {
    id: 'live_22',
    name: 'live_22',
    provider: 'Live22',
    image: live22Img,
  },
  {
    id: 'jili_tcg',
    name: 'jili_tcg',
    provider: 'JILI',
    image: jiliImg,
  },
  {
    id: 'cq9',
    name: 'cq9',
    provider: 'CQ9',
    image: cq9Img,
  },
  {
    id: 'jdb',
    name: 'jdb',
    provider: 'JB',
    image: jdbImg,
  },
];

const footerImages = [
  omgImg, jdbLogo, jgLogo, omegaLogo, sLogo, sexyLogo, ppLogo, jiliLogo, fcLogo, infinityLogo
];

function Homepage() {
  const navigate = useNavigate();

  const handlePlay = (gameId) => {
    // For now, all games go to /game
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Category Bar */}
        <div className="flex overflow-x-auto gap-4 py-4 mb-8 scrollbar-hide">
          {categories.map((cat, idx) => (
            <div
              key={cat.label}
              className="flex flex-col items-center min-w-[90px] px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold shadow transition-all duration-200 cursor-pointer select-none"
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-base">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Slot Section */}
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 mt-4">Slot</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pb-12"
        >
          {games.map((game) => (
            <SwiperSlide key={game.id}>
              <div className="flex flex-col items-center bg-white/10 rounded-2xl shadow-xl p-4 mx-2 hover:bg-white/20 transition-all duration-200 cursor-pointer" onClick={() => handlePlay(game.id)}>
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-32 h-32 object-cover rounded-xl mb-3 border-4 border-white/20 shadow-lg"
                  loading="lazy"
                />
                <div className="w-full flex flex-col items-center">
                  <span className="text-lg font-bold text-white mb-1 drop-shadow">{game.name}</span>
                  <span className="text-xs bg-black/60 text-yellow-300 px-3 py-1 rounded-full font-semibold tracking-wide mt-1 mb-2">
                    {game.provider}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </main>
      {/* Footer */}
      <footer className="w-full bg-black/80 py-6 mt-8">
        <div className="max-w-5xl mx-auto text-center text-white">
          <div className="mb-2 text-sm font-semibold">
            Best viewed by Google Chrome 72.0 or higher. Best viewed at a resolution of 1280x1024 or higher<br />
            Bossi Copyright © 2019 . All rights reserved.
          </div>
          {/* Auto-scrolling logo bar */}
          <div className="relative w-full overflow-hidden py-2">
            <div className="flex items-center gap-8 animate-footer-scroll" style={{ minWidth: '100%' }}>
              {footerImages.concat(footerImages).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`footer-logo-${idx}`}
                  className="h-10 w-auto object-contain opacity-90"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </footer>
      {/* Footer scroll animation */}
      <style>{`
        @keyframes footer-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-footer-scroll {
          animation: footer-scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Homepage; 