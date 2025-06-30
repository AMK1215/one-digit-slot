import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import BASE_URL from '../hooks/baseUrl';

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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎰</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                    User Profile
                  </h1>
                  <p className="text-gray-300 text-sm">Welcome back, {user.name}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleGoToGame}
                  className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded-lg border border-teal-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  🎮 Play Game
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/50 transition-all duration-300 transform hover:scale-105"
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-red-300" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Logging out...</span>
                  ) : (
                    '🚪 Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

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
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💎</span>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Main Balance</p>
                        <p className="text-2xl font-bold text-green-400">
                          ${parseFloat(mainBalance).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Balance */}
                <div className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🎮</span>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Game Balance</p>
                        <p className="text-2xl font-bold text-blue-400">
                          ${parseFloat(balance).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={refreshUserData}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Refreshing...
                    </div>
                  ) : (
                    '🔄 Refresh Balance'
                  )}
                </button>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleGoToGame}
                    className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    🎮 Play Now
                  </button>
                  <button
                    onClick={handleLogout}
                    className="py-3 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-xl border border-red-500/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-red-300" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Logging out...</span>
                    ) : (
                      '🚪 Logout'
                    )}
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
