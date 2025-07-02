// src/pages/SlotRell.jsx

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BASE_URL from '../hooks/baseUrl';

// --- Constants ---
const RTP_TARGET = 96.5;
const RTP_WINDOW = 3.0;
const PAYOUT_EXACT_DIGIT = 10;
const PAYOUT_DIGIT_5 = 15;
const PAYOUT_SMALL_BIG = 2;
const PAYOUT_ODD_EVEN = 2;
const JACKPOT_TIMES = ['10:00', '13:00', '21:00'];
const smallDigits = [0, 1, 2, 3, 4];
const bigDigits = [6, 7, 8, 9];
const evenDigits = [0, 2, 4, 6, 8];
const oddDigits = [1, 3, 5, 7, 9];

const sfx = {
  bet: new Howl({ src: ['/assets/sounds/jackpot-slot-machine-coin-loop-12-216269.mp3'], volume: 0.3 }),
  win: new Howl({ src: ['/assets/sounds/you-win-sequence-2-183949.mp3'], volume: 0.3 }),
  lose: new Howl({ src: ['/assets/sounds/game-level-complete-143022.mp3'], volume: 0.3 }),
  streak: new Howl({ src: ['/assets/sounds/cash-register-purchase-87313.mp3'], volume: 0.4 }),
  click: new Howl({ src: ['/assets/sounds/game-level-complete-143022.mp3'], volume: 0.3 }),
};

