import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import Header from '../components/Header';
import BannerSlider from '../components/BannerSlider';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import BannerText from '../components/BannerText';

// Images for slot section and footer (keep your imports as before)
import pragmaticPlayImg from '../assets/game_logo/PragmaticPlay.png';
import pgSoftImg from '../assets/game_logo/PG_Soft.png';
import live22Img from '../assets/game_logo/live22.png';
import jiliImg from '../assets/game_logo/jili.png';
import cq9Img from '../assets/game_logo/cq_9.png';
import jdbImg from '../assets/game_logo/j_db.png';

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

const games = [
  {
    id: 'pragmatic_play',
    name: 'pg_soft',
    provider: 'PG SLOT',
    image: pgSoftImg,
    badge: 'HOT',
    info: 'Popular Game · Win Big!',
  },
  {
    id: 'live_22',
    name: 'live_22',
    provider: 'Live22',
    image: live22Img,
    badge: 'NEW',
    info: 'New Release · Try Now!',
  },
  {
    id: 'jili_tcg',
    name: 'jili_tcg',
    provider: 'JILI',
    image: jiliImg,
    badge: 'HOT',
    info: 'Top Rated · High RTP',
  },
  {
    id: 'cq9',
    name: 'cq9',
    provider: 'CQ9',
    image: cq9Img,
    info: 'Classic Slot · Fan Favorite',
  },
  {
    id: 'jdb',
    name: 'jdb',
    provider: 'JB',
    image: jdbImg,
    info: 'Jackpot Chance!',
  },
];

const footerImages = [
  omgImg, jdbLogo, jgLogo, omegaLogo, sLogo, sexyLogo, ppLogo, jiliLogo, fcLogo, infinityLogo
];

