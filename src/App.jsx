import SlotRell from './components/SlotRell'; // SlotRell.jsx သည် src/components တွင်ရှိသည်ဟု ယူဆသည်
import JackPot from './components/JackPot';   // JackPot.jsx သည် src/components တွင်ရှိသည်ဟု ယူဆသည်

// ဤသည်မှာ ဂိမ်းနှစ်ခုလုံးကို ပြသမည့် အဓိက Application Component ဖြစ်သည်။
function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter p-4">
      <header className="text-center py-8 bg-gray-800 rounded-b-2xl shadow-md mb-8">
        <h1 className="text-5xl font-extrabold text-blue-400 drop-shadow-lg">
          My Awesome Betting Platform
        </h1>
        <p className="text-xl text-gray-300 mt-2">
          Place your bets and chase the Jackpot!
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Slot Game ကဏ္ဍ */}
        <section className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">
            🎰 One-Digit Slot Game
          </h2>
          <SlotRell /> {/* SlotRell Component ကို ပြသသည် */}
        </section>

        {/* Jackpot Game ကဏ္ဍ */}
        <section className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-3xl font-bold text-pink-400 mb-6 text-center">
            💰 Nanda AungOree: Jackpot
          </h2>
          <JackPot /> {/* JackPot Component ကို ပြသသည် */}
        </section>
      </main>

      <footer className="text-center text-gray-500 text-sm mt-12 py-4">
        &copy; {new Date().getFullYear()} My Betting Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
