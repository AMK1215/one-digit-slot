import React, { useState } from 'react';
import Header from './Header';

const GameList = ({ categories = [], games = [], onCategoryClick, selectedCategory, onPlay, showSearch = true }) => {
  const [search, setSearch] = useState('');

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Category Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <div
                key={cat.code || cat.name}
                className={`flex flex-col items-center min-w-[110px] px-4 py-3 rounded-xl font-semibold shadow transition-all duration-200 cursor-pointer select-none
                  ${selectedCategory === cat.code ? 'bg-yellow-400 text-black scale-105' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                onClick={() => onCategoryClick && onCategoryClick(cat)}
              >
                {cat.icon && <span className="text-2xl mb-1">{cat.icon}</span>}
                {cat.img && <img src={cat.img} alt={cat.name} className="w-8 h-8 object-contain mb-1" />}
                <span className="text-base">{cat.name}</span>
              </div>
            ))}
          </div>
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ml-4 px-4 py-2 rounded-full bg-white text-black font-semibold shadow focus:outline-none w-56"
            />
          )}
        </div>
        {/* Game Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredGames.map((game, idx) => (
            <div
              key={game.id + '-' + (game.game_code || idx)}
              className="flex flex-col items-center bg-white/10 rounded-2xl shadow-xl p-3 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-yellow-400/60"
            >
              <div className="w-full flex items-center justify-center">
                <img
                  src={game.img || game.image}
                  alt={game.name}
                  className="w-44 h-44 object-cover rounded-2xl border-4 border-white/20 shadow-lg mb-3"
                  loading="lazy"
                />
              </div>
              <span className="text-base font-bold text-white mb-2 drop-shadow text-center w-full truncate">
                {game.name}
              </span>
              <button
                className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 mt-auto"
                onClick={() => onPlay && onPlay(game)}
              >
                Play Game
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GameList; 