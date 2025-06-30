import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SlotRell from './components/SlotRell';
import JackPot from './components/JackPot';
import { AuthContext } from './contexts/AuthContext';
import Header from './components/Header';

// ဤသည်မှာ ဂိမ်းနှစ်ခုလုံးကို ပြသမည့် အဓိက Application Component ဖြစ်သည်။
function App() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <Header />
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Slot Game */}
          <section className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <SlotRell />
          </section>

          {/* Jackpot Game */}
          <section className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
            <h4 className="text-3xl font-bold text-pink-400 mb-6 text-center">
              💰 OneDigitSlo Jackpot
            </h4>
            <JackPot />
          </section>
        </div>
      </main>
      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-6 border-t border-white/10">
        &copy; {new Date().getFullYear()} SlotRell Gaming Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
