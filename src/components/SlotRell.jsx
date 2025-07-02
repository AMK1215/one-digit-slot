import { useState, useEffect, useRef, useCallback } from 'react';
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
const SMALL_DIGITS = [0, 1, 2, 3, 4];
const BIG_DIGITS = [6, 7, 8, 9];
const EVEN_DIGITS = [0, 2, 4, 6, 8];
const ODD_DIGITS = [1, 3, 5, 7, 9];
const BET_AMOUNTS = [10, 20, 50, 100, 200, 400, 1000, 10000];
const COUNTDOWN_PRE_GAME = 5;
const COUNTDOWN_BETTING = 10;
const TOAST_DISPLAY_TIME = 3500; // milliseconds
const GAME_RESULT_DISPLAY_TIME = 2000; // milliseconds
const STREAK_DISPLAY_TIME = 1800; // milliseconds

const sfx = {
  bet: new Howl({ src: ['/assets/sounds/jackpot-slot-machine-coin-loop-12-216269.mp3'], volume: 0.3 }),
  win: new Howl({ src: ['/assets/sounds/you-win-sequence-2-183949.mp3'], volume: 0.3 }),
  lose: new Howl({ src: ['/assets/sounds/game-level-complete-143022.mp3'], volume: 0.3 }),
  streak: new Howl({ src: ['/assets/sounds/cash-register-purchase-87313.mp3'], volume: 0.4 }),
  click: new Howl({ src: ['/assets/sounds/game-level-complete-143022.mp3'], volume: 0.3 }),
};

// --- Utility Functions ---
// Moved to be pure functions outside the component
const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const calculateNextJackpotTime = () => {
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
};

const getPayoutFor = (result, pickVal, bet) => {
  if (typeof pickVal === 'number' && result === pickVal) {
    return (result === 5) ? bet * PAYOUT_DIGIT_5 : bet * PAYOUT_EXACT_DIGIT;
  }
  if (pickVal === 'small' && SMALL_DIGITS.includes(result)) return bet * PAYOUT_SMALL_BIG;
  if (pickVal === 'big' && BIG_DIGITS.includes(result)) return bet * PAYOUT_SMALL_BIG;
  if (pickVal === 'middle' && result === 5) return bet * PAYOUT_DIGIT_5;
  if (pickVal === 'even' && EVEN_DIGITS.includes(result)) return bet * PAYOUT_ODD_EVEN;
  if (pickVal === 'odd' && ODD_DIGITS.includes(result)) return bet * PAYOUT_ODD_EVEN;
  return 0;
};

