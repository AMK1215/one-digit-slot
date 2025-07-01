import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import React from 'react';

// Import banner images
import banner1 from '../assets/banner/b1.png';
import banner2 from '../assets/banner/b2.png';
import banner3 from '../assets/banner/b3.png';
import banner4 from '../assets/banner/b4.png';
import gameBanner from '../assets/banner/game-banner.png';
import promo1 from '../assets/banner/p1.png';
import promo2 from '../assets/banner/p2.png';

const banners = [
  {
    id: 1,
    image: banner1,
    title: 'Welcome to Lucky Million',
    subtitle: 'Your Ultimate Gaming Destination',
    ctaText: 'Play Now',
    ctaLink: '/game',
    badge: 'HOT',
  },
  {
    id: 2,
    image: banner2,
    title: 'Amazing Promotions',
    subtitle: 'Get the Best Bonuses',
    ctaText: 'Join Promo',
    ctaLink: '/promotion',
    badge: 'NEW',
  },
  {
    id: 3,
    image: banner3,
    title: 'Live Casino Games',
    subtitle: 'Experience Real-Time Gaming',
    ctaText: 'Try Live Casino',
    ctaLink: '/game',
  },
  {
    id: 4,
    image: banner4,
    title: 'Slot Games',
    subtitle: 'Spin and Win Big',
    ctaText: 'Spin Now',
    ctaLink: '/game',
    badge: 'HOT',
  },
  {
    id: 5,
    image: gameBanner,
    title: 'Game Banner',
    subtitle: 'Discover New Games',
    ctaText: 'Explore',
    ctaLink: '/game',
  },
  {
    id: 6,
    image: promo1,
    title: 'Special Promotion',
    subtitle: 'Limited Time Offer',
    ctaText: 'Join Promo',
    ctaLink: '/promotion',
    badge: 'NEW',
  },
  {
    id: 7,
    image: promo2,
    title: 'Exclusive Deals',
    subtitle: 'VIP Member Benefits',
    ctaText: 'See Benefits',
    ctaLink: '/profile',
  },
];

function BannerSlider() {
  // For navigation
  const handleBannerClick = (ctaLink) => {
    if (ctaLink) {
      window.location.href = ctaLink;
    }
  };

  return (
    <div className="w-full mb-8">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="banner-swiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl shadow-2xl cursor-pointer group"
              onClick={() => handleBannerClick(banner.ctaLink)}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Overlay with text */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex items-center">
                <div className="ml-8 md:ml-12 lg:ml-16 text-white animate-fadein">
                  <div className="flex items-center gap-3 mb-2">
                    {banner.badge && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg ${banner.badge === 'HOT' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black'}`}>{banner.badge}</span>
                    )}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg animate-slidein">
                      {banner.title}
                    </h2>
                  </div>
                  <p className="text-lg md:text-xl lg:text-2xl text-yellow-300 font-semibold drop-shadow-lg animate-slidein delay-100">
                    {banner.subtitle}
                  </p>
                  {banner.ctaText && (
                    <button
                      className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg shadow-lg hover:scale-105 hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 animate-bouncein"
                      onClick={e => { e.stopPropagation(); handleBannerClick(banner.ctaLink); }}
                    >
                      {banner.ctaText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Animations */}
      <style>{`
        @keyframes fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadein {
          animation: fadein 0.8s ease;
        }
        @keyframes slidein {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slidein {
          animation: slidein 0.7s cubic-bezier(.4,2,.6,1) both;
        }
        .delay-100 {
          animation-delay: 0.1s;
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

export default BannerSlider; 