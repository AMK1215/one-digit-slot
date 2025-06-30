import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import logoImg from '../assets/logo.jpg';
import { FaSyncAlt } from 'react-icons/fa';

function Header() {
  const { user, logout, isLoggingOut, fetchProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleNavigate = (route) => {
    setMenuOpen(false);
    if (route === 'logout') {
      logout();
    } else {
      navigate(route);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  return (
    <header className="w-full bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 py-2">
        {/* Logo only (no site name) */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/home')}>
          <img src={logoImg} alt="Logo" className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shadow" />
        </div>
        {/* User Info - always visible, responsive */}
        {user && (
          <div className="flex flex-col xs:flex-row items-end xs:items-center gap-0 xs:gap-4 text-white text-xs xs:text-sm font-semibold flex-1 justify-center">
            <div className="flex items-center gap-2">
              <span className="font-bold xs:text-base text-sm truncate max-w-[100px] xs:max-w-[160px]" title={user.name}>{user.name}</span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="ml-1 p-1 rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-60"
                title="Refresh Balance"
              >
                {refreshing ? (
                  <svg className="animate-spin h-4 w-4 xs:h-5 xs:w-5 text-yellow-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <FaSyncAlt className="h-4 w-4 xs:h-5 xs:w-5 text-yellow-400" />
                )}
              </button>
            </div>
            <div className="flex gap-2 xs:gap-4 mt-0 xs:mt-0">
              <span>Main: <span className="text-yellow-300">${parseFloat(user.main_balance ?? user.balance ?? 0).toLocaleString()}</span></span>
              <span>Game: <span className="text-pink-300">${parseFloat(user.game_balance ?? user.balance ?? 0).toLocaleString()}</span></span>
            </div>
          </div>
        )}
        {/* Hamburger Menu Button */}
        <button
          className="ml-2 flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-6 h-0.5 bg-white mb-1 rounded"></span>
          <span className="block w-6 h-0.5 bg-white mb-1 rounded"></span>
          <span className="block w-6 h-0.5 bg-white rounded"></span>
        </button>
        {/* Slide-in Drawer Menu */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-slate-900 shadow-2xl z-[9999] transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-full object-cover border-2 border-white/30 shadow" />
              </div>
              <button className="text-white text-2xl" onClick={() => setMenuOpen(false)} aria-label="Close menu">&times;</button>
            </div>
            <nav className="flex-1 flex flex-col gap-2 px-6 py-6">
              <button onClick={() => handleNavigate('/profile')} className="text-left px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition">Profile</button>
              <button onClick={() => handleNavigate('/contact')} className="text-left px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition">Contact</button>
              <button onClick={() => handleNavigate('/wallet')} className="text-left px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition">Wallet</button>
              <button onClick={() => handleNavigate('/gamelog')} className="text-left px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition">Game Log</button>
              <button onClick={() => handleNavigate('/promotion')} className="text-left px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition">Promotion</button>
              <button onClick={() => handleNavigate('/ads')} className="text-left px-4 py-3 rounded-lg text-white font-semibold hover:bg-white/10 transition">Ads</button>
              <button onClick={() => handleNavigate('logout')} disabled={isLoggingOut} className="text-left px-4 py-3 rounded-lg text-red-400 font-bold hover:bg-red-900/30 transition disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </nav>
            {user && (
              <div className="px-6 py-4 border-t border-white/10 text-white text-sm">
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-gray-400">Balance: ${parseFloat(user.balance).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
        {/* Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={() => setMenuOpen(false)}></div>
        )}
      </div>
    </header>
  );
}

export default Header; 