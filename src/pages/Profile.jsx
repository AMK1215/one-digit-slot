import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import BASE_URL from '../hooks/baseUrl';
import Header from '../components/Header';

function Profile() {
  const { user, logout, isLoggingOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(user?.balance || '0.00');
  const [mainBalance, setMainBalance] = useState(user?.main_balance || '0.00');

  // Refresh user data
  const refreshUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      if (data.data) {
        setBalance(data.data.balance);
        setMainBalance(data.data.main_balance);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUserData();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleGoToGame = () => {
    navigate('/game');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Card */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                  {user.name}
                </h2>
                <p className="text-gray-300 mt-2">@{user.user_name}</p>
              </div>
              <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400">👤</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Username</p>
                        <p className="text-white font-semibold">{user.user_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400">📱</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white font-semibold">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                  {user.email && (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400">📧</span>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Email</p>
                          <p className="text-white font-semibold">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-400">🆔</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">User ID</p>
                        <p className="text-white font-semibold">#{user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Balance Card */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  💰 Balance
                </h2>
                <p className="text-gray-300 mt-2">Your current balances</p>
              </div>
              <div className="space-y-6">
                {/* Main Balance */}
                <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-cyan-300">💎</span>
                      <span className="text-lg font-bold text-white">Main Balance</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">${mainBalance}</span>
                  </div>
                </div>
                {/* Game Balance */}
                <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl text-pink-300">🎮</span>
                      <span className="text-lg font-bold text-white">Game Balance</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-300">${balance}</span>
                  </div>
                </div>
                <button
                  onClick={refreshUserData}
                  disabled={isLoading}
                  className="w-full mt-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg hover:from-cyan-500 hover:to-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Refreshing...' : '🔄 Refresh Balance'}
                </button>
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleGoToGame}
                    className="flex-1 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg hover:from-purple-500 hover:to-pink-600 transition-all"
                  >
                    🎮 Play Now
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-red-400 to-pink-500 shadow-lg hover:from-red-500 hover:to-pink-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Logging out...' : '🚪 Logout'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