function Homepage() {
  const navigate = useNavigate();
  const { apiCall } = useApi();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  const [selectedType, setSelectedType] = useState(null);
  const [providers, setProviders] = useState([]);
  const [provLoading, setProvLoading] = useState(false);
  const [provError, setProvError] = useState(null);

  // Load categories on mount
  useEffect(() => {
    let isMounted = true;
    setCatLoading(true);
    apiCall('/game_types')
      .then(res => {
        if (isMounted && res && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) setSelectedType(res.data[0].code);
        }
      })
      .catch(e => {
        setCatError(e.message);
        // fallback to static if error
        setCategories([
          { name: 'Hot Games', code: 'HOT', img: null },
          { name: 'Slot', code: 'SLOT', img: null },
          { name: 'Live Casino', code: 'LIVE_CASINO', img: null },
          { name: 'Sport Book', code: 'SPORT_BOOK', img: null },
          { name: 'Virtual Sport', code: 'VIRTUAL_SPORT', img: null },
          { name: 'Lottery', code: 'LOTTERY', img: null },
          { name: 'Fishing', code: 'FISHING', img: null },
        ]);
        setSelectedType('SLOT');
      })
      .finally(() => setCatLoading(false));
    return () => { isMounted = false; };
  }, []);

  // Load providers when selectedType or categories change and categories are ready
  useEffect(() => {
    if (!selectedType || selectedType === 'HOT' || categories.length === 0) {
      setProviders([]);
      setProvLoading(false);
      setProvError(null);
      return;
    }
    setProvLoading(true);
    setProvError(null);
    apiCall(`/providers/${selectedType}`)
      .then(res => {
        if (res && res.data) {
          const gameTypeObj = categories.find(cat => cat.code === selectedType);
          const game_type_id = gameTypeObj?.id;
          setProviders(res.data.map(prov => ({
            ...prov,
            game_type_id: game_type_id,
          })));
        } else setProviders([]);
      })
      .catch(e => {
        setProvError(e.message);
        setProviders([]);
      })
      .finally(() => setProvLoading(false));
  }, [selectedType, categories]);

  // Traditional play handler for slots
  const handlePlay = (gameId) => {
    navigate('/game');
  };

  // Traditional category select
  const handleCategoryClick = (cat) => {
    setSelectedType(cat.code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Banner Slider */}
        <BannerSlider />
        <BannerText text={"🎉 Welcome to Lucky Million! Enjoy our latest promotions and hot games! 🎰 Big bonuses await! 💰"} />

        {/* Category Bar */}
        <div className="flex overflow-x-auto gap-4 py-4 mb-8 scrollbar-hide">
          {catLoading ? (
            <div className="text-white text-center w-full">Loading categories...</div>
          ) : catError ? (
            <div className="text-red-400 text-center w-full">Failed to load categories</div>
          ) : categories.map((cat, idx) => (
            <div
              key={cat.code || cat.name}
              className={`flex flex-col items-center min-w-[90px] px-4 py-3 rounded-xl font-semibold shadow transition-all duration-200 cursor-pointer select-none
                ${selectedType === cat.code ? 'bg-yellow-400/80 text-black scale-105' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.name === 'Hot Games' ? (
                <DotLottieReact
                  src="https://lottie.host/3b9f88fc-4861-4762-91e8-8812dceeb0c3/EWmsQ5wO4L.lottie"
                  loop
                  autoplay
                  style={{ width: 32, height: 32, marginBottom: 4 }}
                />
              ) : cat.img ? (
                <img src={cat.img.startsWith('/') ? cat.img : `https://luckymillion.pro/assets/img/game_type/${cat.img}`} alt={cat.name} className="w-8 h-8 object-contain mb-1" />
              ) : (
                <span className="text-2xl mb-1">🎮</span>
              )}
              <span className="text-base">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Providers Section */}
        {selectedType && selectedType !== 'HOT' && (
          <div className="mb-8">
            {provLoading ? (
              <div className="text-white text-center py-8">Loading providers...</div>
            ) : provError ? (
              <div className="text-red-400 text-center py-8">Failed to load providers</div>
            ) : providers.length === 0 ? (
              <div className="text-white text-center py-8">No providers found.</div>
            ) : (
              <div className="flex flex-wrap w-full">
                {providers.map((prov, idx) => (
                  <div
                    key={prov.id + '-' + (prov.product_code || idx)}
                    className="relative flex flex-col items-center bg-white/10 rounded-2xl shadow-xl p-3 mb-4 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-yellow-400/60 w-1/2 sm:w-[260px] border-2 border-yellow-400"
                    style={{ minWidth: '160px', maxWidth: '100%' }}
                  >
                    {/* Animated Provider Logo (match slot section size) */}
                    <div className="w-44 h-44 mb-3 flex items-center justify-center">
                      <img
                        src={prov.img_url.startsWith('/') ? `https://luckymillion.pro${prov.img_url}` : prov.img_url}
                        alt={prov.product_title || prov.provider}
                        className="w-full h-full object-cover rounded-2xl border-4 border-white/20 shadow-lg transition-transform duration-500 group-hover:animate-float"
                        loading="lazy"
                      />
                    </div>
                    {/* Info Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <span className="text-lg font-bold text-yellow-300 mb-2 drop-shadow animate-fadein">
                        Click to play
                      </span>
                      <button
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg shadow-lg hover:scale-105 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 animate-bouncein"
                        onClick={e => {
                          e.stopPropagation();
                          if (prov.game_type_id && prov.product_id) {
                            navigate(`/games/${prov.game_type_id}/${prov.product_id}`);
                          } else {
                            alert('Game type or product ID is missing for this provider.');
                          }
                        }}
                      >
                        Play Now
                      </button>
                    </div>
                    {/* Card Content (always visible) */}
                    <span className="text-base font-bold text-white mb-2 drop-shadow text-center w-full truncate z-10">
                      {prov.product_title || prov.provider}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              <div
                className="relative flex flex-col items-center bg-white/10 rounded-2xl shadow-xl p-4 mx-2 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-yellow-400/60"
                onClick={() => handlePlay(game.id)}
              >
                {/* Badge */}
                {game.badge && (
                  <span className={`absolute left-4 top-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg z-10 ${game.badge === 'HOT' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black'}`}>
                    {game.badge}
                  </span>
                )}
                {/* Game Image */}
                <div className="w-44 h-44 mb-3 flex items-center justify-center relative">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover rounded-2xl border-4 border-white/20 shadow-lg transition-transform duration-500 group-hover:animate-float relative z-10"
                    loading="lazy"
                  />
                </div>
                {/* Info Overlay on Hover */}
                <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <span className="text-lg font-bold text-yellow-300 mb-2 drop-shadow animate-fadein">
                    {game.info}
                  </span>
                  <button
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg shadow-lg hover:scale-105 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 animate-bouncein"
                    onClick={e => { e.stopPropagation(); handlePlay(game.id); }}
                  >
                    Play Now
                  </button>
                </div>
                {/* Card Content */}
                <div className="w-full flex flex-col items-center z-10">
                  <span className="text-lg font-bold text-white mb-1 drop-shadow">
                    {game.name}
                  </span>
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
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        .animate-float {
          animation: float 1.8s ease-in-out infinite;
        }
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadein {
          animation: fadein 0.7s ease;
        }
        @keyframes bouncein {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-bouncein {
          animation: bouncein 0.7s cubic-bezier(.4,2,.6,1) both;
        }
      `}</style>
    </div>
  );
}

export default Homepage;