// --- Utility Functions ---
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
function payoutFor(result, pickVal, bet) {
  if (typeof pickVal === 'number' && result === pickVal) {
    return (result === 5) ? bet * PAYOUT_DIGIT_5 : bet * PAYOUT_EXACT_DIGIT;
  }
  if (pickVal === 'small' && smallDigits.includes(result)) return bet * PAYOUT_SMALL_BIG;
  if (pickVal === 'big' && bigDigits.includes(result)) return bet * PAYOUT_SMALL_BIG;
  if (pickVal === 'middle' && result === 5) return bet * PAYOUT_DIGIT_5;
  if (pickVal === 'even' && evenDigits.includes(result)) return bet * PAYOUT_ODD_EVEN;
  if (pickVal === 'odd' && oddDigits.includes(result)) return bet * PAYOUT_ODD_EVEN;
  return 0;
}
function getMultiplier(pickVal) {
  if (pickVal === 5 || pickVal === 'middle') return PAYOUT_DIGIT_5;
  if (typeof pickVal === 'number') return PAYOUT_EXACT_DIGIT;
  if (pickVal === 'small' || pickVal === 'big') return PAYOUT_SMALL_BIG;
  if (pickVal === 'even' || pickVal === 'odd') return PAYOUT_ODD_EVEN;
  return '--';
}
function getLeaderboard() {
  const names = ['ကိုကို', 'မမ', 'ခင်ဗျာ', 'Nilar', 'MinMin', 'KoPyae', 'Myo', 'Aye', 'Pyae', 'Su', 'Hnin'];
  return Array.from({ length: 5 }).map((_, i) => ({
    name: names[Math.floor(Math.random() * names.length)],
    amount: Math.floor(Math.random() * 9000 + 1000),
    time: `${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
  }));
}

// --- Toast ---
function Toast({ message, type }) {
  const bgColor =
    type === 'win' ? 'bg-green-500'
      : type === 'lose' ? 'bg-red-500'
        : 'bg-blue-500';
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${bgColor} text-white border border-white text-lg`}
    >
      <span>{message}</span>
    </motion.div>
  );
}

export default function SlotRell() {
  const { user, setUser } = useAuth();

  // --- States ---
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
  const [totalBet, setTotalBet] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [leaderboard, setLeaderboard] = useState(getLeaderboard());
  const [winStreak, setWinStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);

  // --- Refs for timeouts/state ---
  const cdRef = useRef(null);
  const jackpotRef = useRef(null);
  const pickRef = useRef(pick);
  useEffect(() => { pickRef.current = pick; }, [pick]);

  useEffect(() => {
    startGameLoop();
    updateJackpotCountdown();
    jackpotRef.current = setInterval(updateJackpotCountdown, 1000);
    return () => {
      clearInterval(cdRef.current);
      clearInterval(jackpotRef.current);
    };
    // eslint-disable-next-line
  }, []);

  function showToastFx(msg, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }
  function updateJackpotCountdown() {
    const nextJackpotDate = calculateNextJackpot();
    const now = new Date();
    const diff = Math.max(0, Math.floor((nextJackpotDate.getTime() - now.getTime()) / 1000));
    setNextJackpotTime(formatTime(diff));
  }

  function startGameLoop() {
    runCountdown();
  }

  function runCountdown() {
    clearInterval(cdRef.current);
    setRunning(false);
    setBetOpen(false);
    setCd(5);
    setResult(null);
    setMessage('');
    let preCount = 5;
    cdRef.current = setInterval(() => {
      preCount--;
      setCd(preCount);
      if (preCount <= 0) {
        clearInterval(cdRef.current);
        setBetOpen(true);
        setCd(10);
        let betCount = 10;
        cdRef.current = setInterval(() => {
          betCount--;
          setCd(betCount);
          if (betCount <= 0) {
            clearInterval(cdRef.current);
            setBetOpen(false);
            setCd(0);
            runGame();
          }
        }, 1000);
      }
    }, 1000);
  }

  // --- Main Game Logic ---
  async function runGame() {
    const pickVal = pickRef.current;
    setRunning(true);
    setMessage('');
    if (pickVal === null) {
      const msg = 'ကျေးဇူးပြု၍ ဂဏန်းတစ်ခု သို့မဟုတ် ကဏ္ဍတစ်ခုကို ရွေးချယ်ပါ။';
      setMessage(msg);
      showToastFx('⚠️ ' + msg, 'info');
      sfx.lose.play();
      setRunning(false);
      setTimeout(() => runCountdown(), 2000);
      return;
    }
    if (bet <= 0) {
      const msg = 'လောင်းကြေးပမာဏသည် သုညထက် ကြီးရပါမည်။';
      setMessage(msg);
      showToastFx('⚠️ ' + msg, 'info');
      sfx.lose.play();
      setRunning(false);
      setTimeout(() => runCountdown(), 2000);
      return;
    }
    if (bet > Number(user?.balance)) {
      const msg = 'သင့်လက်ကျန်ငွေ မလုံလောက်ပါ။';
      setMessage(msg);
      showToastFx('⛔ ' + msg, 'lose');
      sfx.lose.play();
      setRunning(false);
      setTimeout(() => runCountdown(), 2000);
      return;
    }

    // --- RTP Logic ---
    const rtpNow = totalBet > 0 ? (totalPaid / totalBet) * 100 : 0;
    let rolled;
    const pureRandom = Math.random();
    if (pureRandom < 0.90) {
      rolled = Math.floor(Math.random() * 10);
    } else {
      if (rtpNow > RTP_TARGET + RTP_WINDOW) {
        const loseResults = [];
        for (let i = 0; i < 10; i++) {
          if (payoutFor(i, pickVal, bet) === 0) loseResults.push(i);
        }
        rolled = loseResults.length > 0 ? loseResults[Math.floor(Math.random() * loseResults.length)] : Math.floor(Math.random() * 10);
      } else if (rtpNow < RTP_TARGET - RTP_WINDOW) {
        const winResults = [];
        for (let i = 0; i < 10; i++) {
          if (payoutFor(i, pickVal, bet) > 0) winResults.push(i);
        }
        rolled = winResults.length > 0 ? winResults[Math.floor(Math.random() * winResults.length)] : Math.floor(Math.random() * 10);
      } else {
        rolled = Math.floor(Math.random() * 10);
      }
    }

    let winAmt = payoutFor(rolled, pickVal, bet);
    let winStatus = winAmt > 0 ? 'win' : 'lose';
    let multiplier = winAmt > 0 ? winAmt / bet : getMultiplier(pickVal);

    // --- Streak & Sound ---
    let newStreak = winStatus === 'win' ? winStreak + 1 : 0;
    setWinStreak(newStreak);
    if (winStatus === 'win') {
      sfx.win.play();
      if (winAmt >= bet * 10) setTimeout(() => sfx.streak.play(), 300);
      if (newStreak >= 2) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), 1800);
      }
    } else {
      sfx.lose.play();
      setShowStreak(false);
    }

    // --- Toast & Result ---
    let toastMsg = '';
    if (typeof pickVal === 'number') {
      if (pickVal === rolled) {
        toastMsg = pickVal === 5
          ? `🎉 သင်အနိုင်ရသည်! Middle Digit 5 ထွက်! ${winAmt} MMK အနိုင်ရသည်။`
          : `🎉 သင်အနိုင်ရသည်! ဂဏန်း: ${rolled} ထွက်! ${winAmt} MMK အနိုင်ရသည်။`;
      } else toastMsg = `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolled}.`;
    } else if (pickVal === 'small') {
      toastMsg = smallDigits.includes(rolled)
        ? `🎉 သင်အနိုင်ရသည်! (Small: 0-4) ထွက်လာသော ဂဏန်း: ${rolled}. ${winAmt} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolled}.`;
    } else if (pickVal === 'big') {
      toastMsg = bigDigits.includes(rolled)
        ? `🎉 သင်အနိုင်ရသည်! (Big: 6-9) ထွက်လာသော ဂဏန်း: ${rolled}. ${winAmt} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolled}.`;
    } else if (pickVal === 'middle') {
      toastMsg = rolled === 5
        ? `🎉 သင်အနိုင်ရသည်! Middle Digit 5 ထွက်! ${winAmt} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolled}.`;
    } else if (pickVal === 'even') {
      toastMsg = evenDigits.includes(rolled)
        ? `🎉 သင်အနိုင်ရသည်! (Even: 0,2,4,6,8) ထွက်လာသော ဂဏန်း: ${rolled}. ${winAmt} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolled}.`;
    } else if (pickVal === 'odd') {
      toastMsg = oddDigits.includes(rolled)
        ? `🎉 သင်အနိုင်ရသည်! (Odd: 1,3,5,7,9) ထွက်လာသော ဂဏန်း: ${rolled}. ${winAmt} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolled}.`;
    }

    setResult(rolled);
    setLastWins(prev => [rolled, ...prev.slice(0, 4)]);
    setTotalBet(prev => prev + bet);
    setTotalPaid(prev => prev + (winStatus === 'win' ? winAmt : 0));
    showToastFx(toastMsg, winStatus);
    setMessage(
      winStatus === 'win'
        ? `သင်နိုင်ပါသည်! ${rolled} ထွက်ပါသည်။ ${winAmt} MMK အနိုင်ရသည်။`
        : `ရှုံးပါသည်။ ${rolled} ထွက်သည်။`
    );

    // --- Send Bet to Backend ---
    let betType, digit = null;
    if (typeof pickVal === 'number') { betType = 'digit'; digit = pickVal; }
    else { betType = pickVal; }
    const beforeBalance = Number(user?.balance || 0);
    const afterBalance = beforeBalance - bet + (winAmt || 0);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/digit-slot/bet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bets: [
            {
              bet_type: betType,
              digit,
              bet_amount: bet,
              multiplier,
              rolled_number: rolled,
              win_amount: winAmt,
              profit: winAmt - bet,
              status: 'settled',
              bet_time: new Date().toISOString(),
              outcome: winStatus,
              before_balance: beforeBalance,
              after_balance: afterBalance
            }
          ]
        }),
      });
      const data = await res.json();
      // Optionally update balance from backend:
      if (data && data.data && data.data.balance && setUser) {
        setUser(u => ({ ...u, balance: data.data.balance }));
      }
    } catch (err) {
      // You may show an error toast here
      // showToastFx("Backend error: " + err.message, "lose");
    }

    setTimeout(() => {
      setRunning(false);
      runCountdown();
    }, 2000);
  }

  function handleBetChange(val) {
    setBet(Math.max(1, val));
    sfx.click.play();
  }
  function handlePick(val) {
    setPick(val);
    sfx.bet.play();
  }

  const rtp = totalBet > 0 ? ((totalPaid / totalBet) * 100).toFixed(2) : "---";
  const multiplier = getMultiplier(pick);

  return (
    <div className="p-4 rounded-2xl w-full min-h-screen text-center bg-[#15192c] text-white font-inter flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex justify-between items-center p-2 mb-4 bg-gray-900 rounded-lg shadow-md">
        <div className="px-3 py-1 bg-gray-800 rounded-md text-sm">{user?.user_name || 'User Name'}</div>
        <div className="px-3 py-1 bg-[#0ea5e9] rounded-md text-sm font-bold shadow border-2 border-cyan-400">Balance: <span className="font-extrabold">{Number(user?.balance || 0).toFixed(2)}</span> MMK</div>
        <div className="px-3 py-1 bg-gray-800 rounded-md text-sm">Log</div>
      </div>

      {/* Leaderboard Marquee */}
      <style>{`
        @keyframes leaderboard-marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .leaderboard-marquee {
          display: flex;
          white-space: nowrap;
          animation: leaderboard-marquee 18s linear infinite;
        }
      `}</style>
      <div className="w-full flex flex-col items-center mb-2">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="text-yellow-300" size={28} />
          <span className="font-bold text-yellow-200 text-lg">Leaderboard</span>
        </div>
        <div className="w-full max-w-xl bg-gray-800 p-2 rounded-xl shadow-inner text-sm overflow-hidden">
          <div className="leaderboard-marquee">
            {leaderboard.map((entry, i) => (
              <div key={i} className="flex flex-col items-center py-2 px-8">
                <span className="font-bold text-cyan-400">{entry.name}</span>
                <span className="text-yellow-300">{entry.amount} MMK</span>
                <span className="text-gray-400">{entry.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RTP Marquee */}
      <style>{`
        @keyframes marquee {0%{transform:translateX(100%);}100%{transform:translateX(-100%);}}
        .animate-marquee {animation: marquee 15s linear infinite;}
      `}</style>
      <div className="w-full my-2 bg-gray-800 p-2 rounded-lg shadow-md overflow-hidden">
        <p className="text-sm text-yellow-300 whitespace-nowrap animate-marquee">
          🎉 သာမန်ကစားသမားများ: အနည်းဆုံးလောင်းကြေး 10 MMK | RTP: {rtp}% | ယနေ့ Jackpot: {jackpot} MMK
        </p>
      </div>
      {/* Jackpot Info */}
      <div className="w-full flex justify-around items-center my-4 p-2 bg-gray-800 rounded-lg shadow-md">
        <div className="text-lg font-bold text-teal-300">Jackpot: {jackpot.toLocaleString()} MMK</div>
        <div className="text-lg font-bold text-blue-300">Next Jackpot: {nextJackpotTime}</div>
      </div>
      {/* RTP Display */}
      <div className="w-full flex justify-around items-center my-2 p-2 bg-gray-700 rounded-lg shadow-md">
        <div className="text-base text-green-300">Total Bet: {totalBet} MMK</div>
        <div className="text-base text-pink-300">Total Paid: {totalPaid} MMK</div>
        <div className="text-base text-yellow-300 font-bold">RTP: {rtp}%</div>
      </div>

      {/* Multiplier */}
      <div className="flex justify-center items-center gap-4 mb-2">
        <span className="px-4 py-2 rounded bg-gray-800 text-yellow-300 font-bold text-lg shadow-md">
          Multiplier: <span className="font-extrabold">{multiplier}</span>x
        </span>
      </div>
      <div className="text-xs text-gray-400 mb-4">[ဂဏန်းတစ်ခု - 10x, 5 - 15x, (Small/Big/Even/Odd) - 2x]</div>

      {/* Streak Celebration */}
      <AnimatePresence>
        {showStreak && (
          <motion.div
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed left-1/2 top-16 -translate-x-1/2 bg-yellow-400 text-black px-8 py-3 rounded-full font-bold text-xl z-50 shadow-2xl flex items-center gap-2 border-4 border-yellow-200"
          >
            <Sparkles size={32} className="text-pink-500 animate-bounce" />
            <span>🔥 Win Streak x{winStreak}!</span>
            <Sparkles size={32} className="text-blue-500 animate-bounce" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Digit */}
      <div className="my-8 w-64 h-64 bg-[#181d32] rounded-full flex flex-col items-center justify-center relative overflow-hidden text-green-400 font-extrabold text-7xl shadow-2xl border-4 border-cyan-500 border-dashed">
        <AnimatePresence mode="wait">
          <motion.div
            key={result !== null ? result : "question"}
            initial={{ scale: 0.3, opacity: 0, rotate: 0 }}
            animate={{ scale: 1.2, opacity: 1, rotate: [0, 15, -15, 0] }}
            exit={{ scale: 0.2, opacity: 0, rotate: 0 }}
            transition={{
              scale: { type: "spring", stiffness: 300, damping: 16 },
              rotate: { type: "tween", duration: 0.6 },
            }}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <span className="text-7xl font-extrabold text-green-400 drop-shadow-2xl">
              {result !== null ? result : '?'}
            </span>
          </motion.div>
        </AnimatePresence>
        {cd > 0 && (
          <motion.p
            className="absolute bottom-4 text-base text-yellow-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {betOpen ? `Betting ends in: ${cd}s` : `Game start in: ${cd}s`}
          </motion.p>
        )}
      </div>

      {/* Bet Open Message */}
      {betOpen && (
        <motion.p
          className="mb-4 text-green-400 text-lg animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >💸 လောင်းကြေးတင်နိုင်ပါပြီ! {cd} စက္ကန့်အတွင်း ထိုးပါ!</motion.p>
      )}

      {/* Bet Controls */}
      <div className="w-full flex flex-col items-center mb-6">
        <div className="flex items-center justify-center w-full max-w-sm">
          <button
            onClick={() => handleBetChange(bet - 10)}
            className="p-3 bg-gray-700 text-white rounded-l-lg font-bold text-xl hover:bg-gray-600 transition duration-200"
            disabled={!betOpen}
          >-</button>
          <input
            type="number"
            min="1"
            value={bet}
            onChange={e => handleBetChange(Number(e.target.value))}
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

      {/* Digits and Group Buttons */}
      <div className="w-full mb-8 max-w-xl">
        <h2 className="text-xl font-semibold text-gray-300 mb-3">ဂဏန်းတခုကို ရွေးချယ်ပါ</h2>
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[...Array(10).keys()].map(d => (
            <button
              key={d}
              onClick={() => handlePick(d)}
              className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${
                typeof pick === 'number' && pick === d
                  ? 'bg-cyan-600 text-white ring-4 ring-cyan-300 scale-105'
                  : 'bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-white border border-gray-600'
              } ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!betOpen}
            >{d}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => handlePick('small')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${
              pick === 'small'
                ? 'bg-cyan-600 text-white ring-4 ring-cyan-300 scale-105'
                : 'bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-white border border-gray-600'
            } ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Small (0-4)</button>
          <button
            onClick={() => handlePick('middle')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${
              pick === 'middle'
                ? 'bg-cyan-600 text-white ring-4 ring-cyan-300 scale-105'
                : 'bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-white border border-gray-600'
            } ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Middle (5)</button>
          <button
            onClick={() => handlePick('big')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${
              pick === 'big'
                ? 'bg-cyan-600 text-white ring-4 ring-cyan-300 scale-105'
                : 'bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-white border border-gray-600'
            } ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Big (6-9)</button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handlePick('even')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${
              pick === 'even'
                ? 'bg-cyan-600 text-white ring-4 ring-cyan-300 scale-105'
                : 'bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-white border border-gray-600'
            } ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Even (0,2,4,6,8)</button>
          <button
            onClick={() => handlePick('odd')}
            className={`p-4 rounded-lg font-bold text-xl transition-all duration-200 shadow-md ${
              pick === 'odd'
                ? 'bg-cyan-600 text-white ring-4 ring-cyan-300 scale-105'
                : 'bg-gray-700 text-gray-200 hover:bg-cyan-500 hover:text-white border border-gray-600'
            } ${!betOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!betOpen}
          >Odd (1,3,5,7,9)</button>
        </div>
      </div>

      {/* Last Wins */}
      <div className="w-full max-w-xs flex justify-center items-center gap-2 mb-6">
        <p className="text-lg font-semibold text-gray-300">last won prize number</p>
        <div className="flex space-x-1">
          {lastWins.map((num, idx) => (
            <span key={idx} className="w-8 h-8 flex items-center justify-center bg-black rounded-full text-white font-bold text-lg">{num}</span>
          ))}
        </div>
      </div>
      {message && (
        <motion.p
          className="mt-6 text-lg font-semibold p-4 rounded-xl shadow-md animate-fade-in bg-blue-700 text-blue-100 border border-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >{message}</motion.p>
      )}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
