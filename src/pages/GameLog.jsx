import React from 'react';
import Header from '../components/Header';

const mockLogs = [
  { date: '2024-06-01', game: 'Pragmatic Play', bet: 100, result: '+200' },
  { date: '2024-06-01', game: 'PG Soft', bet: 50, result: '-50' },
  { date: '2024-05-31', game: 'JILI', bet: 200, result: '+100' },
  { date: '2024-05-30', game: 'CQ9', bet: 80, result: '-80' },
];

function GameLog() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4 py-12">
      <Header />
      <div className="bg-black/80 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Game Log</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-white text-center">
            <thead>
              <tr className="bg-white/10">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Game</th>
                <th className="px-4 py-2">Bet</th>
                <th className="px-4 py-2">Win/Loss</th>
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-white/10">
                  <td className="px-4 py-2">{log.date}</td>
                  <td className="px-4 py-2">{log.game}</td>
                  <td className="px-4 py-2">${log.bet}</td>
                  <td className={`px-4 py-2 font-bold ${log.result.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{log.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GameLog; 