const generateLeaderboard = () => {
  const names = ['ကိုကို', 'မမ', 'ခင်ဗျာ', 'Nilar', 'MinMin', 'KoPyae', 'Myo', 'Aye', 'Pyae', 'Su', 'Hnin'];
  return Array.from({ length: 5 }).map(() => ({
    name: names[Math.floor(Math.random() * names.length)],
    amount: Math.floor(Math.random() * 9000 + 1000),
    time: `${Math.floor(Math.random() * 23).toString().padStart(2, '0')}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
  }));
};

// --- Toast Component ---
const Toast = ({ message, type }) => {
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
};

export default function SlotRell() {
  const { user, setUser } = useAuth();

  // --- States ---
  const [bet, setBet] = useState(BET_AMOUNTS[0]); // Initialize with the first bet amount
  const [pick, setPick] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_PRE_GAME);
  const [bettingOpen, setBettingOpen] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [lastRolledNumbers, setLastRolledNumbers] = useState([]);
  const [jackpot, setJackpot] = useState(5000);
  const [nextJackpotCountdown, setNextJackpotCountdown] = useState('');
  const [totalBet, setTotalBet] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [leaderboard, setLeaderboard] = useState(generateLeaderboard());
  const [winStreak, setWinStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);

  // --- Refs for timeouts/intervals ---
  const countdownIntervalRef = useRef(null);
  const jackpotIntervalRef = useRef(null);
  const currentPickRef = useRef(pick);
  useEffect(() => { currentPickRef.current = pick; }, [pick]); // Keep ref updated for runGame

  // --- Memoized Callbacks ---

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), TOAST_DISPLAY_TIME);
  }, []);

  const updateJackpotCountdown = useCallback(() => {
    const nextJackpotDate = calculateNextJackpotTime();
    const now = new Date();
    const diff = Math.max(0, Math.floor((nextJackpotDate.getTime() - now.getTime()) / 1000));
    setNextJackpotCountdown(formatTime(diff));
  }, []);

  const runCountdown = useCallback(() => {
    clearInterval(countdownIntervalRef.current);
    setGameRunning(false);
    setBettingOpen(false);
    setCountdown(COUNTDOWN_PRE_GAME);
    setResult(null);
    setMessage('');

    let preGameCount = COUNTDOWN_PRE_GAME;
    countdownIntervalRef.current = setInterval(() => {
      preGameCount--;
      setCountdown(preGameCount);
      if (preGameCount <= 0) {
        clearInterval(countdownIntervalRef.current);
        setBettingOpen(true);
        setCountdown(COUNTDOWN_BETTING);
        let bettingCount = COUNTDOWN_BETTING;
        countdownIntervalRef.current = setInterval(() => {
          bettingCount--;
          setCountdown(bettingCount);
          if (bettingCount <= 0) {
            clearInterval(countdownIntervalRef.current);
            setBettingOpen(false);
            setCountdown(0);
            // Use a timeout to ensure state updates (bettingOpen=false) propagate before runGame
            setTimeout(() => runGame(), 50);
          }
        }, 1000);
      }
    }, 1000);
  }, []); // Dependencies: runGame is a dependency here, needs useCallback itself

  const runGame = useCallback(async () => {
    const selectedPick = currentPickRef.current; // Use the ref for the latest pick value
    setGameRunning(true);
    setMessage('');

    // --- Pre-game validation ---
    if (selectedPick === null) {
      const msg = 'ကျေးဇူးပြု၍ ဂဏန်းတစ်ခု သို့မဟုတ် ကဏ္ဍတစ်ခုကို ရွေးချယ်ပါ။';
      setMessage(msg);
      showToast('⚠️ ' + msg, 'info');
      sfx.lose.play();
      setGameRunning(false);
      setTimeout(() => runCountdown(), GAME_RESULT_DISPLAY_TIME);
      return;
    }
    if (bet <= 0) {
      const msg = 'လောင်းကြေးပမာဏသည် သုညထက် ကြီးရပါမည်။';
      setMessage(msg);
      showToast('⚠️ ' + msg, 'info');
      sfx.lose.play();
      setGameRunning(false);
      setTimeout(() => runCountdown(), GAME_RESULT_DISPLAY_TIME);
      return;
    }
    if (bet > Number(user?.balance)) {
      const msg = 'သင့်လက်ကျန်ငွေ မလုံလောက်ပါ။';
      setMessage(msg);
      showToast('⛔ ' + msg, 'lose');
      sfx.lose.play();
      setGameRunning(false);
      setTimeout(() => runCountdown(), GAME_RESULT_DISPLAY_TIME);
      return;
    }

    // --- RTP Logic ---
    const rtpNow = totalBet > 0 ? (totalPaid / totalBet) * 100 : 0;
    let rolledNumber;
    const pureRandom = Math.random();

    if (pureRandom < 0.90) { // 90% chance of pure random roll
      rolledNumber = Math.floor(Math.random() * 10);
    } else { // 10% chance to adjust for RTP target
      if (rtpNow > RTP_TARGET + RTP_WINDOW) {
        // If RTP is too high, try to force a loss
        const loseResults = [];
        for (let i = 0; i < 10; i++) {
          if (getPayoutFor(i, selectedPick, bet) === 0) loseResults.push(i);
        }
        rolledNumber = loseResults.length > 0 ? loseResults[Math.floor(Math.random() * loseResults.length)] : Math.floor(Math.random() * 10);
      } else if (rtpNow < RTP_TARGET - RTP_WINDOW) {
        // If RTP is too low, try to force a win
        const winResults = [];
        for (let i = 0; i < 10; i++) {
          if (getPayoutFor(i, selectedPick, bet) > 0) winResults.push(i);
        }
        rolledNumber = winResults.length > 0 ? winResults[Math.floor(Math.random() * winResults.length)] : Math.floor(Math.random() * 10);
      } else {
        // Within RTP window, pure random
        rolledNumber = Math.floor(Math.random() * 10);
      }
    }

    const winAmount = getPayoutFor(rolledNumber, selectedPick, bet);
    const outcomeStatus = winAmount > 0 ? 'win' : 'lose';

    // --- Streak & Sound ---
    let newStreak = outcomeStatus === 'win' ? winStreak + 1 : 0;
    setWinStreak(newStreak);
    if (outcomeStatus === 'win') {
      sfx.win.play();
      if (winAmount >= bet * PAYOUT_EXACT_DIGIT) setTimeout(() => sfx.streak.play(), 300); // Play streak sound for big wins
      if (newStreak >= 2) {
        setShowStreak(true);
        setTimeout(() => setShowStreak(false), STREAK_DISPLAY_TIME);
      }
    } else {
      sfx.lose.play();
      setShowStreak(false);
    }

    // --- Toast & Result Messages ---
    let toastMessage = '';
    let displayMessage = '';

    if (typeof selectedPick === 'number') {
      if (selectedPick === rolledNumber) {
        toastMessage = selectedPick === 5
          ? `🎉 သင်အနိုင်ရသည်! Middle Digit 5 ထွက်! ${winAmount} MMK အနိုင်ရသည်။`
          : `🎉 သင်အနိုင်ရသည်! ဂဏန်း: ${rolledNumber} ထွက်! ${winAmount} MMK အနိုင်ရသည်။`;
        displayMessage = `သင်နိုင်ပါသည်! ${rolledNumber} ထွက်ပါသည်။ ${winAmount} MMK အနိုင်ရသည်။`;
      } else {
        toastMessage = `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolledNumber}.`;
        displayMessage = `ရှုံးပါသည်။ ${rolledNumber} ထွက်သည်။`;
      }
    } else if (selectedPick === 'small') {
      toastMessage = SMALL_DIGITS.includes(rolledNumber)
        ? `🎉 သင်အနိုင်ရသည်! (Small: 0-4) ထွက်လာသော ဂဏန်း: ${rolledNumber}. ${winAmount} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolledNumber}.`;
      displayMessage = SMALL_DIGITS.includes(rolledNumber)
        ? `သင်နိုင်ပါသည်! (Small: 0-4) ${rolledNumber} ထွက်ပါသည်။ ${winAmount} MMK အနိုင်ရသည်။`
        : `ရှုံးပါသည်။ ${rolledNumber} ထွက်သည်။`;
    } else if (selectedPick === 'big') {
      toastMessage = BIG_DIGITS.includes(rolledNumber)
        ? `🎉 သင်အနိုင်ရသည်! (Big: 6-9) ထွက်လာသော ဂဏန်း: ${rolledNumber}. ${winAmount} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolledNumber}.`;
      displayMessage = BIG_DIGITS.includes(rolledNumber)
        ? `သင်နိုင်ပါသည်! (Big: 6-9) ${rolledNumber} ထွက်ပါသည်။ ${winAmount} MMK အနိုင်ရသည်။`
        : `ရှုံးပါသည်။ ${rolledNumber} ထွက်သည်။`;
    } else if (selectedPick === 'middle') {
      toastMessage = rolledNumber === 5
        ? `🎉 သင်အနိုင်ရသည်! Middle Digit 5 ထွက်! ${winAmount} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolledNumber}.`;
      displayMessage = rolledNumber === 5
        ? `သင်နိုင်ပါသည်! Middle Digit 5 ထွက်ပါသည်။ ${winAmount} MMK အနိုင်ရသည်။`
        : `ရှုံးပါသည်။ ${rolledNumber} ထွက်သည်။`;
    } else if (selectedPick === 'even') {
      toastMessage = EVEN_DIGITS.includes(rolledNumber)
        ? `🎉 သင်အနိုင်ရသည်! (Even: 0,2,4,6,8) ထွက်လာသော ဂဏန်း: ${rolledNumber}. ${winAmount} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolledNumber}.`;
      displayMessage = EVEN_DIGITS.includes(rolledNumber)
        ? `သင်နိုင်ပါသည်! (Even: 0,2,4,6,8) ${rolledNumber} ထွက်ပါသည်။ ${winAmount} MMK အနိုင်ရသည်။`
        : `ရှုံးပါသည်။ ${rolledNumber} ထွက်သည်။`;
    } else if (selectedPick === 'odd') {
      toastMessage = ODD_DIGITS.includes(rolledNumber)
        ? `🎉 သင်အနိုင်ရသည်! (Odd: 1,3,5,7,9) ထွက်လာသော ဂဏန်း: ${rolledNumber}. ${winAmount} MMK အနိုင်ရသည်။`
        : `😢 ရှုံးပါသည်။ ထွက်လာသော ဂဏန်း: ${rolledNumber}.`;
      displayMessage = ODD_DIGITS.includes(rolledNumber)
        ? `သင်နိုင်ပါသည်! (Odd: 1,3,5,7,9) ${rolledNumber} ထွက်ပါသည်။ ${winAmount} MMK အနိုင်ရသည်။`
        : `ရှုံးပါသည်။ ${rolledNumber} ထွက်သည်။`;
    }

    setResult(rolledNumber);
    setLastRolledNumbers(prev => [rolledNumber, ...prev.slice(0, 4)]);
    setTotalBet(prev => prev + bet);
    setTotalPaid(prev => prev + (outcomeStatus === 'win' ? winAmount : 0));
    showToast(toastMessage, outcomeStatus);
    setMessage(displayMessage);

    // --- Send Bet to Backend ---
    let betType;
    let digitValue = null; // Renamed to avoid conflict with 'digit' property
    if (typeof selectedPick === 'number') {
      betType = 'digit';
      digitValue = selectedPick;
    } else {
      betType = selectedPick;
    }

    const beforeBalance = Number(user?.balance || 0);
    const afterBalance = beforeBalance - bet + (winAmount || 0);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/digit-slot/bet`, {
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
              digit: digitValue, // Use the renamed variable
              bet_amount: bet,
              rolled_number: rolledNumber,
              win_amount: winAmount,
              profit: winAmount - bet,
              status: 'settled',
              bet_time: new Date().toISOString(),
              outcome: outcomeStatus,
              before_balance: beforeBalance,
              after_balance: afterBalance
            }
          ]
        }),
      });
      const data = await response.json();
      if (data && data.data && typeof data.data.balance !== 'undefined' && setUser) {
        setUser(u => ({ ...u, balance: data.data.balance }));
      } else {
         // Handle backend success but no balance update (e.g., if API response format changes)
         console.warn("Bet placed, but balance update not received from backend:", data);
      }
    } catch (err) {
      console.error("Failed to send bet to backend:", err);
      showToast('⚠️ Bet recording failed. Please check connection.', 'error');
    } finally {
      setTimeout(() => {
        setGameRunning(false);
        runCountdown();
      }, GAME_RESULT_DISPLAY_TIME);
    }
  }, [bet, user, winStreak, totalBet, totalPaid, showToast, runCountdown, setUser]); // Dependencies for useCallback

  // --- Effects ---
  useEffect(() => {
    // Initial game start and jackpot countdown
    runCountdown();
    updateJackpotCountdown();
    jackpotIntervalRef.current = setInterval(updateJackpotCountdown, 1000);

    return () => {
      // Cleanup intervals on component unmount
      clearInterval(countdownIntervalRef.current);
      clearInterval(jackpotIntervalRef.current);
    };
  }, [runCountdown, updateJackpotCountdown]); // Only run once on mount

  const handleBetAmountSelect = useCallback((val) => {
    setBet(val);
    sfx.click.play();
  }, []);

  const handlePick = useCallback((val) => {
    setPick(val);
    sfx.bet.play();
  }, []);

  const rtpPercentage = totalBet > 0 ? ((totalPaid / totalBet) * 100).toFixed(2) : "---";

  return (
    <div className="p-1 rounded-2xl w-full min-h-screen text-center bg-[#15192c] text-white font-inter flex flex-col items-center">
      {/* Header */}
      {/* <div className="w-full flex justify-between items-center p-2 mb-4 bg-gray-900 rounded-lg shadow-md">
        <div className="px-3 py-1 bg-gray-800 rounded-md text-sm">{user?.user_name || 'User Name'}</div>
        <div className="px-3 py-1 bg-[#0ea5e9] rounded-md text-sm font-bold shadow border-2 border-cyan-400">Balance: <span className="font-extrabold">{Number(user?.balance || 0).toFixed(2)}</span> MMK</div>
        <div className="px-3 py-1 bg-gray-800 rounded-md text-sm">Log</div>
      </div> */}

     
      {/* BET AMOUNT Panel (Pragmatic Style, Auto-spin) */}
<div className="w-full max-w-xs mx-auto rounded-xl bg-[#181c36] border-2 border-[#22225c] shadow-xl p-4 mb-6">
  <div className="flex justify-between items-center">
    <span className="text-base text-gray-200 font-bold">BET</span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          const idx = BET_AMOUNTS.indexOf(bet);
          if (idx > 0) setBet(BET_AMOUNTS[idx - 1]);
          sfx.click.play();
        }}
        className="w-8 h-8 text-xl bg-gray-700 text-cyan-200 rounded-lg flex items-center justify-center"
        disabled={bet === BET_AMOUNTS[0]}
      >-</button>
      <span className="mx-2 text-xl text-cyan-300 font-bold">{bet.toLocaleString()} <span className="text-sm">MMK</span></span>
      <button
        onClick={() => {
          const idx = BET_AMOUNTS.indexOf(bet);
          if (idx < BET_AMOUNTS.length - 1) setBet(BET_AMOUNTS[idx + 1]);
          sfx.click.play();
        }}
        className="w-8 h-8 text-xl bg-gray-700 text-cyan-200 rounded-lg flex items-center justify-center"
        disabled={bet === BET_AMOUNTS[BET_AMOUNTS.length - 1]}
      >+</button>
      <button
        onClick={() => { setBet(BET_AMOUNTS[BET_AMOUNTS.length-1]); sfx.click.play(); }}
        className="ml-3 px-3 py-1 rounded-lg bg-yellow-400 text-black font-bold shadow"
      >BET MAX</button>
    </div>
  </div>
  <div className="mt-3 flex justify-between items-center">
    <div>
      <span className="text-sm text-gray-300">ဂဏန်း/အုပ်စု</span>
      <div className="text-base font-bold text-white">
        {typeof pick === "number"
          ? pick
          : pick === "small" ? "Small (0-4)"
          : pick === "big" ? "Big (6-9)"
          : pick === "middle" ? "Middle (5)"
          : pick === "even" ? "Even (0,2,4,6,8)"
          : pick === "odd" ? "Odd (1,3,5,7,9)"
          : "-"}
      </div>
    </div>
    <div>
      <span className="text-sm text-gray-300 block">အနိုင်ရငွေ</span>
      <span className="text-lg font-bold text-gray-300">
        {lastRolledNumbers && lastRolledNumbers.length > 0 && result !== null ? (getPayoutFor(result, pick, bet).toLocaleString()) : "0"} MMK
      </span>
    </div>
  </div>
