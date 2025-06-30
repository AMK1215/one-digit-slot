import { useState, useEffect, useRef } from 'react';

// Utility functions & constants
const PAYOUT_EXACT_DIGIT = 5;
const PAYOUT_DIGIT_5 = 10;
const PAYOUT_SMALL_BIG = 2;
const PAYOUT_ODD_EVEN = 2;
const JACKPOT_TIMES = ['10:00', '13:00', '21:00'];

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function calculateNextJackpot() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let nextTime = null;
  for (const timeStr of JACKPOT_TIMES) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
    if (targetDate > now) {
      nextTime = targetDate;
      break;
    }
  }
  if (!nextTime) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const [hours, minutes] = JACKPOT_TIMES[0].split(':').map(Number);
    nextTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hours, minutes, 0);
  }
  return nextTime;
}

// Toast component
function Toast({ message, type }) {
  const bgColor =
    type === 'win' ? 'bg-green-500'
      : type === 'lose' ? 'bg-red-500'
      : 'bg-blue-500';
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 transition-transform transform duration-300 ease-out animate-fade-in-down ${bgColor} text-white border border-white`}>
      <span>{message}</span>
    </div>
  );
}

function SlotRell() {
  // 1. State Variables
  const [wallet, setWallet] = useState(1000);
  const [bet, setBet] = useState(10);
  const [pick, setPick] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [cd, setCd] = useState(5);
  const [betOpen, setBetOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastWins, setLastWins] = useState([]);
  const [jackpot, setJackpot] = useState(5000);
  const [nextJackpotTime, setNextJackpotTime] = useState('');

  // 2. Timer Refs
  const cdRef = useRef(null);
  const gameRef = useRef(null);
  const jackpotRef = useRef(null);

  // 3. Lifecycle
  useEffect(() => {
    console.log("[useEffect] Component mounted, starting game loop and jackpot timer.");
    startGameLoop();
    updateJackpotCountdown();
    jackpotRef.current = setInterval(updateJackpotCountdown, 1000);

    return () => {
      clearInterval(cdRef.current);
      clearInterval(gameRef.current);
      clearInterval(jackpotRef.current);
      console.log("[useEffect] Cleaned up intervals on unmount.");
    };
    // eslint-disable-next-line
  }, []);

  // 4. Utility Handlers
  function showToast(msg, type = 'info') {
    console.log(`[Toast] (${type}) ${msg}`);
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  function updateJackpotCountdown() {
    const next = calculateNextJackpot();
    const now = new Date();
    const diff = Math.max(0, Math.floor((next - now) / 1000));
    setNextJackpotTime(formatTime(diff));
    // Uncomment next line if you want logs every second
    // console.log(`[Jackpot Timer] Next jackpot in: ${formatTime(diff)}`);
  }

  // 5. Game Cycle Handlers
  function startGameLoop() {
    console.log("[Game] startGameLoop called");
    runCountdown();
    gameRef.current = setInterval(runCountdown, 10000);
  }

  // function runCountdown() {
  //   console.log("[Countdown] Starting new round countdown.");
  //   setRunning(false);
  //   setBetOpen(false);
  //   setCd(5);
  //   setResult(null);
  //   let count = 5;
  //   cdRef.current = setInterval(() => {
  //     count--;
  //     setCd(count);
  //     console.log(`[Countdown] ${count} seconds remaining before betting opens.`);
  //     if (count === 0) {
  //       clearInterval(cdRef.current);
  //       setPick(null);
  //       setBetOpen(true);
  //       console.log("[Countdown] Betting phase OPENED for 4 seconds.");
  //       setTimeout(() => {
  //         setBetOpen(false);
  //         console.log("[Countdown] Betting phase CLOSED. Running game...");
  //         runGame();
  //       }, 4000);
  //     }
  //   }, 1000);
  // }

  function runCountdown() {
  console.log("[Countdown] Starting new round countdown.");
  setRunning(false);
  setBetOpen(false);
  setCd(5);

  let count = 5;
  cdRef.current = setInterval(() => {
    count--;
    setCd(count);
    console.log(`[Countdown] ${count} seconds remaining before betting opens.`);
    if (count === 0) {
      clearInterval(cdRef.current);
      setPick(null);
      setBetOpen(true);
      setCd(10); // Start betting countdown: 10 seconds
      let betCount = 10;
      // Start new interval for betting time
      cdRef.current = setInterval(() => {
        betCount--;
        setCd(betCount);
        console.log(`[Countdown] ${betCount} seconds remaining for betting.`);
        if (betCount === 0) {
          clearInterval(cdRef.current);
          setBetOpen(false);
          setCd(0);
          setTimeout(() => {
            setResult(null); // Clear result just before new round result
          }, 500); // Clear result after half a second for a better transition
          console.log("[Countdown] Betting phase CLOSED. Running game...");
          runGame();
        }
      }, 1000);
    }
  }, 1000);
}


  // 6. Main Game Logic
  function runGame() {
    setRunning(true);
    setMessage('');
    console.log("[Game] runGame called.");

    // Validation
   
    if (bet <= 0) {
      setMessage('လောင်းကြေးပမာဏသည် သုညထက် ကြီးရပါမည်။');
      showToast('⚠️ လောင်းကြေးငွေ ထည့်ပါ။', 'info');
      console.warn("[Game] Bet failed: Invalid bet amount.", bet);
      return;
    }
    if (bet > wallet) {
      setMessage('သင့်လက်ကျန်ငွေ မလုံလောက်ပါ။');
      showToast('⛔ လက်ကျန်ငွေ မလုံလောက်ပါ။', 'lose');
      console.warn("[Game] Bet failed: Insufficient balance.", wallet, bet);
      return;
    }

    // Result calculation
    const rolled = Math.floor(Math.random() * 10);
    let winAmt = 0;
    let winStatus = 'lose';
    let toastMsg = '';
    console.log(`[Game] Random rolled digit: ${rolled}`);
    console.log(`[Game] User pick: ${pick} | Bet: ${bet} | Wallet before: ${wallet}`);

    if (typeof pick === 'number' && pick === rolled) {
      winStatus = 'win';
      winAmt = rolled === 5 ? bet * PAYOUT_DIGIT_5 : bet * PAYOUT_EXACT_DIGIT;
      toastMsg = `🎉 သင်အနိုင်ရသည်! ထွက်လာသော ဂဏန်း: ${rolled}. ${winAmt} MMK အနိုင်ရသည်။`;
      console.log(`[Game] WIN: Exact digit (${rolled}). Win Amount: ${winAmt}`);
    } else if (pick === 'small' && rolled <= 4) {
      winStatus = 'win';
      winAmt = bet * PAYOUT_SMALL_BIG;
      toastMsg = `🎉 သင်အနိုင်ရသည်! ထွက်လာသော ဂဏန်း: ${rolled} (Small). ${winAmt} MMK အနိုင်ရသည်။`;
      console.log(`[Game] WIN: Small (0-4). Win Amount: ${winAmt}`);
    } else if (pick === 'big' && rolled >= 5) {
      winStatus = 'win';
      winAmt = bet * PAYOUT_SMALL_BIG;
      toastMsg = `🎉 သင်အနိုင်ရသည်! ထွက်လာသော ဂဏန်း: ${rolled} (Big). ${winAmt} MMK အနိုင်ရသည်။`;
      console.log(`[Game] WIN: Big (5-9). Win Amount: ${winAmt}`);
    } else if (pick === 'odd' && rolled % 2 !== 0) {
      winStatus = 'win';
      winAmt = bet * PAYOUT_ODD_EVEN;
      toastMsg = `🎉 သင်အနိုင်ရသည်! ထွက်လာသော ဂဏန်း: ${rolled} (Odd). ${winAmt} MMK အနိုင်ရသည်။`;
      console.log(`[Game] WIN: Odd. Win Amount: ${winAmt}`);
    } else if (pick === 'even' && rolled % 2 === 0) {
      winStatus = 'win';
      winAmt = bet * PAYOUT_ODD_EVEN;
      toastMsg = `🎉 သင်အနိုင်ရသည်! ထွက်လာသော ဂဏန်း: ${rolled} (Even). ${winAmt} MMK အနိုင်ရသည်။`;
      console.log(`[Game] WIN: Even. Win Amount: ${winAmt}`);
    } else {
      toastMsg = `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolled}.`;
      console.log("[Game] LOSE.");
    }

    // Update wallet
    const newWallet = winStatus === 'win' ? wallet - bet + winAmt : wallet - bet;
    setWallet(newWallet);
    setResult(rolled);
    setLastWins(prev => [rolled, ...prev].slice(0, 3));
    showToast(toastMsg, winStatus);
    setMessage(
      winStatus === 'win'
        ? `သင်နိုင်ပါသည်! ${rolled} ထွက်ပါသည်။ ${winAmt} MMK အနိုင်ရသည်။`
        : `ရှုံးပါသည်။ ${rolled} ထွက်သည်။`
    );
    console.log(`[Game] Wallet after: ${newWallet}. Result digit: ${rolled}. Last wins:`, [rolled, ...lastWins].slice(0, 3));
  }

  // User actions (extra debug logs)
  function handleBetChange(val) {
    setBet(val);
    console.log("[User] Bet amount changed:", val);
  }
  function handlePick(val) {
    setPick(val);
    console.log("[User] Digit/category selected:", val);
  }

  // UI Rendering
  return (
    <div className="p-4 rounded-2xl w-full min-h-screen text-center bg-[#0f172a] text-white font-inter flex flex-col items-center">
      {/* Top Header Section */}
      <div className="w-full flex justify-between items-center p-2 mb-4 bg-gray-800 rounded-lg shadow-md">
        <div className="px-3 py-1 bg-gray-700 rounded-md text-sm">user name</div>
        <div className="px-3 py-1 bg-gray-700 rounded-md text-sm font-bold">Balance: ${wallet.toFixed(2)}</div>
        <div className="px-3 py-1 bg-gray-700 rounded-md text-sm">log</div>
      </div>
      {/* Marquee */}
      <style>{`
        @keyframes marquee {0%{transform:translateX(100%);}100%{transform:translateX(-100%);}}
        .animate-marquee {animation: marquee 15s linear infinite;}
      `}</style>
      <div className="w-full my-2 bg-gray-800 p-2 rounded-lg shadow-md overflow-hidden">
        <p className="text-sm text-yellow-300 whitespace-nowrap animate-marquee">
          winner list text, jackpot text , etc .......
        </p>
      </div>
      {/* Jackpot Info */}
      <div className="w-full flex justify-around items-center my-4 p-2 bg-gray-800 rounded-lg shadow-md">
        <div className="text-lg font-bold text-teal-300">Jackpot Amount: ${jackpot.toFixed(2)}</div>
        <div className="text-lg font-bold text-blue-300">Next Jackpot: {nextJackpotTime}</div>
      </div>
      {/* Main Result Display */}
      {/* <div className="my-8 w-60 h-60 bg-gray-900 rounded-full flex flex-col items-center justify-center relative overflow-hidden text-green-400 font-extrabold text-7xl shadow-2xl border-4 border-teal-500">
        {result !== null ? result : '?'}
        {cd > 0 && (
          <p className="absolute bottom-4 text-base text-yellow-300">
            Game start in: {cd}s
          </p>
        )}
      </div> */}
      <div className="my-8 w-60 h-60 bg-gray-900 rounded-full flex flex-col items-center justify-center relative overflow-hidden text-green-400 font-extrabold text-7xl shadow-2xl border-4 border-teal-500">
  {/* Show '?' only when result is null */}
  {result !== null ? result : '?'}
  {cd > 0 && (
    <p className="absolute bottom-4 text-base text-yellow-300">
      {betOpen
        ? `Betting ends in: ${cd}s`
        : `Game start in: ${cd}s`
      }
    </p>
  )}
</div>

      {/* Betting Open Message */}
      {betOpen && (
        <p className="mb-4 text-green-400 text-lg animate-pulse">
          💸 လောင်းကြေးတင်နိုင်ပါပြီ! 4 စက္ကန့်အတွင်း ထိုးပါ!
        </p>
      )}
      {/* Bet Amount Input */}
      <div className="w-full flex flex-col items-center mb-6">
        <div className="flex items-center justify-center w-full max-w-sm">
          <button
            onClick={() => handleBetChange(Math.max(1, bet - 10))}
            className="p-3 bg-gray-700 text-white rounded-l-lg font-bold text-xl hover:bg-gray-600 transition duration-200"
            disabled={!betOpen}
          >-</button>
          <input
            type="number"
            min="1"
            value={bet}
            onChange={e => handleBetChange(Math.max(1, parseInt(e.target.value) || 0))}
            className="flex-grow p-3 bg-gray-700 text-white text-center font-bold text-xl border-l border-r border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={!betOpen}
          />
          <button
            onClick={() => handleBetChange(bet + 10)}
            className="p-3 bg-gray-700 text-white rounded-r-lg font-bold text-xl hover:bg-gray-600 transition duration-200"
            disabled={!betOpen}
          >+</button>
        </div>
      </div>
      {/* Digit & Category Selection */}
      <div className="w-full mb-8 max-w-xl">
        <h2 className="text-xl font-semibold text-gray-300 mb-3">သင်၏ ကံကောင်းသော ဂဏန်းကို ရွေးချယ်ပါ</h2>
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[...Array(10).keys()].map(d => (
            <button
              key={d}
              onClick={() => handlePick(d)}
              className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${
                typeof pick === 'number' && pick === d
                  ? 'bg-teal-600 text-white ring-4 ring-teal-300 scale-105'
                  : 'bg-gray-700 text-gray-200 hover:bg-teal-500 hover:text-white border border-gray-600'
              } ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!betOpen}
            >{d}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handlePick('small')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${pick === 'small' ? 'bg-teal-600 text-white ring-4 ring-teal-300 scale-105' : 'bg-gray-700 text-gray-200 hover:bg-teal-500 hover:text-white border border-gray-600'} ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Small (0-4)</button>
          <button
            onClick={() => handlePick('big')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${pick === 'big' ? 'bg-teal-600 text-white ring-4 ring-teal-300 scale-105' : 'bg-gray-700 text-gray-200 hover:bg-teal-500 hover:text-white border border-gray-600'} ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Big (5-9)</button>
          <button
            onClick={() => handlePick('odd')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${pick === 'odd' ? 'bg-teal-600 text-white ring-4 ring-teal-300 scale-105' : 'bg-gray-700 text-gray-200 hover:bg-teal-500 hover:text-white border border-gray-600'} ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Odd</button>
          <button
            onClick={() => handlePick('even')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${pick === 'even' ? 'bg-teal-600 text-white ring-4 ring-teal-300 scale-105' : 'bg-gray-700 text-gray-200 hover:bg-teal-500 hover:text-white border border-gray-600'} ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Even</button>
        </div>
      </div>
      {/* Last Won Prize Numbers */}
      <div className="w-full max-w-xs flex justify-center items-center gap-2 mb-6">
        <p className="text-lg font-semibold text-gray-300">last won prize number</p>
        <div className="flex space-x-1">
          {lastWins.map((num, idx) => (
            <span key={idx} className="w-8 h-8 flex items-center justify-center bg-black rounded-full text-white font-bold text-lg">{num}</span>
          ))}
        </div>
      </div>
      {/* Main Message */}
      {message && (
        <p className="mt-6 text-lg font-semibold p-4 rounded-xl shadow-md animate-fade-in bg-blue-700 text-blue-100 border border-blue-600">
          {message}
        </p>
      )}
      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

export default SlotRell;
