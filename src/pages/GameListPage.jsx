import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi';
import GameList from '../components/GameList';
import { AuthContext } from '../contexts/AuthContext';

const GameListPage = () => {
  const { gameTypeId, productId } = useParams();
  const { apiCall } = useApi();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // New for launch modal
  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchError, setLaunchError] = useState(null);

  useEffect(() => {
    setGames([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(true);
    apiCall(`/game_lists/${gameTypeId}/${productId}?page=1`)
      .then(res => {
        if (res && res.data) {
          setGames(res.data.map(g => ({
            ...g,
            name: g.game_name,
            img: g.image_url,
          })));
          setHasMore(res.data.length === 20);
        } else {
          setGames([]);
          setHasMore(false);
        }
      })
      .catch(e => {
        setError(e.message);
        setGames([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [gameTypeId, productId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    apiCall(`/game_lists/${gameTypeId}/${productId}?page=${nextPage}`)
      .then(res => {
        if (res && res.data) {
          setGames(prev => [
            ...prev,
            ...res.data.map(g => ({
              ...g,
              name: g.game_name,
              img: g.image_url,
            }))
          ]);
          setHasMore(res.data.length === 20);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  };

  // --- GAME LAUNCH HANDLER ---
  const handleLaunchGame = async (game) => {
    console.log('Launch game clicked:', game);
    if (!auth) {
      console.log('User not logged in, redirecting to /login');
      navigate('/login');
      return;
    }
    setLaunchLoading(true);
    setLaunchError(null);

    try {
      const payload = {
        game_code: game.game_code || game.code,
        product_code: game.product_code || productId,
        game_type: game.game_type || gameTypeId, // or from game obj if provided
      };
      console.log('Launching game with payload:', payload);
      const response = await apiCall('/seamless/launch-game', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      console.log('Launch game API response:', response);

      // Backend may return a url or an html content (iframe etc)
      if (response.content) {
        // If backend returns HTML content, open in modal or new tab (e.g. for PGSoft)
        const newWin = window.open();
        newWin.document.write(response.content);
        newWin.document.close();
      } else if (response.url) {
        window.open(response.url, '_blank');
      } else {
        throw new Error('No game URL or content returned');
      }
    } catch (err) {
      setLaunchError(err.message || 'Game launch failed');
      console.error('Launch game error:', err);
    } finally {
      setLaunchLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white text-xl">Loading games...</div>;
  if (error) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-red-400 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {launchLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex flex-col items-center justify-center">
          <div className="bg-white/20 px-10 py-8 rounded-xl text-white shadow-lg text-2xl font-bold mb-4">
            ဂိမ်းဖွင့်နေသည်... (Launching Game)
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-300"></div>
        </div>
      )}
      {launchError && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-lg z-50 font-bold text-lg">
          {launchError}
        </div>
      )}

      <GameList
        games={games}
        categories={[]}
        showSearch={true}
        onGameLaunch={handleLaunchGame}
      />
      {hasMore && (
        <div className="flex justify-center my-8">
          <button
            className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg shadow hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameListPage;