</div>

      {/* Bet Amount Info */}
      {/* <div className="w-full flex flex-col items-center mb-2">
        <span className="text-sm text-cyan-300 font-semibold">Selected Bet: <span className="text-lg text-cyan-400 font-bold">{bet.toLocaleString()} MMK</span></span>
        <span className="text-xs text-gray-400 mt-1">Your selected bet will be used for the <span className="font-semibold text-yellow-300">next round</span>.</span>
        {bettingOpen ? (
          <span className="text-xs text-green-400">Betting is open! Place your bet now.</span>
        ) : (
          <span className="text-xs text-gray-400">You can change the bet amount anytime before the next round starts.</span>
        )}
      </div> */}

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
      {/* <div className="my-8 w-64 h-64 bg-[#181d32] rounded-full flex flex-col items-center justify-center relative overflow-hidden text-green-400 font-extrabold text-7xl shadow-2xl border-4 border-cyan-500 border-dashed">
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
        {countdown > 0 && (
          <motion.p
            className="absolute bottom-4 text-base text-yellow-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {bettingOpen ? `Betting ends in: ${countdown}s` : `Game start in: ${countdown}s`}
          </motion.p>
        )}
      </div> */}

<div className="my-6 w-32 h-32 bg-[#181d32] rounded-full flex flex-col items-center justify-center relative overflow-hidden text-green-400 font-extrabold text-5xl shadow-2xl border-4 border-cyan-500 border-dashed">
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
      <span className="text-5xl font-extrabold text-green-400 drop-shadow-2xl">
        {result !== null ? result : '?'}
      </span>
    </motion.div>
  </AnimatePresence>
  {countdown > 0 && (
    <motion.p
      className="absolute bottom-2 text-sm text-yellow-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {bettingOpen ? `Betting ends in: ${countdown}s` : `Game start in: ${countdown}s`}
    </motion.p>
  )}
</div>


      {/* Bet Open Message */}
      {bettingOpen && (
        <motion.p
          className="mb-4 text-green-400 text-lg animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >💸 လောင်းကြေးတင်နိုင်ပါပြီ! {countdown} စက္ကန့်အတွင်း ထိုးပါ!</motion.p>
      )}

      {/* Digits and Group Buttons */}
      <div className="w-full mb-8 max-w-xl">
  <h4 className="text-base font-semibold text-gray-300 mb-2">
    <span className="text-yellow-300">{user?.user_name || 'User Name'} - </span>
    {/* balance */}
    <span className="text-white"> MMK: {user?.balance || 0} </span>
  </h4>
  <div className="grid grid-cols-5 gap-2 mb-3">
    {[...Array(10).keys()].map(d => (
      <button
        key={d}
        onClick={() => handlePick(d)}
        className={`p-1 rounded-md font-bold text-base transition-all duration-150 shadow ${
          typeof pick === 'number' && pick === d
            ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 scale-105'
            : 'bg-gray-800 text-cyan-200 hover:bg-cyan-500 hover:text-white border border-gray-700'
        } ${!bettingOpen || gameRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ minWidth: 34, minHeight: 34 }}
        disabled={!bettingOpen || gameRunning}
      >{d}</button>
    ))}
  </div>
  <div className="grid grid-cols-3 gap-2 mb-3">
    <button
      onClick={() => handlePick('small')}
      className={`p-1 rounded-md font-bold text-base transition-all duration-150 shadow ${
        pick === 'small'
          ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 scale-105'
          : 'bg-gray-800 text-cyan-200 hover:bg-cyan-500 hover:text-white border border-gray-700'
      } ${!bettingOpen || gameRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ minWidth: 64, minHeight: 34 }}
      disabled={!bettingOpen || gameRunning}
    >Small</button>
    <button
      onClick={() => handlePick('middle')}
      className={`p-1 rounded-md font-bold text-base transition-all duration-150 shadow ${
        pick === 'middle'
          ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 scale-105'
          : 'bg-gray-800 text-cyan-200 hover:bg-cyan-500 hover:text-white border border-gray-700'
      } ${!bettingOpen || gameRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ minWidth: 64, minHeight: 34 }}
      disabled={!bettingOpen || gameRunning}
    >Middle (5)</button>
    <button
      onClick={() => handlePick('big')}
      className={`p-1 rounded-md font-bold text-base transition-all duration-150 shadow ${
        pick === 'big'
          ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 scale-105'
          : 'bg-gray-800 text-cyan-200 hover:bg-cyan-500 hover:text-white border border-gray-700'
      } ${!bettingOpen || gameRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ minWidth: 64, minHeight: 34 }}
      disabled={!bettingOpen || gameRunning}
    >Big (6-9)</button>
  </div>
  <div className="grid grid-cols-2 gap-2 mb-3">
    <button
      onClick={() => handlePick('even')}
      className={`p-1 rounded-md font-bold text-base transition-all duration-150 shadow ${
        pick === 'even'
          ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 scale-105'
          : 'bg-gray-800 text-cyan-200 hover:bg-cyan-500 hover:text-white border border-gray-700'
      } ${!bettingOpen || gameRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ minWidth: 64, minHeight: 34 }}
      disabled={!bettingOpen || gameRunning}
    >Even (0,2,4,6,8)</button>
    <button
      onClick={() => handlePick('odd')}
      className={`p-1 rounded-md font-bold text-base transition-all duration-150 shadow ${
        pick === 'odd'
          ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 scale-105'
          : 'bg-gray-800 text-cyan-200 hover:bg-cyan-500 hover:text-white border border-gray-700'
      } ${!bettingOpen || gameRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ minWidth: 64, minHeight: 34 }}
      disabled={!bettingOpen || gameRunning}
    >Odd (1,3,5,7,9)</button>
  </div>
</div>


      {/* Last Wins */}
      <div className="w-full max-w-xs flex justify-center items-center gap-2 mb-6">
        <p className="text-lg font-semibold text-gray-300">last won prize number</p>
        <div className="flex space-x-1">
          {lastRolledNumbers.map((num, idx) => (
            <span key={idx} className="w-8 h-8 flex items-center justify-center bg-black rounded-full text-white font-bold text-lg">{num}</span>
          ))}
        </div>
      </div>
      {/* RTP Marquee */}
      <style>{`
        @keyframes marquee {0%{transform:translateX(100%);}100%{transform:translateX(-100%);}}
        .animate-marquee {animation: marquee 15s linear infinite;}
      `}</style>
      <div className="w-full my-2 bg-gray-800 p-2 rounded-lg shadow-md overflow-hidden">
        <p className="text-sm text-yellow-300 whitespace-nowrap animate-marquee">
          🎉 သာမန်ကစားသမားများ: အနည်းဆုံးလောင်းကြေး 10 MMK | RTP: {rtpPercentage}% | ယနေ့ Jackpot: {jackpot} MMK
        </p>
      </div>
      {/* Jackpot Info */}
      <div className="w-full flex justify-around items-center my-4 p-2 bg-gray-800 rounded-lg shadow-md">
        <div className="text-lg font-bold text-teal-300">Jackpot: {jackpot.toLocaleString()} MMK</div>
        <div className="text-lg font-bold text-blue-300">Next Jackpot: {nextJackpotCountdown}</div>
      </div>
      {/* RTP Display */}
      <div className="w-full flex justify-around items-center my-2 p-2 bg-gray-700 rounded-lg shadow-md">
        <div className="text-base text-green-300">Total Bet: {totalBet.toLocaleString()} MMK</div>
        <div className="text-base text-pink-300">Total Paid: {totalPaid.toLocaleString()} MMK</div>
        <div className="text-base text-yellow-300 font-bold">RTP: {rtpPercentage}%</div>
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